import type { CoreResults } from './types';

export type SegmentKind = 'cost' | 'keep';

export interface Segment {
  name: string;
  /** Dollars per month, averaged over the whole stay. */
  value: number;
  kind: SegmentKind;
  /** Index into the six-step cost ramp; undefined for `keep` segments. */
  rampIndex?: number;
}

export interface Decomposition {
  own: Segment[];
  rent: Segment[];
  /** Both columns total exactly this - see the note below. */
  total: number;
  /** Monthly dollars that stay yours on each path. */
  ownKeeps: number;
  rentKeeps: number;
}

/** Anything under half a dollar a month is noise, not a line item. */
const FLOOR = 0.5;

/**
 * Monthly cash decomposition, averaged over the stay.
 *
 * `results.monthly` is a YEAR-ONE snapshot, which understates every cost that
 * grows (tax, insurance, maintenance, rent) and overstates interest relative to
 * principal. So this works off `results.totals` - whole-stay sums straight from
 * the engine - divided by the number of months.
 *
 * Only recurring monthly cash is included. The down payment, closing costs,
 * selling costs, home-sale tax and security deposit are one-off transfers at
 * the ends of the stay, not part of "an average month".
 *
 * WHY BOTH COLUMNS TOTAL THE SAME: whichever path costs less per month, the
 * person on that path invests the difference - that is the comparison this
 * whole site is built on. So the cheaper column gets an "invested difference"
 * segment equal to the gap, and both sides then total `max(ownSpend,
 * rentSpend)`. The columns differ in how much *stays yours*, not in how much
 * goes out. That identity is the point of the section, not a coincidence, and
 * a test pins it.
 */
export function decomposeMonthly(results: CoreResults, stayYears: number): Decomposition {
  const months = Math.max(1, Math.round(stayYears * 12));
  const t = results.totals;
  const per = (v: number) => v / months;

  // Interest is quoted net of tax savings, because the savings only exist as a
  // reduction of the interest cost - showing them as a separate negative
  // segment would need a bar that can go backwards.
  const taxSaved = per(t.buy.totalTaxSavings);
  const interest = per(t.buy.totalInterest) - taxSaved;

  // Annotated before .filter(): a bare literal widens `kind` to string, which
  // then will not narrow back to SegmentKind through the filter.
  const ownAll: Segment[] = [
    {
      name: taxSaved > FLOOR ? 'Mortgage interest, after tax savings' : 'Mortgage interest',
      value: interest,
      kind: 'cost',
    },
    { name: 'Property tax', value: per(t.buy.totalPropertyTax), kind: 'cost' },
    { name: 'Maintenance', value: per(t.buy.totalMaintenance), kind: 'cost' },
    { name: 'Home insurance', value: per(t.buy.totalInsurance), kind: 'cost' },
    { name: 'HOA', value: per(t.buy.totalHoa), kind: 'cost' },
    { name: 'Mortgage insurance', value: per(t.buy.totalPmi), kind: 'cost' },
    { name: 'Principal - stays yours', value: per(t.buy.totalPrincipal), kind: 'keep' },
  ];
  const own = ownAll.filter((s) => s.value > FLOOR);

  const rentAll: Segment[] = [
    { name: 'Rent', value: per(t.rent.totalRent), kind: 'cost' },
    { name: "Renter's insurance", value: per(t.rent.totalRentersInsurance), kind: 'cost' },
  ];
  const rent = rentAll.filter((s) => s.value > FLOOR);

  const sum = (segs: Segment[]) => segs.reduce((a, s) => a + s.value, 0);
  const ownSpend = sum(own);
  const rentSpend = sum(rent);
  const gap = Math.abs(ownSpend - rentSpend);

  if (gap > FLOOR) {
    const invested: Segment = {
      name: 'Invested difference - stays yours',
      value: gap,
      kind: 'keep',
    };
    if (ownSpend > rentSpend) rent.push(invested);
    else own.push(invested);
  }

  // Assign ramp shades in order of appearance, per column.
  for (const segs of [own, rent]) {
    let i = 0;
    for (const s of segs) if (s.kind === 'cost') s.rampIndex = i++ % 6;
  }

  const keeps = (segs: Segment[]) => sum(segs.filter((s) => s.kind === 'keep'));

  return {
    own,
    rent,
    total: Math.max(ownSpend, rentSpend),
    ownKeeps: keeps(own),
    rentKeeps: keeps(rent),
  };
}

/** Segments below this share of the total are dropped from the bar (kept in the legend). */
export const DRAW_FLOOR = 0.015;

/**
 * Widths for one bar. Segments too thin to see are dropped, and the survivors
 * are scaled to fill the bar exactly - otherwise the bar shows a ragged gap
 * that reads as a rendering bug. The legend keeps the true values.
 */
export function barWidths(segs: Segment[], total: number) {
  const drawn = segs.filter((s) => s.value / total >= DRAW_FLOOR);
  const drawnSum = drawn.reduce((a, s) => a + s.value, 0) || 1;
  return drawn.map((s) => ({
    seg: s,
    /** Percent of the bar. */
    width: (s.value / drawnSum) * 100,
    /** True share of the monthly total, for the label and tooltip. */
    share: (s.value / total) * 100,
  }));
}
