/**
 * Site-wide consistency audit.
 *
 * One check per class of bug found during this redesign, run against EVERY page
 * at four widths. The point is that "did we fix it everywhere" stops being a
 * question someone has to answer by looking.
 */
import { createRequire } from 'node:module';

// playwright-core is not a dependency of this project - the audit is a
// developer tool, not part of the build. Point PW_CORE at any copy you have
// (e.g. a global @playwright/cli install) and CHROME at the browser binary.
//
//   npm run dev
//   BASE=http://localhost:4321 npm run audit
//
const require = createRequire(import.meta.url);
const PW_CORE = process.env.PW_CORE || 'playwright-core';
let chromium;
try {
  ({ chromium } = require(PW_CORE));
} catch {
  console.error(
    `Cannot load playwright-core from "${PW_CORE}".\n` +
      'Set PW_CORE to an absolute path, e.g.\n' +
      '  PW_CORE=/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core npm run audit'
  );
  process.exit(2);
}
const EXEC = process.env.CHROME || undefined;
const BASE = process.env.BASE || 'http://localhost:4321';

const PAGES = [
  '/',
  '/guides',
  '/guides/is-it-better-to-rent-or-buy',
  '/guides/rent-vs-buy-2026',
  '/guides/when-does-buying-beat-renting',
  '/guides/is-buying-always-better-than-renting',
  '/methodology',
  '/about',
  '/faq',
  '/glossary',
  '/contact',
  '/privacy',
  '/terms',
  '/calculators/5-percent-rule',
  '/calculators/price-to-rent-ratio',
  '/best-rent-vs-buy-calculators',
  '/free-nyt-style-rent-vs-buy-calculator',
  '/404',
];
const WIDTHS = [1440, 1024, 768, 390];

