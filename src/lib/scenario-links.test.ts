import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { OWNED_PARAMS } from './engine/urlParams';

/**
 * Scenario links in published copy must use the real param contract.
 *
 * Seven of them did not. They used `price=`, `rate=` and `years=`, which are
 * not owned params - `urlParams.ts` maps `pp`, `mr` and `th`. Unowned params
 * are preserved and ignored (the utm_* path), so the calculator silently opened
 * at its defaults.
 *
 * Six of the seven passed for years to anyone checking, because the values they
 * named ($420,000, 6.5%, 10 years) ARE the defaults - the link did nothing and
 * looked correct. The seventh did not have that cover:
 * when-does-buying-beat-renting said "Load our base case at a 4% rate to watch
 * a break-even appear in year 6" behind `?rate=4`, which loaded 6.5% and showed
 * no break-even at all. A reader following the instruction saw the site
 * contradict itself.
 *
 * That is why this is a test and not a fixed typo: the failure mode is a link
 * that looks right, and the only reliable reader of a query string is code.
 * A scenario link is also the distribution asset - the thing meant to be pasted
 * into forums - so a broken one fails where nobody is watching.
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Everything a reader can reach: prose, data, and the LLM-facing manifest. */
const ROOTS = ['src/content', 'src/pages', 'src/data', 'public/llms.txt', 'README.md'];
const EXTS = ['.md', '.mdx', '.astro', '.json', '.txt', '.tsx'];

function walk(p: string, out: string[] = []): string[] {
  const abs = join(REPO_ROOT, p);
  let st;
  try {
    st = statSync(abs);
  } catch {
    return out;
  }
  if (st.isFile()) {
    if (EXTS.some((e) => p.endsWith(e))) out.push(p);
    return out;
  }
  for (const e of readdirSync(abs)) walk(join(p, e), out);
  return out;
}

const FILES = ROOTS.flatMap((r) => walk(r));

/** A link to the calculator root carrying a query string. */
const LINK = /[("'\s]\/\?([A-Za-z0-9_;&=.%-]+)/g;

type Bad = { file: string; link: string; offenders: string[] };

function scan(): Bad[] {
  const bad: Bad[] = [];
  for (const f of FILES) {
    const body = readFileSync(join(REPO_ROOT, f), 'utf8');
    for (const m of body.matchAll(LINK)) {
      // Astro/markdown escape ampersands in HTML contexts; normalise before
      // splitting or `amp;mr` reads as a param name.
      const qs = m[1].replace(/&amp;/g, '&');
      const names = qs
        .split('&')
        .map((kv) => kv.split('=')[0])
        .filter(Boolean)
        // Template interpolation (`${...}`) is built from the contract in code.
        .filter((n) => !n.includes('$') && !n.includes('{'));
      const offenders = names.filter((n) => !OWNED_PARAMS.has(n));
      if (offenders.length) bad.push({ file: relative('.', f), link: `/?${qs}`, offenders });
    }
  }
  return bad;
}

describe('published scenario links', () => {
  it('scans a meaningful number of files', () => {
    // Guards the guard: a broken walk() would make this vacuously pass.
    expect(FILES.length).toBeGreaterThan(15);
  });

  it('finds at least one scenario link to check', () => {
    const found = FILES.flatMap((f) => [
      ...readFileSync(join(REPO_ROOT, f), 'utf8').matchAll(LINK),
    ]);
    expect(found.length).toBeGreaterThan(5);
  });

  it('use only params the calculator actually decodes', () => {
    const bad = scan();
    const report = bad
      .map((b) => `${b.file}\n    ${b.link}\n    unknown: ${b.offenders.join(', ')}`)
      .join('\n  ');
    expect(bad, bad.length ? `\n  ${report}\n` : '').toEqual([]);
  });
});
