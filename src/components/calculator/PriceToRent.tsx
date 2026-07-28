import { useState } from 'preact/hooks';
import { formatCurrency } from '../../lib/engine/format';
import { SliderField } from './fields';

/** Price-to-rent ratio: home price ÷ annual rent, with interpretation bands. */
export default function PriceToRent() {
  const [homePrice, setHomePrice] = useState(420_000);
  const [monthlyRent, setMonthlyRent] = useState(2100);

  const ratio = homePrice / (monthlyRent * 12);
  const monthlyPct = (monthlyRent / homePrice) * 100;

  const band =
    ratio < 15
      ? { label: 'Favors buying', tone: 'border-primary-deep', note: 'Rents are high relative to prices — ownership tends to pay off here.' }
      : ratio <= 20
        ? { label: 'Could go either way', tone: 'border-hairline', note: 'The classic gray zone — stay length, rates, and your investment return decide it.' }
        : { label: 'Favors renting', tone: 'border-primary-deep', note: 'Prices are high relative to rents — investing the difference tends to win.' };

  return (
    <div class="rounded-xl border border-hairline bg-white p-5">
      <SliderField
        id="ptr-price"
        label="Home price"
        value={homePrice}
        min={50_000}
        max={2_000_000}
        step={5_000}
        prefix="$"
        onInput={setHomePrice}
      />
      <SliderField
        id="ptr-rent"
        label="Rent for a similar home"
        value={monthlyRent}
        min={200}
        max={10_000}
        step={25}
        prefix="$"
        suffix="/mo"
        onInput={setMonthlyRent}
      />
      <div class={`mt-4 rounded-lg border-2 p-4 ${band.tone}`} aria-live="polite">
        <p class="text-lg font-bold text-ink">
          Price-to-rent ratio: <span class="tabular">{ratio.toFixed(1)}</span>{' '}
          <span class="font-normal text-body">— {band.label.toLowerCase()}</span>
        </p>
        <p class="mt-1 text-sm text-body">
          {formatCurrency(homePrice)} ÷ ({formatCurrency(monthlyRent)} × 12). Monthly rent is{' '}
          <strong class="text-ink">{monthlyPct.toFixed(2)}%</strong> of the price. {band.note}
        </p>
        <p class="mt-2 text-xs text-lose">
          Bands: under 15 favors buying · 15–20 mixed · over 20 favors renting.{' '}
          <a href="/" class="underline underline-offset-2">
            The full calculator
          </a>{' '}
          replaces the rule of thumb with your actual numbers.
        </p>
      </div>
    </div>
  );
}
