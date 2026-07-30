import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { simulate, tippingPointRent } from './engine';
import { DEFAULT_INPUTS } from './defaults';

/**
 * Guards the tipping-rent figures that are hand-written into page copy.
 *
 * We publish the same six-row rate table in a dozen places (guides, FAQ,
 * glossary, llms.txt, the homepage). Those numbers are typed by hand, so they
 * drift silently when the engine or the defaults change. That drift shipped
 * twice: the "% of home value" column was once computed against a stale
 * $350,000 price, and the 5% row sat $50 low for long enough to invert the
 * published verdict at that rate.
 *
 * If the engine changes, PUBLISHED fails first and tells you the new numbers.
 * Update it, then the copy tests tell you every file you still have to edit.
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * The exact strings that appear in page copy, keyed by mortgage rate.
 *
 * `ratio` is the threshold price-to-rent ratio the tipping rent implies -
 * price / (tipping rent x 12) - i.e. "buying is favored below this ratio". It
 * was published in the rate table on the price-to-rent page and in prose on the
 * 5% rule page while being guarded by nothing, which is the same shape as the
 * two drifts described above: a third column, typed by hand, derived from a
 * figure the engine owns.
 */
const PUBLISHED: Record<string, { rent: string; pct: string; ratio: string }> = {
  '4': { rent: '$1,890', pct: '0.45%', ratio: '18.5' },
  '5': { rent: '$2,117', pct: '0.50%', ratio: '16.5' },
  '6': { rent: '$2,350', pct: '0.56%', ratio: '14.9' },
  '6.5': { rent: '$2,468', pct: '0.59%', ratio: '14.2' },
  '7': { rent: '$2,587', pct: '0.62%', ratio: '13.5' },
  '8': { rent: '$2,829', pct: '0.67%', ratio: '12.4' },
};

const ALL = ['4', '5', '6', '6.5', '7', '8'];

/**
 * What each file states in prose or a hand-typed table.
 *
 * `rents` = rates whose dollar figure appears. `pcts` = rates whose
 * %-of-home-value figure appears. They differ per file, so they are listed
 * separately rather than inferred - several files print the rent without the
 * ratio, and the homepage prints the ratio for two rates it never prices.
 *
 * The homepage's rate TABLE is not here on purpose: it renders from the engine
 * via RatesTable, so it cannot drift. Only its FAQ schema hard-codes figures.
 */
const PUBLISHERS: { file: string; rents: string[]; pcts?: string[]; ratios?: string[] }[] = [
  { file: 'src/pages/index.astro', rents: ['6.5'], pcts: ['6.5', '4'] },
  { file: 'public/llms.txt', rents: ['6.5'], pcts: ['6.5', '4'] },
  { file: 'src/content/guides/rent-vs-buy-2026.md', rents: ALL, pcts: ['6.5'] },
  { file: 'src/content/guides/is-buying-always-better-than-renting.md', rents: ALL },
  { file: 'src/content/guides/when-does-buying-beat-renting.md', rents: ALL },
  { file: 'src/content/guides/is-it-better-to-rent-or-buy.md', rents: ALL, pcts: ALL },
  { file: 'src/content/sections/price-to-rent-ratio.md', rents: ALL, pcts: ALL, ratios: ALL },
  { file: 'src/content/sections/five-percent-rule.md', rents: ALL, pcts: ALL },
  { file: 'src/pages/free-nyt-style-rent-vs-buy-calculator.md', rents: ALL },
  { file: 'src/data/faq.json', rents: ALL },
  { file: 'src/data/glossary.json', rents: ALL },
  { file: 'src/pages/best-rent-vs-buy-calculators.md', rents: ['4', '6.5', '8'] },
];

const read = (file: string) => readFileSync(join(REPO_ROOT, file), 'utf8');
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

describe('published tipping-rent figures match the engine', () => {
  for (const [rate, expected] of Object.entries(PUBLISHED)) {
    it(`${rate}% mortgage → ${expected.rent} (${expected.pct} of home value)`, () => {
      const tip = tippingPointRent({ ...DEFAULT_INPUTS, mortgageRatePct: Number(rate) });
      expect(tip).not.toBeNull();

      expect(money(tip!)).toBe(expected.rent);

      // The ratio column is the published rent over the home price - never the
      // loan amount, and never a stale price.
      const pct = ((Math.round(tip!) / DEFAULT_INPUTS.homePrice) * 100).toFixed(2) + '%';
      expect(pct).toBe(expected.pct);

      // Threshold price-to-rent ratio: price / (annualised tipping rent). Copy
      // rounds it to one decimal and drops a trailing ".0", so compare that way
      // rather than reformatting the published string.
      const raw = DEFAULT_INPUTS.homePrice / (Math.round(tip!) * 12);
      const ratio = raw.toFixed(1).replace(/\.0$/, '');
      expect(ratio).toBe(expected.ratio);
    });
  }
});

