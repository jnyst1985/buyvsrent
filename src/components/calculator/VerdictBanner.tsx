import { useEffect, useRef, useState } from 'preact/hooks';
import type { CoreResults } from '../../lib/engine/types';
import { formatCurrency } from '../../lib/engine/format';

interface Props {
  results: CoreResults;
  tippingRent: number | null;
  currency: string;
  horizon: number;
}

/** Round to 3 significant figures for the verdict sentence. */
function roundVerdict(v: number): number {
  const abs = Math.abs(v);
  if (abs < 1000) return Math.round(v / 100) * 100;
  const magnitude = 10 ** (Math.floor(Math.log10(abs)) - 2);
  return Math.round(v / magnitude) * magnitude;
}

/** Animates numeric changes over ~300ms so recomputation is felt. */
function useCountUp(target: number): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 300);
      const eased = 1 - (1 - t) ** 3;
      const value = from + (target - from) * eased;
      setDisplay(value);
      fromRef.current = value;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return display;
}

export function VerdictBanner({ results, tippingRent, currency, horizon }: Props) {
  const { verdict, difference } = results;
  const amount = useCountUp(roundVerdict(Math.abs(difference)));
  const bannerRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      rootMargin: '-1px 0px 0px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rentWins = verdict === 'rent';
  const isTie = verdict === 'tie';
  const accent = isTie ? 'border-hairline' : rentWins ? 'border-rent' : 'border-buy';
  const amountText = formatCurrency(amount, currency);

  const sentence = isTie
    ? "It's basically a tie"
    : rentWins
      ? 'Renting and investing wins'
      : 'Buying wins';

  return (
    <>
      <div
        ref={bannerRef}
        class={`rounded-xl border-2 ${accent} bg-white p-5 sm:p-6`}
        aria-live="polite"
      >
        {isTie ? (
          <>
            <p class="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              It's basically a tie
            </p>
            <p class="mt-1.5 text-ink-secondary">
              The gap is under 1% after {horizon} years — your assumptions matter more than the
              math. Try the sliders below to see what tips it.
            </p>
          </>
        ) : (
          <>
            <p class="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {sentence}{' '}
              <span class={rentWins ? 'text-rent' : 'text-buy'}>by {amountText}</span>
            </p>
            <p class="mt-1.5 text-ink-secondary">
              over your {horizon}-year stay, counting every cost, tax, and selling fee.
            </p>
          </>
        )}
        {tippingRent !== null && (
          <p class="mt-3 border-t border-hairline pt-3 text-sm text-ink-secondary">
            Tipping point: buying becomes the better deal if a similar rental costs more than{' '}
            <strong class="text-ink">{formatCurrency(tippingRent, currency)}/month</strong>.
          </p>
        )}
      </div>

      {/* Sticky condensed verdict once the banner scrolls away (mobile-first). */}
      <div
        class={`fixed inset-x-0 top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur transition-transform sm:hidden ${stuck ? 'translate-y-0' : '-translate-y-full'}`}
        aria-hidden={!stuck}
      >
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-ink"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {isTie ? (
            'Basically a tie — see why'
          ) : (
            <>
              {rentWins ? 'Renting + investing' : 'Buying'}
              <span class={rentWins ? 'text-rent' : 'text-buy'}>+{amountText}</span>
              <span aria-hidden="true" class="text-ink-muted">▲</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
