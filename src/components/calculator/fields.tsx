import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { formatNumber } from '../../lib/engine/format';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (v: number) => void;
  /** e.g. "$" prefix or "%" / "yrs" suffix on the editable value. */
  prefix?: string;
  suffix?: string;
  /** Extra line under the label (e.g. down-payment $ echo or link control). */
  detail?: ComponentChildren;
  format?: (v: number) => string;
  id: string;
}

/** Slider + editable formatted value: drag for feel, type for precision. */
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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    setEditing(false);
    const n = Number.parseFloat(draft.replace(/[^0-9.\-]/g, ''));
    if (Number.isFinite(n)) onInput(clampToRange(n, min, max, step));
  };

  return (
    <div class="py-2.5">
      <div class="flex items-baseline justify-between gap-3">
        <label htmlFor={id} class="text-sm font-medium text-ink">
          {label}
        </label>
        {editing ? (
          <input
            class="w-28 rounded border border-hairline px-1.5 py-0.5 text-right text-sm tabular focus:border-buy focus:outline-none"
            value={draft}
            onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDraft();
              if (e.key === 'Escape') setEditing(false);
            }}
            inputMode="decimal"
            aria-label={`${label} (type a value)`}
            ref={(el) => el?.focus()}
          />
        ) : (
          <button
            type="button"
            class="rounded px-1 text-sm font-semibold text-ink tabular hover:bg-surface-raised"
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            aria-label={`${label}: ${prefix}${format(value)}${suffix}. Click to type a value.`}
          >
            {prefix}
            {format(value)}
            {suffix}
          </button>
        )}
      </div>
      <input
        id={id}
        type="range"
        class="slider mt-1.5 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
        aria-label={label}
      />
      {detail && <div class="mt-0.5 text-xs text-ink-muted">{detail}</div>}
    </div>
  );
}

function clampToRange(v: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, v));
  // Respect finer typed precision than the slider step (e.g. 6.375% rate).
  const decimals = Math.max(countDecimals(step), 3);
  return Number(clamped.toFixed(decimals));
}

function countDecimals(n: number): number {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
}

interface CompactNumberProps {
  label: string;
  value: number;
  onInput: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  id: string;
}

/** Small label+number row for advanced groups. */
export function CompactNumber({
  label,
  value,
  onInput,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  hint,
  id,
}: CompactNumberProps) {
  return (
    <div class="flex items-center justify-between gap-3 py-1.5">
      <label htmlFor={id} class="text-sm text-ink-secondary" title={hint}>
        {label}
        {hint && (
          <span class="ml-1 cursor-help text-ink-muted" aria-label={hint} title={hint}>
            ⓘ
          </span>
        )}
      </label>
      <div class="flex items-center gap-1 text-sm">
        {prefix && <span class="text-ink-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          class="w-24 rounded border border-hairline px-2 py-1 text-right text-sm tabular focus:border-buy focus:outline-none"
          value={value}
          min={min}
          max={max}
          step={step}
          onInput={(e) => {
            const n = Number.parseFloat((e.target as HTMLInputElement).value);
            if (Number.isFinite(n)) onInput(Math.min(max, Math.max(min, n)));
          }}
        />
        {suffix && <span class="text-ink-muted">{suffix}</span>}
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  id: string;
}

export function Toggle({ label, checked, onChange, hint, id }: ToggleProps) {
  return (
    <div class="flex items-center justify-between gap-3 py-1.5">
      <label htmlFor={id} class="text-sm text-ink-secondary" title={hint}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        class={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-buy' : 'bg-hairline'}`}
        onClick={() => onChange(!checked)}
      >
        <span
          class={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

interface GroupProps {
  title: string;
  summary: string;
  children: ComponentChildren;
  onReset?: () => void;
}

/** Collapsed advanced-input group whose header shows a live value summary. */
export function Group({ title, summary, children, onReset }: GroupProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div class="border-t border-hairline">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span class="text-sm font-medium text-ink">{title}</span>
        <span class="flex min-w-0 items-center gap-2">
          {!open && (
            <span class="truncate text-xs text-ink-muted" aria-hidden="true">
              {summary}
            </span>
          )}
          <svg
            class={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div ref={contentRef} class="pb-3">
          {children}
          {onReset && (
            <button
              type="button"
              class="mt-2 text-xs text-buy underline underline-offset-2"
              onClick={onReset}
            >
              Reset to typical values
            </button>
          )}
        </div>
      )}
    </div>
  );
}
