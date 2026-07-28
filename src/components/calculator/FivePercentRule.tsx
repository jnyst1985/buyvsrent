import { useState } from 'preact/hooks';
import { formatCurrency } from '../../lib/engine/format';
import { SliderField } from './fields';

/**
 * The 5% rule shortcut: annual unrecoverable ownership cost ≈ rulePct% of home
 * value; divide by 12 and compare with rent. Rate-adjusted per our full model.
 */
export default function FivePercentRule() {
  const [homePrice, setHomePrice] = useState(420_000);
  const [monthlyRent, setMonthlyRent] = useState(2100);
  const [rulePct, setRulePct] = useState(5);

  const threshold = (homePrice * (rulePct / 100)) / 12;
  const rentWins = monthlyRent < threshold;
  const gap = Math.abs(monthlyRent - threshold);

  return (
    <div class="rounded-xl border border-hairline bg-white p-5">
      <SliderField
        id="fp-price"
        label="Home price"
        value={homePrice}
        min={50_000}
        max={2_000_000}
        step={5_000}
        prefix="$"
        onInput={setHomePrice}
      />
      <SliderField
        id="fp-rent"
        label="Rent for a similar home"
        value={monthlyRent}
        min={200}
        max={10_000}
        step={25}
        prefix="$"
        suffix="/mo"
        onInput={setMonthlyRent}
      />
      <SliderField
        id="fp-rule"
        label="Rule percentage"
        value={rulePct}
        min={3}
        max={9}
        step={0.5}
        suffix="%"
        onInput={setRulePct}
        detail={
          <span>
            Classic rule: 5% (built for ~3–4% mortgage eras). At 2026's ~6.5% rates, our full
            model implies ~7–8.5% — see the table below.
          </span>
        }
      />
      <div
        class={`mt-4 rounded-lg border-2 p-4 ${rentWins ? 'border-primary-deep' : 'border-primary-deep'}`}
        aria-live="polite"
      >
        <p class="text-lg font-bold text-ink">
          {rentWins ? 'Renting looks better' : 'Buying looks better'}{' '}
          <span class="font-normal text-body">under the {rulePct}% rule</span>
        </p>
        <p class="mt-1 text-sm text-body">
          Owning ≈ <strong class="text-ink">{formatCurrency(threshold)}/mo</strong> in unrecoverable
          costs vs rent of <strong class="text-ink">{formatCurrency(monthlyRent)}/mo</strong> — a{' '}
          {formatCurrency(gap)}/mo {rentWins ? 'saving for renting' : 'premium for renting'}.
        </p>
        <p class="mt-2 text-xs text-lose">
          This is a 10-second screen, not a verdict —{' '}
          <a href="/" class="underline underline-offset-2">
            run the full month-by-month model
          </a>{' '}
          with your numbers.
        </p>
      </div>
    </div>
  );
}
