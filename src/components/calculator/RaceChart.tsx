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

export function RaceChart({ results, stayYears }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

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

  let svg = null;
  if (size && size.w > 0 && size.h > 0) {
    const { w: W, h: H } = size;
    const pad = { t: 18, r: 96, b: 30, l: 58 };

    const pts = [
      { y: 0, r: results.yearZero.rentNetWorth, b: results.yearZero.buyNetWorth },
      ...results.years.map((y) => ({ y: y.year, r: y.rentNetWorth, b: y.buyNetWorth })),
    ];
    const lo = Math.min(0, ...pts.map((p) => Math.min(p.r, p.b)));
    const hi = Math.max(...pts.map((p) => Math.max(p.r, p.b)));
    const ticks = niceTicks(lo, hi, 4);
    const yMin = Math.min(lo, ticks[0]);
    const yMax = Math.max(hi, ticks[ticks.length - 1]);
    const X = (y: number) => pad.l + (y / stayYears) * (W - pad.l - pad.r);
    const Y = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - pad.t - pad.b);
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

    const bev = results.breakEvenYear && results.breakEvenYear <= stayYears
      ? X(results.breakEvenYear)
      : null;

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
              x1={pad.l}
              y1={Y(t).toFixed(1)}
              x2={W - pad.r}
              y2={Y(t).toFixed(1)}
              stroke="var(--color-hairline)"
              stroke-width="1"
            />
            <text
              x={pad.l - 9}
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
              y1={pad.t}
              x2={bev.toFixed(1)}
              y2={H - pad.b}
              stroke="var(--color-body)"
              stroke-width="1"
              stroke-dasharray="3 3"
            />
            {/* Halo via paint-order so the label survives crossing a gridline. */}
            <text
              x={(bev + 6).toFixed(1)}
              y={pad.t + 12}
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
  }

  return (
    <>
      {legend}
      <div class="racecard">
        <div class="racebox" ref={box}>
          {svg}
        </div>
      </div>
      <p class="racenote">{note}</p>
    </>
  );
}
