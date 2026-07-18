import type { CoreResults } from '../../lib/engine/types';
import { formatCurrency } from '../../lib/engine/format';

interface Props {
  results: CoreResults;
  currency: string;
}

export function MonthlyCosts({ results, currency }: Props) {
  const m = results.monthly;
  // The engine invests the AFTER-tax-savings difference; quote that number.
  const diff = m.buyTotal - m.taxSavings - m.rentTotal;
  const fmt = (v: number) => formatCurrency(v, currency);

  const allRows: Array<[string, number]> = [
    ['Mortgage (principal + interest)', m.mortgagePayment],
    ['Property tax', m.propertyTax],
    ['Home insurance', m.insurance],
    ['Maintenance', m.maintenance],
    ['HOA', m.hoa],
    ['Mortgage insurance (PMI)', m.pmi],
  ];
  const buyRows = allRows.filter(([, v]) => v > 0.005);

  return (
    <section aria-labelledby="monthly-heading">
      <h2 id="monthly-heading" class="mb-1 font-semibold text-ink">
        What each path costs per month (year 1)
      </h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-hairline p-4">
          <p class="flex items-center gap-1.5 text-sm font-medium text-ink">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-buy" aria-hidden="true" />
            Owning
          </p>
          <dl class="mt-2 space-y-1 text-sm">
            {buyRows.map(([label, v]) => (
              <div key={label} class="flex justify-between gap-3">
                <dt class="text-ink-secondary">{label}</dt>
                <dd class="text-ink tabular">{fmt(v)}</dd>
              </div>
            ))}
            {m.taxSavings > 0.005 && (
              <div class="flex justify-between gap-3">
                <dt class="text-ink-secondary">Tax savings (itemizing)</dt>
                <dd class="text-rent tabular">−{fmt(m.taxSavings)}</dd>
              </div>
            )}
            <div class="flex justify-between gap-3 border-t border-hairline pt-1.5 font-semibold">
              <dt class="text-ink">Total</dt>
              <dd class="text-ink tabular">{fmt(m.buyTotal - m.taxSavings)}</dd>
            </div>
          </dl>
        </div>
        <div class="rounded-lg border border-hairline p-4">
          <p class="flex items-center gap-1.5 text-sm font-medium text-ink">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-rent" aria-hidden="true" />
            Renting
          </p>
          <dl class="mt-2 space-y-1 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-ink-secondary">Rent</dt>
              <dd class="text-ink tabular">{fmt(m.rent)}</dd>
            </div>
            {m.rentersInsurance > 0.005 && (
              <div class="flex justify-between gap-3">
                <dt class="text-ink-secondary">Renter's insurance</dt>
                <dd class="text-ink tabular">{fmt(m.rentersInsurance)}</dd>
              </div>
            )}
            <div class="flex justify-between gap-3 border-t border-hairline pt-1.5 font-semibold">
              <dt class="text-ink">Total</dt>
              <dd class="text-ink tabular">{fmt(m.rentTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p class="mt-3 text-sm text-ink-secondary">
        {diff > 0 ? (
          <>
            Owning costs <strong class="text-ink">{fmt(diff)}</strong> more per month in year 1 —
            in the renting scenario, that difference goes into investments every month. That's the
            "rent <em>and invest the difference</em>" part, and the calculator actually models it.
          </>
        ) : (
          <>
            Renting costs <strong class="text-ink">{fmt(-diff)}</strong> more per month in year 1 —
            so in this scenario the <em>buyer</em> invests the monthly savings. Most calculators
            skip this; we don't.
          </>
        )}
      </p>
    </section>
  );
}
