import type { SensitivityRow } from '../../lib/engine/types';
import { formatCompact } from '../../lib/engine/format';

interface Props {
  /** Null only before the first analysis lands; kept populated afterwards. */
  sensitivity: SensitivityRow[] | null;
  difference: number;
  currency: string;
  /** True while a fresh analysis computes; the last table stays, dimmed. */
  analysisPending: boolean;
}

/**
 * The honesty feature: shows how the final gap moves if each key assumption
 * is off by one percentage point, and flags assumptions that flip the verdict.
 */
export function Sensitivity({ sensitivity, difference, currency, analysisPending }: Props) {
  // Skeleton only before the first analysis ever lands. Once we have data we
  // keep the last table on screen and dim it during recomputes (see below),
  // rather than swapping back to the skeleton and shifting the layout.
  if (sensitivity === null) {
    return (
      <section aria-labelledby="sensitivity-heading">
        <h2 id="sensitivity-heading" class="mb-1 font-semibold text-ink">
          How solid is this answer?
        </h2>
        <div class="h-40 animate-pulse rounded-lg bg-surface-raised" aria-hidden="true" />
      </section>
    );
  }
  const anyFlips = sensitivity.some((s) => s.flips);

  return (
    <section aria-labelledby="sensitivity-heading">
      <h2 id="sensitivity-heading" class="mb-1 font-semibold text-ink">
        How solid is this answer?
      </h2>
      <p class="mb-3 text-sm text-ink-secondary">
        Final gap (buying − renting) if each assumption moves by one percentage point:
      </p>
      <div
        class={`overflow-x-auto transition-opacity duration-200 ${analysisPending ? 'opacity-50' : 'opacity-100'}`}
      >
        <table class="w-full min-w-105 text-sm">
          <thead>
            <tr class="border-b-2 border-hairline text-left text-ink">
              <th class="py-1.5 pr-3 font-semibold">Assumption</th>
              <th class="py-1.5 pr-3 text-right font-semibold">1pt lower</th>
              <th class="py-1.5 pr-3 text-right font-semibold">Your input</th>
              <th class="py-1.5 text-right font-semibold">1pt higher</th>
            </tr>
          </thead>
          <tbody>
            {sensitivity.map((s) => (
              <tr key={s.key} class="border-b border-hairline">
                <td class="py-1.5 pr-3 text-ink-secondary">
                  {s.label}
                  {s.flips && (
                    <span class="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                      flips the verdict
                    </span>
                  )}
                </td>
                <td class="py-1.5 pr-3 text-right text-ink tabular">
                  {signed(s.minusOne, currency)}
                </td>
                <td class="py-1.5 pr-3 text-right text-ink-muted tabular">
                  {signed(difference, currency)}
                </td>
                <td class="py-1.5 text-right text-ink tabular">{signed(s.plusOne, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p
        class={`mt-2 text-xs text-ink-muted transition-opacity duration-200 ${analysisPending ? 'opacity-50' : 'opacity-100'}`}
      >
        {anyFlips
          ? 'At least one assumption can flip this result by itself — treat the verdict as a lean, not a law.'
          : 'No single assumption flips this result by one point — the verdict is fairly robust for your inputs.'}
      </p>
    </section>
  );
}

function signed(v: number, currency: string): string {
  const compact = formatCompact(Math.abs(v), currency);
  return v >= 0 ? `Buy +${compact}` : `Rent +${compact}`;
}
