import type { CoreResults, EngineInputs } from '../../lib/engine/types';
import { formatCurrency } from '../../lib/engine/format';
import { MoneyField, NumField } from './inputs';

/** Ranges for the four hero fields. Wider than the sliders on purpose. */
export const HERO_LIMITS = {
  monthlyRent: [1, 100_000],
  homePrice: [1_000, 100_000_000],
  mortgageRatePct: [0, 25],
  timeHorizonYears: [1, 50],
} as const;

interface Props {
  inputs: EngineInputs;
  results: CoreResults;
  /**
   * Monthly amount the cheaper path invests, averaged over the stay. Passed in
   * rather than derived here so it is the SAME number the money-decomposition
   * section shows. Quoting year-one here instead would put $952 in the hero
   * against $810 further down with nothing reconciling them.
   */
  investedMonthly: number;
  onChange: (patch: Partial<EngineInputs>) => void;
  /** Scrolls to the "Change every assumption" section. */
  onCustomize: () => void;
}

export function ConverterCard({ inputs, results, investedMonthly, onChange, onCustomize }: Props) {
  const fmt = (v: number) => formatCurrency(v, inputs.currency);
  /** Net-worth figures are quoted to the nearest $1,000 - the model is not precise to the dollar. */
  const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

  const tie = results.verdict === 'tie';
  const rentWins = results.difference < 0;
  const gap = Math.abs(results.difference);
  const winnerNetWorth = rentWins ? results.rentNetWorth : results.buyNetWorth;

  return (
    <div class="conv">
      <div class="pair">
        <div>
          <div class="flabel">You pay in rent</div>
          <MoneyField
            id="i_rent"
            value={inputs.monthlyRent}
            min={HERO_LIMITS.monthlyRent[0]}
            max={HERO_LIMITS.monthlyRent[1]}
            unit="a month"
            ariaLabel="Monthly rent"
            onChange={(monthlyRent) => onChange({ monthlyRent })}
          />
        </div>
        <div>
          <div class="flabel">Or you buy at</div>
          <MoneyField
            id="i_price"
            value={inputs.homePrice}
            min={HERO_LIMITS.homePrice[0]}
            max={HERO_LIMITS.homePrice[1]}
            ariaLabel="Price of the home"
            onChange={(homePrice) => onChange({ homePrice })}
          />
        </div>
      </div>

      <div class="conn">
        <NumField
          id="i_rate"
          label="Mortgage rate"
          suffix="%"
          decimals={2}
          value={inputs.mortgageRatePct}
          min={HERO_LIMITS.mortgageRatePct[0]}
          max={HERO_LIMITS.mortgageRatePct[1]}
          ariaLabel="Mortgage rate percent"
          onChange={(mortgageRatePct) => onChange({ mortgageRatePct })}
        />
        <NumField
          id="i_stay"
          label="Length of stay"
          suffix="years"
          value={inputs.timeHorizonYears}
          min={HERO_LIMITS.timeHorizonYears[0]}
          max={HERO_LIMITS.timeHorizonYears[1]}
          ariaLabel="Length of stay in years"
          onChange={(timeHorizonYears) => onChange({ timeHorizonYears })}
        />
      </div>

      <div class="flabel">
        {!tie && <span class="wintag">{rentWins ? 'Renting wins' : 'Buying wins'}</span>}
        <span>
          {tie ? 'Both paths land in the same place - you would have' : 'you would have'}
        </span>
      </div>

      {/* Winner tint and tag are derived every render, so they can never
          disagree with the figure beside them. */}
      <div class={tie ? 'amt out' : 'amt out win'}>
        <span class="pre">$</span>
        <span class="val tabular">
          {(Math.round(winnerNetWorth / 1000) * 1000).toLocaleString('en-US')}
        </span>
        <span class="unit">at year {inputs.timeHorizonYears}</span>
      </div>

      {/* Magnitude sits quiet here because the answer band below states it at 132px. */}
      <span class="badge">
        {tie ? 'Too close to call' : `+${round1k(gap)} vs ${rentWins ? 'buying' : 'renting'}`}
      </span>

      <button class="pill convcta" type="button" onClick={onCustomize}>
        Change every assumption
      </button>

      <p class="fine">
        {investedMonthly > 0 ? (
          <>
            Assumes the <b>{fmt(investedMonthly)} a month</b> difference is invested at{' '}
            {inputs.investmentReturnPct}%, averaged over the stay. Rent must be for a place
            comparable to the home.
          </>
        ) : (
          <>
            At this rent, owning costs less each month than renting - there is no difference left
            to invest.
          </>
        )}
      </p>
    </div>
  );
}
