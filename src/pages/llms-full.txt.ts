import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import faq from '../data/faq.json';

/**
 * llms-full.txt - the whole site's written content in one plain-text file, per
 * the llms.txt convention's optional companion. llms.txt is the index; this is
 * the corpus, so an AI agent can read everything in one fetch instead of
 * crawling page by page. Emitted at build time from the same collections the
 * pages render from - it cannot drift from what humans see.
 */
export const GET: APIRoute = async () => {
  const guides = (await getCollection('guides')).sort((a, b) => a.id.localeCompare(b.id));
  const sections = (await getCollection('sections')).sort((a, b) => a.id.localeCompare(b.id));

  const parts: string[] = [
    '# RentVsBuyMath.com - full content',
    '',
    '> Free rent-vs-buy calculator with fully documented methodology. This file contains',
    '> the complete text of every guide and calculator explainer on the site, generated',
    '> from the same sources the pages render from. Index: https://rentvsbuymath.com/llms.txt',
    '> Calculator: https://rentvsbuymath.com/  Methodology: https://rentvsbuymath.com/methodology',
    '',
  ];

  for (const g of guides) {
    parts.push(
      `## ${g.data.title}`,
      `URL: https://rentvsbuymath.com/guides/${g.id.replace(/\.md$/, '')}`,
      '',
      (g.body ?? '').trim(),
      ''
    );
  }
  for (const s of sections) {
    parts.push(`## ${s.data.title ?? s.id}`, '', (s.body ?? '').trim(), '');
  }

  parts.push('## Frequently asked questions', '');
  for (const { q, a } of faq.questions as { q: string; a: string }[]) {
    parts.push(`Q: ${q}`, `A: ${a}`, '');
  }

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