describe('page copy carries the current figures', () => {
  for (const { file, rents, pcts, ratios } of PUBLISHERS) {
    it(file, () => {
      const text = read(file);
      for (const rate of rents) {
        expect(text, `${file} is missing the ${rate}% tipping rent`).toContain(
          PUBLISHED[rate].rent
        );
      }
      for (const rate of pcts ?? []) {
        expect(text, `${file} is missing the ${rate}% ratio`).toContain(PUBLISHED[rate].pct);
      }
      // `ratios` is for TABLE cells, which state the threshold exactly. Prose
      // elsewhere in the same file may round it ("closer to 14" for 14.2) and
      // that is fine - this asserts the exact value is present, not that no
      // rounded form appears anywhere.
      for (const rate of ratios ?? []) {
        expect(text, `${file} is missing the ${rate}% threshold ratio`).toContain(
          PUBLISHED[rate].ratio
        );
      }
    });
  }
});

/**
 * Ratio-by-rate gaps quoted in prose.
 *
 * The matrix on /calculators/price-to-rent-ratio renders from the engine, so it
 * cannot drift. The expensive-city guide argues from the same cells in words -
 * "renting wins by about $79,000 at 4%" - and words are typed by hand. That is
 * the identical exposure as the rate table, so it gets the identical guard.
 *
 * Each row fixes the home price and solves rent from the ratio, exactly as the
 * page does, so the test and the matrix cannot disagree about what a cell means.
 */
const PUBLISHED_MATRIX: { ratio: number; rate: number; gap: string; rentWins: boolean }[] = [
  { ratio: 24, rate: 4, gap: '$79,000', rentWins: true },
  { ratio: 24, rate: 6.5, gap: '$185,000', rentWins: true },
  { ratio: 24, rate: 8, gap: '$251,000', rentWins: true },
  { ratio: 14, rate: 4, gap: '$112,000', rentWins: false },
  { ratio: 14, rate: 8, gap: '$60,000', rentWins: true },
];

const MATRIX_QUOTERS = ['src/content/guides/should-you-buy-in-an-expensive-city.md'];

describe('published ratio-by-rate gaps match the engine', () => {
  for (const { ratio, rate, gap, rentWins } of PUBLISHED_MATRIX) {
    it(`ratio ${ratio} at ${rate}% → ${rentWins ? 'rent' : 'buy'} by ${gap}`, () => {
      const rent = Math.round(DEFAULT_INPUTS.homePrice / (ratio * 12));
      const r = simulate({ ...DEFAULT_INPUTS, monthlyRent: rent, mortgageRatePct: rate });
      expect(r.difference < 0, `ratio ${ratio} at ${rate}% should favour ${rentWins ? 'rent' : 'buy'}`).toBe(rentWins);
      const rounded = '$' + (Math.round(Math.abs(r.difference) / 1000) * 1000).toLocaleString('en-US');
      expect(rounded).toBe(gap);
    });
  }

  for (const file of MATRIX_QUOTERS) {
    it(`${file} states the current gaps`, () => {
      const text = read(file);
      for (const { gap } of PUBLISHED_MATRIX) {
        expect(text, `${file} is missing ${gap}`).toContain(gap);
      }
    });
  }
});

describe('verdict-sensitive boundaries', () => {
  // The 5% row is the fragile one: the threshold sits $17 above the default
  // rent, so a small stale figure flips the published verdict.
  it('renting wins at 5% on the default scenario', () => {
    const inputs = { ...DEFAULT_INPUTS, mortgageRatePct: 5 };
    expect(tippingPointRent(inputs)!).toBeGreaterThan(inputs.monthlyRent);
    expect(simulate(inputs).verdict).toBe('rent');
  });

  it('buying still wins at 4%, and the crossover sits near 4.9%', () => {
    expect(simulate({ ...DEFAULT_INPUTS, mortgageRatePct: 4 }).verdict).toBe('buy');
    expect(simulate({ ...DEFAULT_INPUTS, mortgageRatePct: 4.75 }).verdict).toBe('buy');
    expect(simulate({ ...DEFAULT_INPUTS, mortgageRatePct: 5 }).verdict).toBe('rent');
  });
});
