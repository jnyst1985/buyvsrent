import { useState } from 'preact/hooks';
import type { EngineResults } from '../../lib/engine/types';
import { formatCompact } from '../../lib/engine/format';

interface Props {
  results: EngineResults;
  currency: string;
}

export function YearTable({ results, currency }: Props) {
  const [open, setOpen] = useState(false);
  const fmt = (v: number) => formatCompact(v, currency);

  return (
    <section>
      <button
        type="button"
        class="flex items-center gap-2 text-sm font-medium text-buy underline underline-offset-2"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? 'Hide the year-by-year table' : 'Show every year in a table'}
      </button>
      {open && (
        <div class="mt-3 overflow-x-auto">
          <table class="w-full min-w-95 text-sm">
            <thead>
              <tr class="border-b-2 border-hairline text-left text-ink">
                <th class="py-1.5 pr-3 font-semibold">Year</th>
                <th class="py-1.5 pr-3 text-right font-semibold">Buying</th>
                <th class="py-1.5 pr-3 text-right font-semibold">Renting</th>
                <th class="py-1.5 text-right font-semibold">Gap</th>
              </tr>
            </thead>
            <tbody>
              {results.years.map((y) => {
                const gap = y.buyNetWorth - y.rentNetWorth;
                return (
                  <tr key={y.year} class="border-b border-hairline">
                    <td class="py-1.5 pr-3 text-ink-secondary tabular">{y.year}</td>
                    <td class="py-1.5 pr-3 text-right text-ink tabular">{fmt(y.buyNetWorth)}</td>
                    <td class="py-1.5 pr-3 text-right text-ink tabular">{fmt(y.rentNetWorth)}</td>
                    <td class="py-1.5 text-right tabular">
                      <span
                        class={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${gap >= 0 ? 'bg-buy-soft text-buy' : 'bg-rent-soft text-rent'}`}
                      >
                        {gap >= 0 ? 'Buy' : 'Rent'} +{fmt(Math.abs(gap))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p class="mt-2 text-xs text-ink-muted">
            Net worth if you cashed out that year: home equity minus selling costs and taxes on the
            buying side, portfolio after capital-gains tax plus returned deposit on the renting
            side.
          </p>
        </div>
      )}
    </section>
  );
}
