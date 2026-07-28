import { useEffect, useRef, useState } from 'preact/hooks';
import type { CoreResults } from '../../lib/engine/types';

interface Props {
  results: CoreResults;
  stayYears: number;
}

/** Axis ticks at human intervals (1, 2, 2.5, 5, 10 x a power of ten). */
function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let t = Math.floor(min / step) * step; t <= max + step * 0.5; t += step) out.push(t);
  return out;
}

const kAbbr = (v: number) => '$' + Math.round(v / 1000) + 'K';
const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

/** Plot insets. Module-level so the pointer handler can map x to a year without
 *  waiting for the render block that draws the plot. */
const PAD = { t: 18, r: 96, b: 30, l: 58 };

/** Readout card width, and its clearance from the crosshair. Fixed here rather
 *  than left to CSS so the placement maths below is authoritative - .rtip takes
 *  its width from the inline style. */
const TIP_W = 186;
const TIP_GAP = 12;

export function RaceChart({ results, stayYears }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  /** Year being inspected, or null when nothing is hovered or focused. */
  const [year, setYear] = useState<number | null>(null);
  /** Only mirror the readout into the live region for keyboard use - a mouse
   *  dragged across the chart would otherwise announce on every frame. */
  const [byKeyboard, setByKeyboard] = useState(false);

  // Re-render at container size rather than CSS-stretching one viewBox, which
  // would distort the type inside the SVG.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tie = results.verdict === 'tie';
  const rentWins = results.difference < 0;
  const rentCol = tie || !rentWins ? 'var(--color-lose)' : 'var(--color-primary-deep)';
  const buyCol = tie || rentWins ? 'var(--color-lose)' : 'var(--color-primary-deep)';
  const rentW = !tie && rentWins ? 2.8 : 1.8;
  const buyW = !tie && !rentWins ? 2.8 : 1.8;

  const pts = [
    { y: 0, r: results.yearZero.rentNetWorth, b: results.yearZero.buyNetWorth },
    ...results.years.map((y) => ({ y: y.year, r: y.rentNetWorth, b: y.buyNetWorth })),
  ];
  const lastIdx = pts.length - 1;

  // A stay shortened while the tooltip is open must not read off the end of the
  // series, so the index is clamped at use rather than trusted.
  const at = year === null ? null : pts[Math.min(year, lastIdx)];

  const step = (delta: number) => {
    setByKeyboard(true);
    setYear((y) => Math.max(0, Math.min(lastIdx, (y === null ? lastIdx : y) + delta)));
  };

  const clear = () => {
    setYear(null);
    setByKeyboard(false);
  };

  const legend = (
    <div class="legend">
      {/* Rent listed first whether it is winning or losing - identity is
          position and label, colour is only who is ahead. */}
      <span class="li">
        <span class="sw" style={{ background: rentCol, height: `${rentW}px` }} />
        <b>Rent &amp; invest</b> {tie ? 'level' : rentWins ? 'ahead' : 'behind'}
      </span>
      <span class="li">
        <span class="sw" style={{ background: buyCol, height: `${buyW}px` }} />
        <b>Buy</b> {tie ? 'level' : rentWins ? 'behind' : 'ahead'}
      </span>
    </div>
  );

  const note =
    results.breakEvenYear && results.breakEvenYear <= stayYears
      ? `Buying is ahead from year ${results.breakEvenYear} onward on this chart, but selling costs and the invested difference are what settle it at the end of the stay.`
      : 'The two paths never cross inside this stay - the gap only widens.';

  /** Map a pointer x within the box to the nearest plotted year. */
  const yearAtX = (clientX: number): number | null => {
    const el = box.current;
    if (!el || !size) return null;
    const rect = el.getBoundingClientRect();
    const plotW = size.w - PAD.l - PAD.r;
    if (plotW <= 0) return null;
    const frac = (clientX - rect.left - PAD.l) / plotW;
    return Math.max(0, Math.min(lastIdx, Math.round(frac * stayYears)));
  };

  let svg = null;
  let tip = null;
  if (size && size.w > 0 && size.h > 0) {
    const { w: W, h: H } = size;

    const lo = Math.min(0, ...pts.map((p) => Math.min(p.r, p.b)));
    const hi = Math.max(...pts.map((p) => Math.max(p.r, p.b)));
    const ticks = niceTicks(lo, hi, 4);
    const yMin = Math.min(lo, ticks[0]);
    const yMax = Math.max(hi, ticks[ticks.length - 1]);
    const X = (y: number) => PAD.l + (y / stayYears) * (W - PAD.l - PAD.r);
    const Y = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.t - PAD.b);
    const path = (k: 'r' | 'b') =>
      pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.y).toFixed(1)} ${Y(p[k]).toFixed(1)}`).join(' ');

    const last = pts[pts.length - 1];
    const xYears = [0, Math.round(stayYears / 2), stayYears].filter((v, i, a) => a.indexOf(v) === i);

    const endLabel = (v: number, col: string, name: string) => (
      <>
        <circle cx={X(stayYears).toFixed(1)} cy={Y(v).toFixed(1)} r="4" fill={col} />
        <text
          x={(X(stayYears) + 9).toFixed(1)}
          y={(Y(v) - 3).toFixed(1)}
          font-size="12"
          font-weight="700"
          fill={col}
          font-family="Inter"
        >
          {kAbbr(v)}
        </text>
        <text
          x={(X(stayYears) + 9).toFixed(1)}
          y={(Y(v) + 11).toFixed(1)}
          font-size="11"
          fill="var(--color-body)"
          font-family="Inter"
        >
          {name}
        </text>
      </>
    );

    const bev =
      results.breakEvenYear && results.breakEvenYear <= stayYears ? X(results.breakEvenYear) : null;

    svg = (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Net worth by year. Rent and invest ends at ${round1k(last.r)}, buying ends at ${round1k(last.b)}${
          results.breakEvenYear ? `, buying pulls ahead in year ${results.breakEvenYear}` : ''
        }.`}
      >
        {/* Draw order matters: grid, then markers, then lines, then labels, so
            nothing important sits under a gridline. */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.l}
              y1={Y(t).toFixed(1)}
              x2={W - PAD.r}
              y2={Y(t).toFixed(1)}
              stroke="var(--color-hairline)"
              stroke-width="1"
            />
            <text
              x={PAD.l - 9}
              y={(Y(t) + 4).toFixed(1)}
              text-anchor="end"
              font-size="11.5"
              fill="var(--color-body)"
              font-family="Inter"
            >
              {kAbbr(t)}
            </text>
          </g>
        ))}

        {bev !== null && (
          <>
            <line
              x1={bev.toFixed(1)}
              y1={PAD.t}
              x2={bev.toFixed(1)}
              y2={H - PAD.b}
              stroke="var(--color-body)"
              stroke-width="1"
              stroke-dasharray="3 3"
            />
            {/* Halo via paint-order so the label survives crossing a gridline. */}
            <text
              x={(bev + 6).toFixed(1)}
              y={PAD.t + 12}
              font-size="11.5"
              fill="var(--color-body)"
              font-family="Inter"
              paint-order="stroke"
              stroke="var(--color-canvas)"
              stroke-width="3"
            >
              buying pulls ahead, yr {results.breakEvenYear}
            </text>
          </>
        )}

        <path
          d={path('r')}
          fill="none"
          stroke={rentCol}
          stroke-width={rentW}
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <path
          d={path('b')}
          fill="none"
          stroke={buyCol}
          stroke-width={buyW}
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        {/* Crosshair for the inspected year. Drawn over the lines so the dots
            read as sitting ON them, and pointer-events off so it can never
            steal the hover from the box that tracks it. */}
        {at && (
          <g style="pointer-events:none">
            <line
              x1={X(at.y).toFixed(1)}
              y1={PAD.t}
              x2={X(at.y).toFixed(1)}
              y2={H - PAD.b}
              stroke="var(--color-ink)"
              stroke-width="1"
              stroke-opacity="0.28"
            />
            <circle
              cx={X(at.y).toFixed(1)}
              cy={Y(at.r).toFixed(1)}
              r="4.5"
              fill={rentCol}
              stroke="var(--color-canvas)"
              stroke-width="2"
            />
            <circle
              cx={X(at.y).toFixed(1)}
              cy={Y(at.b).toFixed(1)}
              r="4.5"
              fill={buyCol}
              stroke="var(--color-canvas)"
              stroke-width="2"
            />
          </g>
        )}

        {endLabel(last.r, rentCol, 'rent & invest')}
        {endLabel(last.b, buyCol, 'buy')}

        {xYears.map((y) => (
          <text
            key={y}
            x={X(y).toFixed(1)}
            y={H - 8}
            text-anchor="middle"
            font-size="11.5"
            fill="var(--color-body)"
            font-family="Inter"
          >
            {y === 0 ? 'today' : `yr ${y}`}
          </text>
        ))}
      </svg>
    );

    if (at) {
      const ahead = at.r === at.b ? null : at.r > at.b;
      // Side is chosen from real geometry, not a fraction of the plot. A fixed
      // "flip past 62%" threshold assumes the card is small next to the chart;
      // at 390px it is half the plot width, so a crosshair at 60% still ran
      // 25px off the card and pushed the page wider than the viewport.
      // Preferred side is the right; flip when it does not fit; clamp either
      // way so the card can never leave the plot.
      const tipW = Math.min(TIP_W, W - 8);
      const x = X(at.y);
      const wantLeft = x + TIP_GAP + tipW <= W - 4 ? x + TIP_GAP : x - TIP_GAP - tipW;
      const left = Math.max(4, Math.min(W - tipW - 4, wantLeft));
      tip = (
        <div
          class="rtip"
          style={{ left: `${left.toFixed(1)}px`, top: `${PAD.t}px`, width: `${tipW}px` }}
        >
          <div class="rtip-y">{at.y === 0 ? 'Today' : `Year ${at.y}`}</div>
          <div class="rtip-r">
            <span class="d" style={{ background: rentCol }} />
            <span class="l">Rent &amp; invest</span>
            <span class="v">{round1k(at.r)}</span>
          </div>
          <div class="rtip-r">
            <span class="d" style={{ background: buyCol }} />
            <span class="l">Buy</span>
            <span class="v">{round1k(at.b)}</span>
          </div>
          <div class="rtip-f">
            {ahead === null
              ? 'Level at this point'
              : `${ahead ? 'Renting' : 'Buying'} ahead by ${round1k(Math.abs(at.r - at.b))}`}
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {legend}
      <div class="racecard">
        <div
          class="racebox"
          ref={box}
          tabIndex={0}
          role="application"
          aria-label="Net worth by year. Use the left and right arrow keys to read each year."
          onPointerMove={(e) => {
            // Touch fires pointermove only while a finger is down, so this
            // doubles as drag-to-scrub. touch-action: pan-y keeps vertical
            // scrolling with the browser and leaves horizontal to us.
            setByKeyboard(false);
            setYear(yearAtX(e.clientX));
          }}
          onPointerDown={(e) => {
            // Tap to place the crosshair, since touch has no hover.
            setByKeyboard(false);
            setYear(yearAtX(e.clientX));
          }}
          onPointerLeave={(e) => {
            // A touch pointer is destroyed right after pointerup, which fires
            // pointerleave immediately - clearing here would make a tap show
            // the readout and hide it in the same tick. Touch keeps the
            // crosshair until another tap moves it or the chart is blurred.
            if (e.pointerType !== 'touch') clear();
          }}
          onBlur={clear}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') step(1);
            else if (e.key === 'ArrowLeft') step(-1);
            else if (e.key === 'Home') {
              setByKeyboard(true);
              setYear(0);
            } else if (e.key === 'End') {
              setByKeyboard(true);
              setYear(lastIdx);
            } else if (e.key === 'Escape') clear();
            else return;
            e.preventDefault();
          }}
        >
          {svg}
          {tip}
        </div>
      </div>
      {/* Keyboard readers get the year read out; pointer users already see it. */}
      <div class="sr-only" role="status" aria-live="polite">
        {byKeyboard && at
          ? `${at.y === 0 ? 'Today' : `Year ${at.y}`}: rent and invest ${round1k(at.r)}, buy ${round1k(at.b)}.`
          : ''}
      </div>
      <p class="racenote">{note}</p>
    </>
  );
}
