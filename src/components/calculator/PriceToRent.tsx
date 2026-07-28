import { useState } from 'preact/hooks';
import { formatCurrency } from '../../lib/engine/format';
import { SliderField } from './fields';

/** Price-to-rent ratio: home price divided by annual rent, with the bands. */
export default function PriceToRent() {
  const [homePrice, setHomePrice] = useState(420_000);
  const [monthlyRent, setMonthlyRent] = useState(2100);

  const ratio = homePrice / (monthlyRent * 12);
  const monthlyPct = (monthlyRent / homePrice) * 100;
  const fmt = (v: number) => formatCurrency(v);

  const band =
    ratio < 15
      ? {
          label: 'Favours buying',
          note: 'Rents are high relative to prices, so ownership tends to pay off here.',
        }
      : ratio <= 20
        ? {
            label: 'Could go either way',
            note: 'The classic grey zone - stay length, rates and your investment return decide it.',
          }
        : {
            label: 'Favours renting',
            note: 'Prices are high relative to rents, so investing the difference tends to win.',
          };
  // The middle band is genuinely undecided, so it stays neutral rather than
  // borrowing the accent - acid only ever marks a side that is actually ahead.
  const decided = ratio < 15 || ratio > 20;

  return (
    <div class="tool">
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

      <div class="toolout" aria-live="polite">
        <p class="tk">Price-to-rent ratio</p>
        <p class={decided ? 'tnum win' : 'tnum'}>{ratio.toFixed(1)}</p>
        <p class="tv">{band.label}</p>
        <p class="tk" style="margin-top:8px">
          {fmt(homePrice)} divided by ({fmt(monthlyRent)} x 12). Monthly rent is{' '}
          <b>{monthlyPct.toFixed(2)}%</b> of the price. {band.note}
        </p>
        <p class="tfoot">
          Bands: under 15 favours buying, 15 to 20 is mixed, over 20 favours renting.{' '}
          <a href="/">The full calculator</a> replaces the rule of thumb with your actual numbers.
        </p>
      </div>
    </div>
  );
}
