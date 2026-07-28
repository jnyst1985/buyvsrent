import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

/**
 * The retired blue/green palette must stay retired - and, more importantly,
 * nothing may keep REFERENCING it.
 *
 * This exists because deleting the tokens broke two live pages silently. The
 * slider fields on /calculators/* were styled with Tailwind utilities bound to
 * those tokens (`focus:border-buy`, `text-ink-muted`, `bg-surface-raised`).
 * With the tokens gone Tailwind simply stops emitting those classes: no build
 * error, no console warning, the focus ring and hint colours just disappear.
 * A grep for `var(--color-buy)` finds nothing in that situation, because the
 * reference is in a CLASS NAME.
 *
 * So: check the class names, not the variables.
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(REPO_ROOT, 'src');

const RETIRED = [
  'buy',
  'buy-soft',
  'rent',
  'rent-soft',
  'ink-secondary',
  'ink-muted',
  'surface',
  'surface-raised',
];
const PREFIXES = ['bg', 'text', 'border', 'ring', 'fill', 'stroke', 'from', 'to', 'divide'];

/** Utility classes that would resolve to nothing now, e.g. `focus:border-buy`. */
const CLASS_RE = new RegExp(
  `(?:^|[\\s"'\`:])(?:[a-z-]+:)*(?:${PREFIXES.join('|')})-(?:${RETIRED.join('|')})(?![\\w-])`,
  'g'
);
/** Direct variable references, e.g. `var(--color-buy)`. */
const VAR_RE = new RegExp(`--color-(?:${RETIRED.join('|')})(?![\\w-])`, 'g');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(tsx?|astro|css|md|json)$/.test(name) ? [full] : [];
  });
}

/** Strip comments so the note explaining this bug does not trip the check. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

describe('the retired blue/green palette', () => {
  const files = walk(SRC).filter((f) => !f.endsWith('retired-tokens.test.ts'));

  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('is not referenced by any utility class', () => {
    const hits: string[] = [];
    for (const f of files) {
      const body = stripComments(readFileSync(f, 'utf8'));
      for (const m of body.matchAll(CLASS_RE)) {
        hits.push(`${relative(REPO_ROOT, f)}: ${m[0].trim()}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('is not referenced as a CSS variable', () => {
    const hits: string[] = [];
    for (const f of files) {
      const body = stripComments(readFileSync(f, 'utf8'));
      for (const m of body.matchAll(VAR_RE)) {
        hits.push(`${relative(REPO_ROOT, f)}: ${m[0]}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('is not defined in the theme', () => {
    const css = readFileSync(join(SRC, 'styles/global.css'), 'utf8');
    // Definitions only - `--color-buy: #2563eb;` - not a mention in prose.
    for (const t of RETIRED) {
      expect(css).not.toMatch(new RegExp(`^\\s*--color-${t}\\s*:`, 'm'));
    }
  });
});
