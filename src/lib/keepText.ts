import { formatCurrency } from './engine/format';
import { encodeParams } from './engine/urlParams';
import type { CoreResults, EngineInputs } from './engine/types';

const SITE = 'https://rentvsbuymath.com';

/** Net worth to the nearest $1,000 - the model is not honest to the dollar. */
const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

/**
 * The scenario as plain text, for pasting into an AI assistant.
 *
 * This replaces the share-image card from the previous design. The point is not
 * decoration: the page cannot know how long someone will really stay or how
 * secure their income is, and handing them a structured prompt lets them take
 * the numbers somewhere that can ask. So the closing section names the model's
 * blind spots explicitly rather than pretending it answered everything.
 */
export function buildKeepText(
  inputs: EngineInputs,
  results: CoreResults,
  tippingRent: number | null,
  investedMonthly: number
): string {
  const fmt = (v: number) => formatCurrency(v, inputs.currency);
  const tie = results.verdict === 'tie';
  const rentWins = results.difference < 0;
  const gap = Math.abs(results.difference);
  const stay = inputs.timeHorizonYears;
  const pad = (label: string) => label.padEnd(21);

  const verdict = tie
    ? 'too close to call'
    : `${rentWins ? 'renting & investing' : 'buying'} ahead by ${round1k(gap)}`;

  return [
    `RENT VS BUY - my scenario (${SITE})`,
    '',
    pad('Monthly rent:') + fmt(inputs.monthlyRent),
    pad('Home price:') + fmt(inputs.homePrice),
    pad('Mortgage rate:') + inputs.mortgageRatePct.toFixed(2) + '%',
    pad('Length of stay:') + stay + ' years',
    '',
    `RESULT AFTER ${stay} YEAR${stay === 1 ? '' : 'S'}`,
    pad('Rent & invest:') + round1k(results.rentNetWorth),
    pad('Buy:') + round1k(results.buyNetWorth),
    pad('Verdict:') + verdict,
    pad('Tipping rent:') +
      (tippingRent
        ? `${fmt(tippingRent)} a month (${((tippingRent / inputs.homePrice) * 100).toFixed(2)}% of home value)`
        : 'no rent high enough to flip it'),
    '',
    'KEY ASSUMPTIONS',
    [
      `Down payment ${inputs.downPaymentPct}%`,
      `investment return ${inputs.investmentReturnPct}%`,
      `home appreciation ${inputs.homeAppreciationPct}%`,
      `rent growth ${inputs.rentIncreasePct}%`,
      `property tax ${inputs.propertyTaxPct}%`,
      `maintenance ${inputs.maintenancePct}%`,
      `selling costs ${inputs.sellingCostPct}%`,
      `inflation ${inputs.inflationPct}%`,
    ].join(' · '),
    investedMonthly > 0
      ? `Assumes the ${fmt(investedMonthly)}/mo difference is invested every month, averaged over the stay.`
      : 'At this rent, owning costs less per month, so the buyer invests the difference.',
    '',
    'WHAT I WANT TO TALK THROUGH',
    'This model cannot know how long I will really stay, how secure my income is,',
    'or what this home means to me beyond the money. Help me think about those.',
  ].join('\n');
}

/**
 * Shareable link that reloads this exact scenario.
 *
 * Goes through the site's own codec rather than hand-building a query string,
 * so the link decodes on the same path a pasted one would and only
 * non-default params travel.
 */
export function scenarioLink(inputs: EngineInputs): string {
  const qs = encodeParams(inputs);
  return qs ? `${SITE}/?${qs}` : SITE;
}
