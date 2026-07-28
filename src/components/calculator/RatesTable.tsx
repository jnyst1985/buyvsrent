import type { RateRow } from '../../lib/engine/ladder';
import { nearestRate } from '../../lib/engine/ladder';
import { formatCurrency } from '../../lib/engine/format';

interface Props {
  rows: RateRow[];
  /** The user's actual rate - decides which rung is highlighted. */
  rate: number;
  homePrice: number;
  currency: string;
}

export function RatesTable({ rows, rate, homePrice, currency }: Props) {
  const fmt = (v: number) => formatCurrency(v, currency);
  const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');
  const yours = nearestRate(rows, rate);

  const outcome = (row: RateRow) =>
    row.verdict === 'tie'
      ? 'Too close'
      : row.verdict === 'rent'
        ? `Rent & invest by ${round1k(row.gap)}`
        : `Buying by ${round1k(row.gap)}`;

  return (
    <>
      {/* 4 columns with one row that matters: below 700px each row becomes its
          own block via data-label rather than scrolling sideways, which slices
          the last column mid-word and reads as broken. */}
      <div class="rwrap">
        <table class="rtable">
          <thead>
            <tr>
              <th scope="col">Mortgage rate</th>
              <th scope="col" class="num">
                Buying wins above
              </th>
              <th scope="col" class="num">
                As % of home value / mo
              </th>
              <th scope="col" class="num">
                At your rent, who wins
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isYours = row === yours;
              return (
                <tr key={row.rate} class={isYours ? 'you' : undefined}>
                  <td>
                    {row.rate.toFixed(2)}%
                    {isYours && <span class="youtag">your rate</span>}
                  </td>
                  <td class="num" data-label="Buying wins above">
                    {row.tippingRent ? `${fmt(row.tippingRent)}/mo` : 'never'}
                  </td>
                  <td class="num" data-label="As % of home value">
                    {row.tippingRent
                      ? `${((row.tippingRent / homePrice) * 100).toFixed(2)}%`
                      : '-'}
                  </td>
                  <td class="num" data-label="At your rent">
                    {outcome(row)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p class="racenote">
        Percentages are the tipping rent divided by the home price, not by the loan - a distinction
        worth keeping straight, since the two differ by the size of your down payment.
      </p>
    </>
  );
}