const F = {
  figureOverflow: [],
  cappedHeading: [],
  pageOverflow: [],
  consoleError: [],
  bandSeam: [],
  fieldAlign: [],
  asideRule: [],
  moduleGap: [],
  typeFloor: [],
  proseStandard: [],
  touchTarget: [],
};

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 1000 },
    hasTouch: width <= 768,
    isMobile: width <= 768,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !page.url().includes('/404'))
      F.consoleError.push({ width, url: page.url(), text: m.text() });
  });
  page.on('pageerror', (e) => F.consoleError.push({ width, url: page.url(), text: String(e) }));

  for (const path of PAGES) {
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => null);
    if (!res) continue;
    await page.waitForTimeout(150);

    const r = await page.evaluate(
      ({ width }) => {
        const out = {
          figures: [],
          heads: [],
          seams: [],
          fields: [],
          asides: [],
          gaps: [],
          small: [],
          prose: null,
          targets: [],
          docW: document.documentElement.scrollWidth,
          winW: window.innerWidth,
        };
        const px = (v) => parseFloat(v) || 0;

        // --- A. display figure wider than its own box -------------------------
        document.querySelectorAll('body *').forEach((el) => {
          if (el.children.length) return;
          const t = (el.textContent || '').trim();
          if (!t) return;
          const cs = getComputedStyle(el);
          if (px(cs.fontSize) < 24) return;
          if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') return;
          const rng = document.createRange();
          rng.selectNodeContents(el);
          const ink = rng.getBoundingClientRect();
          const host = el.getBoundingClientRect();
          if (ink.width > host.width + 1.5)
            out.figures.push({
              cls: (el.className || '').toString().slice(0, 30),
              text: t.slice(0, 24),
              over: Math.round(ink.width - host.width),
            });
        });

        // --- B. heading broken by a cap tighter than its column ---------------
        document.querySelectorAll('h1,h2,h3,h4').forEach((h) => {
          if (!h.textContent.trim() || h.children.length > 1) return;
          const cs = getComputedStyle(h);
          const lh = px(cs.lineHeight) || px(cs.fontSize) * 1.2;
          if (Math.round(h.getBoundingClientRect().height / lh) < 2) return;
          if (cs.maxWidth === 'none') return;
          if (h.closest('.hero, .phero, .feat')) return; // deliberate hero cap
          const probe = document.createElement(h.tagName);
          probe.className = h.className;
          probe.textContent = h.textContent;
          probe.style.cssText =
            'position:absolute;visibility:hidden;white-space:nowrap;width:auto;max-width:none;left:0;top:0';
          h.parentElement.appendChild(probe);
          const nat = probe.getBoundingClientRect().width;
          probe.remove();
          const avail = h.parentElement.getBoundingClientRect().width;
          if (nat <= avail + 0.5 && nat > px(cs.maxWidth) + 0.5)
            out.heads.push({
              text: h.textContent.trim().slice(0, 44),
              nat: Math.round(nat),
              avail: Math.round(avail),
              cap: cs.maxWidth,
            });
        });

        // --- E. adjacent bands with no seam -----------------------------------
        const bands = [...document.querySelectorAll('.phero,.band,.answer,.hero,.sitefooter')]
          .filter((el) => el.getBoundingClientRect().height > 0)
          .map((el) => ({
            cls: (el.className || '').toString().slice(0, 26),
            bg: getComputedStyle(el).backgroundColor,
            rule: px(getComputedStyle(el).borderTopWidth) > 0,
            top: Math.round(el.getBoundingClientRect().top + window.scrollY),
            h: Math.round(el.getBoundingClientRect().height),
          }))
          .sort((a, b) => a.top - b.top);
        for (let i = 1; i < bands.length; i++) {
          const p = bands[i - 1],
            c = bands[i];
          if (Math.abs(c.top - (p.top + p.h)) <= 2 && p.bg === c.bg && !c.rule)
            out.seams.push({ from: p.cls, to: c.cls, bg: p.bg });
        }

        // --- F. numeric fields: one box size, numerals on one line ------------
        // Grouped by the card they live in, since each card is its own column.
        const groups = new Map();
        document.querySelectorAll('.cf .box, .crow .ed, .sl-row .box').forEach((box) => {
          const card = box.closest('.cg, .conv, .tool') || document.body;
          const key =
            (card.className || 'body').toString() +
            '|' +
            (card.querySelector('h3')?.textContent?.trim() || card.tagName);
          const inp = box.querySelector('input');
          if (!inp) return;
          const b = box.getBoundingClientRect(),
            ib = inp.getBoundingClientRect();
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push({
            w: Math.round(b.width),
            h: Math.round(b.height),
            numRight: Math.round(ib.right),
            unit: box.querySelector('.sfx')?.textContent?.trim() || '',
          });
        });
        for (const [key, items] of groups) {
          if (items.length < 2) continue;
          const w = new Set(items.map((i) => i.w));
          const h = new Set(items.map((i) => i.h));
          const nr = new Set(items.map((i) => i.numRight));
          if (w.size > 1 || h.size > 1 || nr.size > 1)
            out.fields.push({
              group: key.slice(0, 40),
              n: items.length,
              widths: [...w],
              heights: [...h],
              numeralRightEdges: [...nr],
            });
        }

        // --- G. the acid rule belongs to section notes, never inside a card ---
        document.querySelectorAll('p, div').forEach((el) => {
          const cs = getComputedStyle(el);
          if (px(cs.borderLeftWidth) < 2) return;
          const col = cs.borderLeftColor;
          // Only care about the accent rule
          if (!/182,\s*242,\s*92/.test(col)) return;
          const inCard = el.closest('.tool, .conv, .cg, .racecard, .gc, .kcard, .mcard, .wc, .hc');
          if (inCard)
            out.asides.push({
              cls: (el.className || '').toString().slice(0, 24),
              inside: (inCard.className || '').toString().slice(0, 20),
              text: el.textContent.trim().slice(0, 34),
            });
        });

        // --- H. a module butted straight against following prose --------------
        document.querySelectorAll('.prose-content, .art .narrow > p').forEach((prose) => {
          const prev = prose.previousElementSibling;
          if (!prev) return;
          const prevBox = prev.getBoundingClientRect();
          const isModule = prev.querySelector?.('.tool, .conv, .racecard') || prev.classList?.contains('tool');
          if (!isModule) return;
          const gap = Math.round(prose.getBoundingClientRect().top - prevBox.bottom);
          if (gap < 20) out.gaps.push({ gap, prev: (prev.className || prev.tagName).toString().slice(0, 24) });
        });

        // --- J. nothing renders below the 11px floor --------------------------
        document.querySelectorAll('body *').forEach((el) => {
          if (el.children.length) return;
          if (!(el.textContent || '').trim()) return;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') return;
          if (el.closest('.sr-only')) return;
          const fs = px(cs.fontSize);
          if (fs > 0 && fs < 11)
            out.small.push({
              cls: (el.className || '').toString().slice(0, 26),
              fs,
              text: (el.textContent || '').trim().slice(0, 20),
            });
        });

        // --- I. the prose standard --------------------------------------------
        // Body paragraphs only. A lede/standfirst has its own, narrower measure
        // by design and is not part of the body prose standard.
        const ps = [...document.querySelectorAll('.art p, .prose-content p, .pb')].filter(
          (el) => el.textContent.trim().length > 120 && !el.classList.contains('lede')
        );
        if (ps.length) {
          const cs = getComputedStyle(ps[0]);
          out.prose = {
            fs: +px(cs.fontSize).toFixed(1),
            lh: cs.lineHeight,
            col: Math.round(ps[0].getBoundingClientRect().width),
          };
        }
        const h2 = document.querySelector('.art h2, .prose-content h2, .msplit h2:not(.gletter), .fgroup h2');
        if (h2) out.h2fs = Math.round(px(getComputedStyle(h2).fontSize));

        // --- K. touch targets on coarse pointers ------------------------------
        if (matchMedia('(pointer: coarse)').matches) {
          document.querySelectorAll('input:not([type=range]), button, a[class]').forEach((el) => {
            const b = el.getBoundingClientRect();
            if (b.height === 0 || b.width === 0) return;
            if (getComputedStyle(el).display === 'inline') return; // inline links exempt (2.5.8)
            if (b.height < 24)
              out.targets.push({
                tag: el.tagName,
                cls: (el.className || '').toString().slice(0, 24),
                h: Math.round(b.height),
              });
          });
        }
        return out;
      },
      { width }
    );

    const at = (o) => ({ width, path, ...o });
    r.figures.forEach((x) => F.figureOverflow.push(at(x)));
    r.heads.forEach((x) => F.cappedHeading.push(at(x)));
    r.seams.forEach((x) => F.bandSeam.push(at(x)));
    r.fields.forEach((x) => F.fieldAlign.push(at(x)));
    r.asides.forEach((x) => F.asideRule.push(at(x)));
    r.gaps.forEach((x) => F.moduleGap.push(at(x)));
    r.small.forEach((x) => F.typeFloor.push(at(x)));
    r.targets.forEach((x) => F.touchTarget.push(at(x)));
    if (r.docW > r.winW + 1) F.pageOverflow.push(at({ over: r.docW - r.winW }));
    if (width === 1440 && r.prose) F.proseStandard.push(at({ ...r.prose, h2: r.h2fs }));
  }
  await ctx.close();
}
await browser.close();

