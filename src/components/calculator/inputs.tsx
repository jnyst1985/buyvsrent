import { useEffect, useRef, useState } from 'preact/hooks';

const withCommas = (n: number) => n.toLocaleString('en-US');

/**
 * Singularise a counted unit at 1.
 *
 * The default security deposit is 1, so the plural label rendered "1 months" on
 * every first load. Only the two count nouns need this - "%", "% /yr" and
 * "$ /mo" are not counted. The unit column is a fixed `--field-unit-w`, so a
 * shorter word never changes the field's width.
 */
export const unitFor = (suffix: string, value: number) =>
  value === 1 && (suffix === 'months' || suffix === 'years') ? suffix.slice(0, -1) : suffix;

interface MoneyFieldProps {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  /** Right-hand chip, e.g. "a month". Replaced by the clamp flag when over max. */
  unit?: string;
}

/**
 * Big money input for the converter card.
 *
 * Deliberately not a controlled input: rewriting `value` on every keystroke to
 * add thousands separators moves the caret to the end, so the field is driven
 * through a ref and the caret is restored by distance-from-end (which survives
 * a separator appearing to its left).
 */
export function MoneyField({ id, value, min, max, onChange, ariaLabel, unit }: MoneyFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  // Only ever flags ABOVE max. Below min is almost always mid-typing - someone
  // heading for 420000 passes through 4 - and shouting at them for it is wrong.
  const [over, setOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || el === document.activeElement) return;
    el.value = withCommas(value);
  }, [value]);

  const onInput = () => {
    const el = ref.current;
    if (!el) return;
    const caretFromEnd = el.value.length - (el.selectionStart ?? el.value.length);
    const digits = el.value.replace(/[^0-9]/g, '').slice(0, 9);
    el.value = digits ? withCommas(parseInt(digits, 10)) : '';
    const pos = Math.max(0, el.value.length - caretFromEnd);
    el.setSelectionRange(pos, pos);

    const typed = parseInt(digits, 10);
    setOver(!isNaN(typed) && typed > max);
    onChange(Math.min(max, Math.max(min, isNaN(typed) ? min : typed)));
  };

  const onBlur = () => {
    // Reconcile the field to the value the engine actually used.
    if (ref.current) ref.current.value = withCommas(value);
    setOver(false);
  };

  return (
    <div class="amt">
      <span class="pre">$</span>
      <input
        ref={ref}
        id={id}
        inputMode="numeric"
        aria-label={ariaLabel}
        aria-invalid={over || undefined}
        onInput={onInput}
        onBlur={onBlur}
      />
      {(over || unit) && (
        <span class={over ? 'unit flagamber' : 'unit'}>
          {over ? `max ${withCommas(max)}` : unit}
        </span>
      )}
    </div>
  );
}

interface NumFieldProps {
  id: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  suffix: string;
  label: string;
  onChange: (v: number) => void;
  ariaLabel: string;
}

/** Small inline number for the connector rows (rate, stay). */
export function NumField({
  id,
  value,
  min,
  max,
  decimals = 0,
  suffix,
  label,
  onChange,
  ariaLabel,
}: NumFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const fmt = (n: number) => (decimals ? n.toFixed(decimals) : String(n));

  useEffect(() => {
    const el = ref.current;
    if (!el || el === document.activeElement) return;
    el.value = fmt(value);
  }, [value, decimals]);

  return (
    <div class="crow">
      <span class="nd">
        <i />
      </span>
      <label for={id}>{label}</label>
      <span class="ed">
        <input
          ref={ref}
          id={id}
          inputMode="decimal"
          aria-label={ariaLabel}
          onInput={() => {
            const raw = parseFloat((ref.current?.value ?? '').replace(/[^0-9.]/g, ''));
            if (!isNaN(raw)) onChange(Math.min(max, Math.max(min, raw)));
          }}
          onBlur={() => {
            if (ref.current) ref.current.value = fmt(value);
          }}
        />
        <span class="sfx">{unitFor(suffix, value)}</span>
      </span>
    </div>
  );
}
