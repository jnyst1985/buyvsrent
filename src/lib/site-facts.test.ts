import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TEST_COUNT, VECTOR_COUNT } from './site';

/**
 * The test count is published in several places. It had drifted twice by the
 * time this was written: the site footer said 57 on EVERY page, the README said
 * 72, and the suite actually ran 82. Nothing caught it, because a number typed
 * into five files has five chances to go stale.
 *
 * TEST_COUNT now lives in one module. This asserts that every file which states
 * the number states the current one - so bumping the constant names the files
 * left to edit, the same way published-figures.test.ts does for the rate table.
 *
 * The constant itself is maintained by hand from the vitest summary; that is
 * unavoidable, since a suite cannot know its own size while running. But it is
 * ONE hand-edit rather than five, and the footer - the worst place for a stale
 * number, since it is on every page - now imports it.
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Files that state the count as literal text rather than importing it.
 *
 * THIS LIST IS THE LOAD-BEARING PART. The number drifted a third time because
 * the list named two files while five stated it: llms.txt, the 2026 guide and
 * the FAQ all sat at 72 while the suite ran 92, and the suite passed, because a
 * guard only guards what it is pointed at. Find every claimant with
 *   grep -rnoE "[0-9]+ (automated )?tests" README.md public/ src/
 * and add whatever turns up. Note the self-reference: each file added here adds
 * two cases, which changes the number every one of them then has to state.
 */
const PUBLISHERS = [
  'README.md',
  'src/pages/best-rent-vs-buy-calculators.md',
  'public/llms.txt',
  'src/content/guides/rent-vs-buy-2026.md',
  'src/data/faq.json',
];

const read = (f: string) => readFileSync(join(REPO_ROOT, f), 'utf8');

describe('published test count', () => {
  for (const file of PUBLISHERS) {
    it(`${file} states ${TEST_COUNT}`, () => {
      expect(read(file)).toContain(String(TEST_COUNT));
    });

    it(`${file} does not still state an old count`, () => {
      const body = read(file);
      // Any "<n> tests" that is not the current number is stale copy.
      const stated = [...body.matchAll(/(\d+)\s+(?:automated\s+)?tests/g)].map((m) => m[1]);
      expect(stated.length).toBeGreaterThan(0);
      for (const n of stated) expect(n).toBe(String(TEST_COUNT));
    });
  }

  it('the footer imports the constant instead of hard-coding it', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    expect(layout).toContain('TEST_COUNT');
    expect(layout).not.toMatch(/open source with \d+/);
  });

  it('vectors are a subset of the whole suite', () => {
    expect(VECTOR_COUNT).toBeLessThan(TEST_COUNT);
    expect(VECTOR_COUNT).toBeGreaterThan(0);
  });
});
