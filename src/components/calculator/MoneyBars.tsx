import { useCallback, useEffect, useState } from 'preact/hooks';
import type { CoreResults } from '../../lib/engine/types';
import { barWidths, decomposeMonthly, type Segment } from '../../lib/engine/decompose';
import { formatCurrency } from '../../lib/engine/format';

interface Props {
  results: CoreResults;
  currency: string;
  stayYears: number;
}

const segColor = (s: Segment) =>
  s.kind === 'keep' ? 'var(--color-primary)' : `var(--color-cost-${(s.rampIndex ?? 0) + 1})`;

interface TipState {
  seg: Segment;
  share: number;
  x: number;
  y: number;
}

export function MoneyBars({ results, currency, stayYears }: Props) {
  const d = decomposeMonthly(results, stayYears);
  const fmt = (v: number) => formatCurrency(v, currency);
  const [tip, setTip] = useState<TipState | null>(null);

  // Escape closes the tooltip for keyboard users, who opened it with focus and
  // have no way to "move the mouse away".
  useEffect(() => {
    if (!tip) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setTip(null);
    // A tooltip anchored to a rect goes stale the moment the page scrolls.
    const onScroll = () => setTip(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [tip]);

  const show = useCallback((e: Event, seg: Segment, share: number) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ seg, share, x: r.left + r.width / 2, y: r.top });
  }, []);

  const maybeHide = useCallback((e: MouseEvent) => {
    // `mouseout` bubbles up from the child name/value spans, so a naive handler
    // hides the tooltip while the pointer is still inside the segment.
    const to = e.relatedTarget as Node | null;
    const self = e.currentTarget as HTMLElement;
    if (to && self.contains(to)) return;
    setTip(null);
  }, []);

  const column = (label: string, segs: Segment[], keeps: number) => (
    <div class="mcol">
      <div class="mhead">
        <b>{label}</b>
        <span class="per">per month, averaged over the stay</span>
        <span class="tot tabular">{fmt(d.total)}/mo</span>
      </div>

      <div class="bar">
        {barWidths(segs, d.total).map(({ seg, width, share }) => (
          <span
            key={seg.name}
            class="sg"
            tabIndex={0}
            role="img"
            style={{ width: `${width.toFixed(3)}%`, background: segColor(seg) }}
            aria-label={`${seg.name}, ${fmt(seg.value)} a month, ${share.toFixed(1)} percent of the monthly total`}
            onMouseEnter={(e) => show(e, seg, share)}
            onMouseOut={maybeHide}
            onFocus={(e) => show(e, seg, share)}
            onBlur={() => setTip(null)}
          />
        ))}
      </div>

      {/* Receipt legend: one row per segment, dot leader, right-aligned value.
          Every segment is listed with its true value, including the ones too
          thin to draw - so nothing silently disappears. */}
      <div class="mkey">
        {segs.map((seg) => (
          <span class="k" key={seg.name}>
            <span class="dot" style={{ background: segColor(seg) }} />
            <span class="nm">{seg.name}</span>
            <span class="lead" />
            <span class="vv tabular">{fmt(seg.value)}</span>
          </span>
        ))}
      </div>
      <p class="sr-only">{`${label} keeps ${fmt(keeps)} a month.`}</p>
    </div>
  );

  return (
    <div class="mcard k-receipt">
      {column('Owning', d.own, d.ownKeeps)}
      {column('Renting', d.rent, d.rentKeeps)}

      <p class="mfoot">
        <b>Both bars total the same on purpose.</b> Whichever path costs less each month, the
        difference is invested by the person on that path - so the comparison is like for like.
        What separates the two is not how much goes out, but how much of it stays yours:{' '}
        {fmt(d.ownKeeps)} a month owning against {fmt(d.rentKeeps)} a month renting.
      </p>

      {tip && (
        <div
          class="mtip on"
          role="presentation"
          style={{ left: `${tip.x}px`, top: `${tip.y}px` }}
        >
          <span class="tn">
            <span class="tdot" style={{ background: segColor(tip.seg) }} />
            {tip.seg.name}
          </span>
          <span class="tv">{fmt(tip.seg.value)}</span>
          <span class="tp">{tip.share.toFixed(1)}% of the monthly total</span>
        </div>
      )}
    </div>
  );
}
