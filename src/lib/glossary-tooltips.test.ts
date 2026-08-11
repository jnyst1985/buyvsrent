import { describe, expect, it } from 'vitest';
import glossary from '../data/glossary.json';

/**
 * The glossary-tooltip data contract (rehype-glossary + the guide popover).
 *
 * The load-bearing rule: eli15 texts carry NO dollar figures. The full
 * definitions quote engine numbers and are covered by the published-figures
 * guard; the tooltips are plain-English concepts precisely so they can never
 * drift stale against the model. A dollar sign in an eli15 means someone just
 * created an unguarded publisher - this test makes that a red build instead.
 */
const terms = glossary.terms as { slug: string; term: string; eli15?: string; aliases?: string[] }[];

describe('glossary tooltip data', () => {
  it('every term has an eli15 within tooltip length', () => {
    for (const t of terms) {
      expect(t.eli15, `${t.slug} is missing eli15`).toBeTruthy();
      expect(t.eli15!.length, `${t.slug} eli15 too long for a tooltip`).toBeLessThanOrEqual(240);
    }
  });

  it('eli15 texts contain no dollar figures (they must stay guard-free)', () => {
    for (const t of terms) {
      expect(t.eli15, `${t.slug} eli15 quotes a figure - move it to the definition`).not.toContain('$');
    }
  });

  it('every term has aliases, and no alias maps to two terms', () => {
    const seen = new Map<string, string>();
    for (const t of terms) {
      expect(t.aliases?.length, `${t.slug} has no aliases`).toBeGreaterThan(0);
      for (const a of t.aliases!) {
        const key = a.toLowerCase();
        expect(seen.has(key), `alias "${a}" maps to both ${seen.get(key)} and ${t.slug}`).toBe(false);
        seen.set(key, t.slug);
      }
    }
  });

  it('no alias is a prefix-collision trap for a longer alias of another term', () => {
    // "equity" (home-equity) inside "home equity" is fine BECAUSE the matcher
    // sorts longest-first; this asserts the property the matcher relies on:
    // any alias containing another term's alias must be strictly longer, so
    // the sort can disambiguate them.
    const all = terms.flatMap((t) => (t.aliases ?? []).map((a) => ({ a: a.toLowerCase(), slug: t.slug })));
    for (const x of all) {
      for (const y of all) {
        if (x.slug !== y.slug && x.a.includes(y.a)) {
          expect(x.a.length, `"${x.a}" (${x.slug}) vs "${y.a}" (${y.slug})`).toBeGreaterThan(y.a.length);
        }
      }
    }
  });
});
