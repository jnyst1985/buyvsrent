import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Wrap the FIRST occurrence of each glossary term in guide prose with a
 * glossary link the client script turns into an ELI15 popover:
 *
 *   <a class="gloss" href="/glossary#home-equity" data-term="Home equity"
 *      data-eli="...">equity</a>
 *
 * Design contract (see the 2026-08-12 prototype):
 * - Guides only. Where someone is using a tool, a popover competes with the
 *   inputs; guides are where people read.
 * - First occurrence per term per article. One marked "PMI" teaches the
 *   affordance; ten make the prose a minefield.
 * - Longest alias wins ("home equity" before "equity") and each slug is
 *   consumed once, whichever alias hit first.
 * - Never inside headings, existing links, code, or tables - only paragraph
 *   and list text.
 * - No runtime matching: this runs at build, the page ships static.
 *
 * Fail-loud contract: a glossary entry missing eli15/aliases throws at build
 * time. The eli15 texts carry no engine figures (guarded by
 * glossary-tooltips.test.ts), so they can never drift stale against the model.
 */
const HERE = dirname(fileURLToPath(import.meta.url));

const SKIP = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'table', 'script', 'style']);

function loadMatchers() {
  const { terms } = JSON.parse(readFileSync(join(HERE, '../data/glossary.json'), 'utf8'));
  const matchers = [];
  for (const t of terms) {
    if (!t.eli15 || !Array.isArray(t.aliases) || t.aliases.length === 0) {
      throw new Error(`rehype-glossary: "${t.slug}" is missing eli15 or aliases`);
    }
    for (const alias of t.aliases) {
      matchers.push({ alias, slug: t.slug, term: t.term, eli: t.eli15 });
    }
  }
  // Longest alias first, so "home equity" beats "equity" at the same position.
  matchers.sort((a, b) => b.alias.length - a.alias.length);
  const escaped = matchers.map((m) => m.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(?<![\\w-])(${escaped.join('|')})(?![\\w-])`, 'gi');
  const bySlugKey = new Map(matchers.map((m) => [m.alias.toLowerCase(), m]));
  return { pattern, bySlugKey };
}

export default function rehypeGlossary() {
  const { pattern, bySlugKey } = loadMatchers();

  return (tree, file) => {
    const path = String(file?.path ?? file?.history?.[0] ?? '');
    if (!path.includes('src/content/guides/')) return;

    const used = new Set();

    const walk = (node) => {
      if (!node.children) return;
      if (node.type === 'element' && SKIP.has(node.tagName)) return;
      node.children = node.children.flatMap((child) => {
        if (child.type !== 'text') {
          walk(child);
          return [child];
        }
        const out = [];
        let last = 0;
        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(child.value)) !== null) {
          const info = bySlugKey.get(m[1].toLowerCase());
          if (!info || used.has(info.slug)) continue;
          used.add(info.slug);
          if (m.index > last) out.push({ type: 'text', value: child.value.slice(last, m.index) });
          out.push({
            type: 'element',
            tagName: 'a',
            properties: {
              className: ['gloss'],
              href: `/glossary#${info.slug}`,
              'data-term': info.term,
              'data-eli': info.eli,
            },
            children: [{ type: 'text', value: m[1] }],
          });
          last = m.index + m[1].length;
        }
        if (out.length === 0) return [child];
        if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) });
        return out;
      });
    };
    walk(tree);
  };
}
