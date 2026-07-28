import { describe, expect, it } from 'vitest';
import { DEFAULT_INPUTS } from './defaults';
import { nearestRate, rateLadder } from './ladder';

describe('rate ladder', () => {
  const rows = rateLadder(DEFAULT_INPUTS);

  it('includes both endpoints without float drift', () => {
    // The mock accumulated `r += 0.5`, which can overshoot and lose the last
    // rung. Integer stepping keeps 8.00 in.
    expect(rows).toHaveLength(9);
    expect(rows.map((r) => r.rate)).toEqual([4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8]);
  });

  it('agrees with the figures published in page copy', () => {
    const at = (rate: number) => rows.find((r) => r.rate === rate)!;
    expect(Math.round(at(4).tippingRent!)).toBe(1890);
    expect(Math.round(at(5).tippingRent!)).toBe(2117);
    expect(Math.round(at(6).tippingRent!)).toBe(2350);
    expect(Math.round(at(6.5).tippingRent!)).toBe(2468);
    expect(Math.round(at(7).tippingRent!)).toBe(2587);
    expect(Math.round(at(8).tippingRent!)).toBe(2829);
  });

  it('rises monotonically with the rate', () => {
    const tips = rows.map((r) => r.tippingRent!).filter((t) => t != null);
    for (let i = 1; i < tips.length; i++) expect(tips[i]).toBeGreaterThan(tips[i - 1]);
  });

  it('flips verdict across the crossover at the default rent', () => {
    const verdictAt = (rate: number) => rows.find((r) => r.rate === rate)!.verdict;
    expect(verdictAt(4)).toBe('buy');
    expect(verdictAt(5)).toBe('rent');
    expect(verdictAt(8)).toBe('rent');
  });

  it('picks the closest rung as "your rate", including exact hits and midpoints', () => {
    expect(nearestRate(rows, 6.5)!.rate).toBe(6.5);
    expect(nearestRate(rows, 6.6)!.rate).toBe(6.5);
    expect(nearestRate(rows, 6.8)!.rate).toBe(7);
    // Off the ends, clamp to the nearest rung rather than returning nothing.
    expect(nearestRate(rows, 1)!.rate).toBe(4);
    expect(nearestRate(rows, 30)!.rate).toBe(8);
  });

  it('returns undefined for an empty ladder rather than throwing', () => {
    expect(nearestRate([], 6.5)).toBeUndefined();
  });
});
