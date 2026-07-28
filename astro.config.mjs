// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Wrap every markdown table in a scroll container.
 *
 * Markdown emits a bare <table>, and a wide comparison table then pushes the
 * whole PAGE sideways - 716px of table in a 390px viewport on
 * /best-rent-vs-buy-calculators. The design rule is that the page must never
 * scroll horizontally; a table scrolling inside its own box satisfies that.
 *
 * Tables we author ourselves (the rate ladder, the audit table) get the better
 * treatments instead - stacking via data-label, or dropping .sup columns.
 */
function rehypeWrapTables() {
  return (tree) => {
    const visit = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        visit(child);
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['rwrap'] },
            children: [child],
          };
        }
        return child;
      });
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://rentvsbuymath.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [preact(), sitemap()],
  markdown: {
    rehypePlugins: [rehypeWrapTables],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
