import { useMemo, useRef, useState } from 'preact/hooks';
import type { EngineResults } from '../../lib/engine/types';
import { linearScale, linePath, niceTicks } from '../../lib/chart';
import { formatCompact, formatCurrency } from '../../lib/engine/format';

const W = 660;
const H = 340;
const M = { top: 16, right: 76, bottom: 28, left: 8 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
// Y-axis labels sit inside the plot's left edge to save horizontal space.

interface Props {
  results: EngineResults;
  currency: string;
}

export function NetWorthChart({ results, currency }: Props) {
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { years, yearZero, breakEvenYear } = results;
  const horizon = years.length;

  const series = useMemo(() => {
    const buy: Array<[number, number]> = [[0, yearZero.buyNetWorth]];
    const rent: Array<[number, number]> = [[0, yearZero.rentNetWorth]];
    for (const y of years) {
      buy.push([y.year, y.buyNetWorth]);
      rent.push([y.year, y.rentNetWorth]);
    }
    return { buy, rent };
  }, [years, yearZero]);

  const allValues = series.buy.concat(series.rent).map(([, v]) => v);
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const pad = (yMax - yMin || 1) * 0.06;

  const x = linearScale([0, horizon], [M.left, M.left + PLOT_W]);
  const y = linearScale([yMin - pad, yMax + pad], [M.top + PLOT_H, M.top]);

  const yTicks = niceTicks(yMin - pad, yMax + pad, 4);
  const xTickStep = horizon > 20 ? 10 : horizon > 8 ? 5 : 2;
  const xTicks: number[] = [];
  for (let t = 0; t <= horizon; t += xTickStep) xTicks.push(t);
  if (xTicks[xTicks.length - 1] !== horizon) xTicks.push(horizon);

  const toPx = ([yr, v]: [number, number]): [number, number] => [x(yr), y(v)];
  const buyPath = linePath(series.buy.map(toPx));
  const rentPath = linePath(series.rent.map(toPx));

  // End-value labels; nudge apart when the lines converge at the right edge.
  const buyEndY = y(series.buy[horizon][1]);
  const rentEndY = y(series.rent[horizon][1]);
  let buyLabelY = buyEndY;
  let rentLabelY = rentEndY;
  if (Math.abs(buyEndY - rentEndY) < 14) {
    const mid = (buyEndY + rentEndY) / 2;
    buyLabelY = buyEndY <= rentEndY ? mid - 8 : mid + 8;
    rentLabelY = buyEndY <= rentEndY ? mid + 8 : mid - 8;
  }

  const onPointerMove = (e: PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const yr = Math.round(((px - M.left) / PLOT_W) * horizon);
    setHoverYear(Math.min(horizon, Math.max(0, yr)));
  };

  const hover =
    hoverYear === null
      ? null
      : {
          year: hoverYear,
          buy: hoverYear === 0 ? yearZero.buyNetWorth : years[hoverYear - 1].buyNetWorth,
          rent: hoverYear === 0 ? yearZero.rentNetWorth : years[hoverYear - 1].rentNetWorth,
        };
  const hoverOnLeft = hover !== null && hover.year > horizon * 0.55;

  return (
    <figure>
      <figcaption class="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span class="font-semibold text-ink">Your net worth, year by year</span>
        <span class="flex items-center gap-4 text-xs text-ink-secondary">
          <span class="flex items-center gap-1.5">
            <span class="inline-block h-0.5 w-4 rounded bg-buy" aria-hidden="true" />
            Buying
          </span>
          <span class="flex items-center gap-1.5">
            <span class="inline-block h-0.5 w-4 rounded bg-rent" aria-hidden="true" />
            Renting + investing
          </span>
        </span>
      </figcaption>
      <p class="mb-2 text-xs text-ink-muted">
        Both lines include every cost, tax, and selling fee — if you cashed out that year, this is
        what you'd keep.
      </p>

      <div class="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          class="w-full touch-none select-none"
          role="img"
          aria-label={`Net worth comparison over ${horizon} years. Buying ends at ${formatCurrency(results.buyNetWorth, currency)}, renting and investing at ${formatCurrency(results.rentNetWorth, currency)}.`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverYear(null)}
        >
          {/* Gridlines + y labels (inside-left, above the hairline) */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={M.left + PLOT_W}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--color-hairline)"
                stroke-width="1"
              />
              <text
                x={M.left + 2}
                y={y(t) - 4}
                class="fill-ink-muted tabular"
                font-size="10"
              >
                {formatCompact(t, currency)}
              </text>
            </g>
          ))}

          {/* X ticks */}
          {xTicks.map((t) => (
            <text
              key={t}
              x={x(t)}
              y={M.top + PLOT_H + 16}
              text-anchor="middle"
              class="fill-ink-muted tabular"
              font-size="10"
            >
              {t === 0 ? 'Now' : `${t}y`}
            </text>
          ))}

          {/* Crosshair */}
          {hover && (
            <line
              x1={x(hover.year)}
              x2={x(hover.year)}
              y1={M.top}
              y2={M.top + PLOT_H}
              stroke="var(--color-ink-muted)"
              stroke-width="1"
            />
          )}

          {/* Series */}
          <path d={buyPath} fill="none" stroke="var(--color-buy)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
          <path d={rentPath} fill="none" stroke="var(--color-rent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

          {/* Break-even annotation */}
          {breakEvenYear !== null && breakEvenYear <= horizon && (
            <g>
              <circle
                cx={x(breakEvenYear)}
                cy={y(years[breakEvenYear - 1].buyNetWorth)}
                r="5"
                fill="var(--color-buy)"
                stroke="var(--color-surface)"
                stroke-width="2"
              />
              <text
                x={x(breakEvenYear)}
                y={y(years[breakEvenYear - 1].buyNetWorth) - 10}
                text-anchor="middle"
                class="fill-ink-secondary"
                font-size="10"
              >
                buying pulls ahead
              </text>
            </g>
          )}

          {/* Hover markers with surface ring */}
          {hover && (
            <g>
              <circle cx={x(hover.year)} cy={y(hover.buy)} r="4.5" fill="var(--color-buy)" stroke="var(--color-surface)" stroke-width="2" />
              <circle cx={x(hover.year)} cy={y(hover.rent)} r="4.5" fill="var(--color-rent)" stroke="var(--color-surface)" stroke-width="2" />
            </g>
          )}

          {/* End dots + end-value labels */}
          <circle cx={x(horizon)} cy={buyEndY} r="4" fill="var(--color-buy)" stroke="var(--color-surface)" stroke-width="2" />
          <circle cx={x(horizon)} cy={rentEndY} r="4" fill="var(--color-rent)" stroke="var(--color-surface)" stroke-width="2" />
          <text x={x(horizon) + 8} y={buyLabelY + 3.5} class="fill-ink" font-size="11" font-weight="600">
            {formatCompact(results.buyNetWorth, currency)}
          </text>
          <text x={x(horizon) + 8} y={rentLabelY + 3.5} class="fill-ink" font-size="11" font-weight="600">
            {formatCompact(results.rentNetWorth, currency)}
          </text>
        </svg>

        {/* Tooltip */}
        {hover && (
          <div
            class="pointer-events-none absolute top-2 z-10 rounded-lg border border-hairline bg-white px-3 py-2 text-xs shadow-sm"
            style={{
              left: hoverOnLeft ? undefined : `${(x(hover.year) / W) * 100}%`,
              right: hoverOnLeft ? `${100 - (x(hover.year) / W) * 100}%` : undefined,
              transform: hoverOnLeft ? 'translateX(-8px)' : 'translateX(8px)',
            }}
          >
            <p class="mb-1 font-semibold text-ink">
              {hover.year === 0 ? 'At purchase' : `Year ${hover.year}`}
            </p>
            <p class="flex items-center gap-1.5 text-ink-secondary tabular">
              <span class="inline-block h-2 w-2 rounded-full bg-buy" aria-hidden="true" />
              Buying: {formatCurrency(hover.buy, currency)}
            </p>
            <p class="flex items-center gap-1.5 text-ink-secondary tabular">
              <span class="inline-block h-2 w-2 rounded-full bg-rent" aria-hidden="true" />
              Renting: {formatCurrency(hover.rent, currency)}
            </p>
            <p class="mt-1 border-t border-hairline pt-1 text-ink tabular">
              {hover.buy >= hover.rent ? 'Buying ahead by ' : 'Renting ahead by '}
              {formatCurrency(Math.abs(hover.buy - hover.rent), currency)}
            </p>
          </div>
        )}
      </div>
    </figure>
  );
}
