import { useEffect, useRef, useState } from 'preact/hooks';
import type { CoreResults } from '../../lib/engine/types';
import { formatCurrency } from '../../lib/engine/format';

interface Props {
  results: CoreResults;
  tippingRent: number | null;
  /** Whether the deferred analysis has produced a value at least once. */
  analysisReady: boolean;
  /** True while a fresh analysis computes; the last value stays, dimmed. */
  analysisPending: boolean;
  currency: string;
  horizon: number;
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

export function VerdictBanner({ results, tippingRent, analysisReady, analysisPending, currency, horizon }: Props) {
  const { verdict, difference, rentNetWorth, buyNetWorth } = results;
  const rentWins = verdict === 'rent';
  const isTie = verdict === 'tie';

  // The sentence leans on two figures: the winner's ending net worth (the hero)
  // and the gap. Both ride the same 300ms curve, so they start and land in step
  // and never drift out of sync — tabular-nums keeps their width steady mid-count.
  const heroNetWorth = useCountUp(rentWins ? rentNetWorth : buyNetWorth);
  const gap = useCountUp(Math.abs(difference));
  const heroText = formatCurrency(heroNetWorth, currency);
  const gapText = formatCurrency(gap, currency);

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

  const accent = isTie ? 'border-hairline' : rentWins ? 'border-rent' : 'border-buy';
  const winColor = rentWins ? 'text-rent' : 'text-buy';

  return (
    <>
      <div ref={bannerRef} class={`rounded-xl border-2 ${accent} bg-white p-5 sm:p-6`} aria-live="polite">
        {isTie ? (
          <>
            <p class="text-[19px] leading-[1.42] tracking-[-0.005em] text-ink sm:text-[21px]">
              After {horizon} years, renting and buying finish within{' '}
              <span class="text-[23px] font-[750] tracking-[-0.02em] tabular-nums sm:text-[27px]">{gapText}</span> of
              each other — essentially a tie.
            </p>
            <p class="mt-[9px] text-[15px] leading-[1.5] text-ink-secondary">
              The gap is under 1%, so your assumptions matter more than the math. Try the sliders below to see what tips
              it.
            </p>
          </>
        ) : (
          <>
            <p class="text-[19px] leading-[1.42] tracking-[-0.005em] text-ink sm:text-[21px]">
              After {horizon} years, {rentWins ? 'renting and investing' : 'buying'} leaves you with{' '}
              <span class={`text-[23px] font-[750] tracking-[-0.02em] tabular-nums sm:text-[27px] ${winColor}`}>
                {heroText}
              </span>
              {' — '}
              <span class={`font-bold tabular-nums ${winColor}`}>{gapText} more</span> than{' '}
              {rentWins ? 'buying' : 'renting'}.
            </p>
            <p class="mt-[9px] text-[15px] leading-[1.5] text-ink-secondary">
              every mortgage payment, tax break, and selling fee counted.
            </p>
          </>
        )}
        {analysisReady ? (
          tippingRent !== null && (
            <p
              class={`mt-3 border-t border-hairline pt-3 text-sm text-ink-secondary transition-opacity duration-200 ${analysisPending ? 'opacity-50' : 'opacity-100'}`}
            >
              Tipping point: buying becomes the better deal if a similar rental costs more than{' '}
              <strong class="text-ink">{formatCurrency(tippingRent, currency)}/month</strong>.
            </p>
          )
        ) : (
          // Before the first analysis lands, reserve the row's height so the
          // sentence appearing doesn't shift the layout on initial load.
          <p class="invisible mt-3 border-t border-hairline pt-3 text-sm" aria-hidden="true">
            &nbsp;
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
              {rentWins ? 'Renting' : 'Buying'}
              <span class={winColor}>+{gapText}</span>
              <span aria-hidden="true" class="text-ink-muted">
                ▲
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
