import { describe, expect, it } from 'vitest';
import { simulate } from './engine';
import { DEFAULT_INPUTS } from './defaults';
import { barWidths, decomposeMonthly, DRAW_FLOOR } from './decompose';

const sum = (segs: { value: number }[]) => segs.reduce((a, s) => a + s.value, 0);
const run = (over: Partial<typeof DEFAULT_INPUTS> = {}) => {
  const inputs = { ...DEFAULT_INPUTS, ...over };
  return { d: decomposeMonthly(simulate(inputs), inputs.timeHorizonYears), inputs };
};

describe('monthly decomposition', () => {
  it('gives both columns an identical total', () => {
    // The page renders "Both bars total the same on purpose" as a claim about
    // the model. If this ever drifts, that copy becomes a lie.
    const { d } = run();
    expect(sum(d.own)).toBeCloseTo(sum(d.rent), 6);
    expect(d.total).toBeCloseTo(sum(d.own), 6);
  });

  it('holds the identity when buying is the cheaper monthly path', () => {
    // Flip which side gets the invested-difference segment: very high rent.
    const { d } = run({ monthlyRent: 9000 });
    expect(sum(d.own)).toBeCloseTo(sum(d.rent), 6);
    expect(d.own.some((s) => s.name.startsWith('Invested difference'))).toBe(true);
    expect(d.rent.some((s) => s.name.startsWith('Invested difference'))).toBe(false);
  });

  it('puts the invested difference on the renter at the defaults', () => {
    const { d } = run();
    expect(d.rent.some((s) => s.name.startsWith('Invested difference'))).toBe(true);
    expect(d.rentKeeps).toBeGreaterThan(d.ownKeeps);
  });

  it('averages over the stay rather than quoting year one', () => {
    // Year-one rent is $2,100; averaged over ten years of 2.5% growth it is
    // materially higher. A year-one bar would understate it.
    const { d } = run();
    const rentSeg = d.rent.find((s) => s.name === 'Rent')!;
    expect(rentSeg.value).toBeGreaterThan(DEFAULT_INPUTS.monthlyRent);
    expect(rentSeg.value).toBeCloseTo(2353, 0);
  });

  it('quotes interest net of tax savings when itemizing', () => {
    const plain = run().d.own.find((s) => s.name.startsWith('Mortgage interest'))!;
    const itemized = run({ itemizeDeductions: true, homePrice: 900000 }).d.own.find((s) =>
      s.name.startsWith('Mortgage interest')
    )!;
    expect(plain.name).toBe('Mortgage interest');
    expect(itemized.name).toBe('Mortgage interest, after tax savings');
  });

  it('scales drawn bar segments to exactly fill the bar', () => {
    const { d } = run();
    for (const segs of [d.own, d.rent]) {
      const widths = barWidths(segs, d.total);
      expect(widths.reduce((a, w) => a + w.width, 0)).toBeCloseTo(100, 6);
    }
  });

  it('drops hairline segments from the bar but keeps them in the legend', () => {
    const { d } = run();
    // Renter's insurance is ~0.5% of the monthly total - too thin to draw.
    const ins = d.rent.find((s) => s.name === "Renter's insurance")!;
    expect(ins.value / d.total).toBeLessThan(DRAW_FLOOR);
    expect(barWidths(d.rent, d.total).map((w) => w.seg.name)).not.toContain("Renter's insurance");
    expect(d.rent.map((s) => s.name)).toContain("Renter's insurance");
  });

  it('assigns cost ramp shades in order and never ramps a keep segment', () => {
    const { d } = run();
    for (const segs of [d.own, d.rent]) {
      const costs = segs.filter((s) => s.kind === 'cost');
      expect(costs.map((s) => s.rampIndex)).toEqual(costs.map((_, i) => i % 6));
      for (const keep of segs.filter((s) => s.kind === 'keep')) {
        expect(keep.rampIndex).toBeUndefined();
      }
    }
  });

  it('omits zero-valued line items entirely', () => {
    const { d } = run(); // defaults have no HOA
    expect(d.own.map((s) => s.name)).not.toContain('HOA');
    expect(run({ hoaMonthly: 300 }).d.own.map((s) => s.name)).toContain('HOA');
  });
});
