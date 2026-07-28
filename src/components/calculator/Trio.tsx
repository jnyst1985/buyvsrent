import type { CoreResults } from '../../lib/engine/types';
import { formatCurrency } from '../../lib/engine/format';

interface Props {
  results: CoreResults;
  tippingRent: number | null;
  homePrice: number;
  currency: string;
  /** True while the debounced pass is recomputing the tipping rent. */
  pending: boolean;
}

const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

export function Trio({ results, tippingRent, homePrice, currency, pending }: Props) {
  const fmt = (v: number) => formatCurrency(v, currency);
  const tie = results.verdict === 'tie';
  const rentWins = results.difference < 0;
  const gap = Math.abs(results.difference);

  const flag = (isWinner: boolean) =>
    tie ? 'Level' : isWinner ? `Ahead by ${round1k(gap)}` : 'Behind';

  return (
    <div class="trio">
      {/* Rent first, always. */}
      <div class={tie || !rentWins ? 'wc' : 'wc win'}>
        <div class="wt">Rent &amp; invest</div>
        <div class="wv tabular">{round1k(results.rentNetWorth)}</div>
        <p class="wp">Your money if the monthly difference is invested, every month.</p>
        <span class={!tie && rentWins ? 'flag' : 'flag q'}>{flag(rentWins)}</span>
      </div>

      <div class={tie || rentWins ? 'wc' : 'wc win'}>
        <div class="wt">Buy</div>
        <div class="wv tabular">{round1k(results.buyNetWorth)}</div>
        <p class="wp">Your money with the equity kept and every cost of owning counted.</p>
        <span class={!tie && !rentWins ? 'flag' : 'flag q'}>{flag(!rentWins)}</span>
      </div>

      {/* Dimmed rather than unmounted while recomputing: collapsing these rows
          mid-recompute was a real layout-shift bug in the old calculator. */}
      <div class="wc tip" style={pending ? { opacity: 0.55 } : undefined}>
        <div class="wt">The tipping point</div>
        <div class="wv tabular">{tippingRent ? `${fmt(tippingRent)} a month` : 'No crossing'}</div>
        <p class="wp">
          {tippingRent
            ? `Pay more than this in rent and buying starts to win - about ${((tippingRent / homePrice) * 100).toFixed(2)}% of the home's value a month.`
            : 'At these numbers there is no rent high enough to flip the answer within the stay.'}
        </p>
      </div>
    </div>
  );
}
