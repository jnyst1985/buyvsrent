import { useRef, useState } from 'preact/hooks';
import { formatCurrency } from '../../lib/engine/format';
import { track } from '../../lib/track';
import { SliderField } from './fields';

/**
 * The 5% rule shortcut: annual unrecoverable ownership cost is roughly
 * rulePct% of home value; divide by 12 and compare with rent.
 *
 * Colour follows the site's winner rule - acid marks whichever path is ahead,
 * never a fixed side - so the tool cannot contradict the calculator's grammar.
 */
export default function FivePercentRule() {
  const [homePrice, setHomePrice] = useState(420_000);
  const [monthlyRent, setMonthlyRent] = useState(2100);
  const [rulePct, setRulePct] = useState(5);

  // One calc_engaged per page load, on the first real input. Simple tools get
  // the engagement event only - field-level detail lives on the main calculator.
  const engaged = useRef(false);
  const wired = (set: (v: number) => void) => (v: number) => {
    if (!engaged.current) {
      engaged.current = true;
      track('calc_engaged', { tool: 'five_percent_rule' });
    }
    set(v);
  };

  const threshold = (homePrice * (rulePct / 100)) / 12;
  const rentWins = monthlyRent < threshold;
  const gap = Math.abs(monthlyRent - threshold);
  const fmt = (v: number) => formatCurrency(v);

  return (
    <div class="tool">
      <SliderField
        id="fp-price"
        label="Home price"
        value={homePrice}
        min={50_000}
        max={2_000_000}
        step={5_000}
        prefix="$"
        onInput={wired(setHomePrice)}
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
        onInput={wired(setMonthlyRent)}
      />
      <SliderField
        id="fp-rule"
        label="Rule percentage"
        value={rulePct}
        min={3}
        max={9}
        step={0.5}
        suffix="%"
        onInput={wired(setRulePct)}
        detail={
          <>
            The classic rule is 5%, built for a 3-4% mortgage era. At 2026 rates the full model
            implies more like 7-8.5% - the table below shows why.
          </>
        }
      />

      <div class="toolout" aria-live="polite">
        <p class="tv">{rentWins ? 'Renting looks better' : 'Buying looks better'}</p>
        <p class="tk">under the {rulePct}% rule, on these numbers</p>
        {/* Acid marks the cheaper of the two paths - the winner rule. It used
            to sit on the gap unconditionally, which painted the difference
            green even when that difference was renting's PENALTY. */}
        <dl class="tsplit">
          <div>
            <dt>Owning, unrecoverable</dt>
            <dd class={rentWins ? undefined : 'win'}>
              {fmt(threshold)}
              <span>/mo</span>
            </dd>
          </div>
          <div>
            <dt>Rent</dt>
            <dd class={rentWins ? 'win' : undefined}>
              {fmt(monthlyRent)}
              <span>/mo</span>
            </dd>
          </div>
          <div>
            <dt>{rentWins ? 'Renting saves' : 'Renting costs'}</dt>
            <dd>
              {fmt(gap)}
              <span>/mo</span>
            </dd>
          </div>
        </dl>
        <p class="tfoot">
          This is a ten-second screen, not a verdict. <a href="/">Run the full month-by-month
          model</a> with your own numbers.
        </p>
      </div>
    </div>
  );
}
