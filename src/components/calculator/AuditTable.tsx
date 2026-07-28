import type { CoreResults } from '../../lib/engine/types';

interface Props {
  results: CoreResults;
}

const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

export function AuditTable({ results }: Props) {
  return (
    <>
      {/* Six columns being scanned down, so below 700px the two supporting
          columns drop (.sup) rather than stacking every year into its own
          block - which would be dozens of blocks. */}
      <div class="rwrap">
        <table class="atable">
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col" class="num">
                Rent &amp; invest
              </th>
              <th scope="col" class="num">
                Buy
              </th>
              <th scope="col" class="num">
                Difference
              </th>
              <th scope="col" class="num sup">
                Home value
              </th>
              <th scope="col" class="num sup">
                Loan balance
              </th>
            </tr>
          </thead>
          <tbody>
            {results.years.map((y) => {
              const diff = y.buyNetWorth - y.rentNetWorth;
              return (
                <tr key={y.year}>
                  <td data-label="Year">{y.year}</td>
                  <td class="num" data-label="Rent & invest">
                    {round1k(y.rentNetWorth)}
                  </td>
                  <td class="num" data-label="Buy">
                    {round1k(y.buyNetWorth)}
                  </td>
                  <td class="num" data-label="Difference">
                    {(diff >= 0 ? '+' : '-') + round1k(Math.abs(diff))}
                  </td>
                  <td class="num sup" data-label="Home value">
                    {round1k(y.homeValue)}
                  </td>
                  <td class="num sup" data-label="Loan balance">
                    {round1k(y.loanBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p class="racenote">
        Net worth is what you would hold in cash if you sold up and walked away at the end of that
        year - equity after selling costs and any tax, plus investments after capital gains.
      </p>
    </>
  );
}
