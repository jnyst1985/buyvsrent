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

/** The exact strings that appear in page copy, keyed by mortgage rate. */
const PUBLISHED: Record<string, { rent: string; pct: string }> = {
  '4': { rent: '$1,890', pct: '0.45%' },
  '5': { rent: '$2,117', pct: '0.50%' },
  '6': { rent: '$2,350', pct: '0.56%' },
  '6.5': { rent: '$2,468', pct: '0.59%' },
  '7': { rent: '$2,587', pct: '0.62%' },
  '8': { rent: '$2,829', pct: '0.67%' },
};

/** Which rows each file publishes. `pct: true` means it also prints the ratio column. */
const PUBLISHERS: { file: string; rates: string[]; pct?: boolean }[] = [
  { file: 'src/pages/index.astro', rates: ['4', '5', '6', '6.5', '7', '8'], pct: true },
  { file: 'src/content/guides/rent-vs-buy-2026.md', rates: ['4', '5', '6', '6.5', '7', '8'] },
  {
    file: 'src/content/guides/is-buying-always-better-than-renting.md',
    rates: ['4', '5', '6', '6.5', '7', '8'],
  },
  {
    file: 'src/content/guides/when-does-buying-beat-renting.md',
    rates: ['4', '5', '6', '6.5', '7', '8'],
  },
  {
    file: 'src/content/guides/is-it-better-to-rent-or-buy.md',
    rates: ['4', '5', '6', '6.5', '7', '8'],
    pct: true,
  },
  {
    file: 'src/content/sections/price-to-rent-ratio.md',
    rates: ['4', '5', '6', '6.5', '7', '8'],
    pct: true,
  },
  {
    file: 'src/content/sections/five-percent-rule.md',
    rates: ['4', '5', '6', '6.5', '7', '8'],
    pct: true,
  },
  {
    file: 'src/pages/free-nyt-style-rent-vs-buy-calculator.md',
    rates: ['4', '5', '6', '6.5', '7', '8'],
  },
  { file: 'src/data/faq.json', rates: ['4', '5', '6', '6.5', '7', '8'] },
  { file: 'src/data/glossary.json', rates: ['4', '5', '6', '6.5', '7', '8'] },
  { file: 'src/pages/best-rent-vs-buy-calculators.md', rates: ['4', '6.5', '8'] },
  { file: 'public/llms.txt', rates: ['6.5'], pct: true },
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
    });
  }
});

describe('page copy carries the current figures', () => {
  for (const { file, rates, pct } of PUBLISHERS) {
    it(file, () => {
      const text = read(file);
      for (const rate of rates) {
        expect(text, `${file} is missing the ${rate}% tipping rent`).toContain(
          PUBLISHED[rate].rent
        );
        if (pct) {
          expect(text, `${file} is missing the ${rate}% ratio`).toContain(PUBLISHED[rate].pct);
        }
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
