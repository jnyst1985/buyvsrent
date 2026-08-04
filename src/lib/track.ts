/**
 * Fire-and-forget product events. GA4 first, mirrored to Clarity so sessions
 * can be segmented by the same moments in both tools.
 *
 * Safe everywhere by construction: no-ops when the analytics scripts are
 * absent (dev builds, blocked scripts, unset .env - Analytics.astro renders
 * nothing then), and analytics must never break the product, so everything is
 * wrapped. Components call track() from event handlers and effects only, so
 * this never runs during SSR.
 *
 * The event vocabulary is deliberately tiny - four events, defined where the
 * product moments live, not one per widget:
 *   calc_engaged  {tool}          first real input change per page load
 *   calc_input    {tool, fields}  settled change (rides the 160ms debounce)
 *   verdict_flip  {to}            the winner changed under user input
 *   share_copy    {what}          the two Keep buttons: ai_text | link
 */
type Params = Record<string, string | number | boolean>;

export function track(event: string, params?: Params): void {
  try {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      clarity?: (...args: unknown[]) => void;
    };
    if (typeof w.gtag === 'function') w.gtag('event', event, params ?? {});
    if (typeof w.clarity === 'function') w.clarity('event', event);
  } catch {
    /* never let analytics take the calculator down */
  }
}
