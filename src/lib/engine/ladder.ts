import { simulateCore, tippingPointRent } from './engine';
import type { EngineInputs } from './types';

export interface RateRow {
  rate: number;
  /** Rent above which buying wins at this rate, or null if no crossing exists. */
  tippingRent: number | null;
  verdict: 'buy' | 'rent' | 'tie';
  /** Absolute net-worth gap at the user's actual rent. */
  gap: number;
}

/**
 * The rate ladder behind "Rates decide the answer".
 *
 * Expensive: each row runs the tipping-rent solver plus one simulation. Call it
 * from the debounced pass, never on every keystroke.
 *
 * Note this calls `tippingPointRent` directly rather than `analyzeScenario`.
 * The table needs the tipping rent and the verdict, not the sensitivity table,
 * and `analyzeScenario` would compute a full ±1pp sweep for all nine rows that
 * nothing then reads.
 */
export function rateLadder(inputs: EngineInputs, from = 4, to = 8, step = 0.5): RateRow[] {
  const rows: RateRow[] = [];
  // Integer stepping: 4 + 0.5*n accumulates float error and can miss the top row.
  const steps = Math.round((to - from) / step);
  for (let i = 0; i <= steps; i++) {
    const rate = from + i * step;
    const at = { ...inputs, mortgageRatePct: rate };
    const sim = simulateCore(at);
    rows.push({
      rate,
      tippingRent: tippingPointRent(at),
      verdict: sim.verdict,
      gap: Math.abs(sim.difference),
    });
  }
  return rows;
}

/** The row to highlight as "your rate" - the closest rung to the real value. */
export function nearestRate(rows: RateRow[], rate: number): RateRow | undefined {
  return rows.reduce<RateRow | undefined>(
    (best, row) =>
      !best || Math.abs(row.rate - rate) < Math.abs(best.rate - rate) ? row : best,
    undefined
  );
}
