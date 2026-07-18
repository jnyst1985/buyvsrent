/** Minimal chart math for the net-worth SVG chart. No dependencies. */

export interface Scale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
}

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const fn = ((value: number) => r0 + ((value - d0) / span) * (r1 - r0)) as Scale;
  fn.domain = domain;
  fn.range = range;
  return fn;
}

/** Round tick values covering [min, max] with ~count steps (1/2/5 progression). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) {
    max = min + 1;
  }
  const rawStep = (max - min) / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(Math.abs(rawStep)));
  const residual = rawStep / magnitude;
  const step = (residual >= 5 ? 10 : residual >= 2 ? 5 : residual >= 1 ? 2 : 1) * magnitude;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step / 1e6; v += step) {
    // Snap tiny float error to exact step multiples
    ticks.push(Math.round(v / step) * step);
  }
  return ticks;
}

export function linePath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';
  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join('');
}

/** Closed path from a line down to a baseline, for the 10%-opacity area wash. */
export function areaPath(points: Array<[number, number]>, baselineY: number): string {
  if (points.length === 0) return '';
  const line = linePath(points);
  const [lastX] = points[points.length - 1];
  const [firstX] = points[0];
  return `${line}L${lastX.toFixed(2)},${baselineY.toFixed(2)}L${firstX.toFixed(2)},${baselineY.toFixed(2)}Z`;
}
