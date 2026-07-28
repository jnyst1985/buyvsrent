import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { formatNumber } from '../../lib/engine/format';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (v: number) => void;
  /** e.g. "$" prefix or "%" / "/mo" suffix on the editable value. */
  prefix?: string;
  suffix?: string;
  /** Extra line under the row, for a caveat about the value. */
  detail?: ComponentChildren;
  format?: (v: number) => string;
  id: string;
}

/**
 * Slider plus a directly editable value: drag for feel, type for precision.
 *
 * The value used to be a button that swapped itself for an input on click.
 * That is now an always-live field using the site's standard `.box` treatment -
 * fixed numeral column, fixed unit column - so these read as the same control
 * as the twenty on the homepage rather than as a different widget.
 *
 * It also had to be rewritten: the old version was styled with utility classes
 * bound to the retired blue/green palette (`focus:border-buy`, `text-ink-muted`,
 * `bg-surface-raised`). Those tokens are gone, so Tailwind stopped emitting the
 * classes and the focus ring, hint colour and hover state silently vanished.
 */
export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onInput,
  prefix = '',
  suffix = '',
  detail,
  format = formatNumber,
  id,
}: SliderFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const numId = `${id}-num`;

  // Keep the text field in step with the slider without fighting the user
  // while they are typing into it.
  useEffect(() => {
    const el = ref.current;
    if (!el || el === document.activeElement) return;
    el.value = format(value);
  }, [value, format]);

  const commit = (raw: string) => {
    const n = Number.parseFloat(raw.replace(/[^0-9.\-]/g, ''));
    if (Number.isFinite(n)) onInput(clampToRange(n, min, max, step));
  };

  return (
    <div class="sl">
      <div class="sl-row">
        <label for={numId}>{label}</label>
        {/* `nounit` when there is no suffix: otherwise the unit column still
            reserves its 50px and squeezes the numeral, which clipped "420,000"
            to "420,00". */}
        <span class={suffix ? 'box' : 'box nounit'}>
          {prefix && <span class="pfx">{prefix}</span>}
          <input
            ref={ref}
            id={numId}
            inputMode="decimal"
            aria-label={label}
            onInput={(e) => commit((e.currentTarget as HTMLInputElement).value)}
            onBlur={() => {
              // Show what was actually used, so a clamped value does not sit in
              // the field pretending to be the input.
              if (ref.current) ref.current.value = format(value);
            }}
          />
          {suffix && <span class="sfx">{suffix}</span>}
        </span>
      </div>
      <input
        id={id}
        type="range"
        class="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onInput(Number((e.currentTarget as HTMLInputElement).value))}
        aria-label={`${label} slider`}
      />
      {detail && <p class="sl-note">{detail}</p>}
    </div>
  );
}

function clampToRange(v: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, v));
  // Respect finer typed precision than the slider step (e.g. 6.375%).
  const decimals = Math.max(countDecimals(step), 3);
  return Number(clamped.toFixed(decimals));
}

function countDecimals(n: number): number {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
}