const CHECKS = [
  ['A. display figure wider than its box', F.figureOverflow],
  ['B. heading broken by a too-tight cap', F.cappedHeading],
  ['C. horizontal page overflow', F.pageOverflow],
  ['D. console errors', F.consoleError],
  ['E. adjacent bands with no seam', F.bandSeam],
  ['F. field group with mismatched size or numeral alignment', F.fieldAlign],
  ['G. acid rule used inside a card', F.asideRule],
  ['H. module butted against following prose', F.moduleGap],
  ['J. text below the 11px floor', F.typeFloor],
  ['K. touch target under 24px (coarse)', F.touchTarget],
];
console.log(`AUDIT: ${PAGES.length} pages x ${WIDTHS.length} widths\n`);
let bad = 0;
for (const [name, list] of CHECKS) {
  console.log(`${list.length === 0 ? 'PASS' : 'FAIL'}  ${name}: ${list.length}`);
  bad += list.length;
  for (const item of list.slice(0, 6)) console.log('        ', JSON.stringify(item));
}
console.log('\nI. prose standard (1440px):');
const u = (k) => [...new Set(F.proseStandard.map((r) => r[k]).filter((v) => v != null))];
console.log('   body sizes :', u('fs'), '| line-heights:', u('lh'));
console.log('   h2 sizes   :', u('h2'));
console.log(
  '   columns    :',
  u('col').sort((a, b) => a - b)
);
console.log(`\n${bad === 0 ? 'ALL CHECKS PASS' : `${bad} findings`}`);
process.exit(bad === 0 ? 0 : 1);
