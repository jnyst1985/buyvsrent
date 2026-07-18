import { useState } from 'preact/hooks';
import type { EngineResults } from '../../lib/engine/types';
import { formatCurrency } from '../../lib/engine/format';

interface Props {
  results: EngineResults;
  currency: string;
  horizon: number;
  /** Current share URL (kept in sync with inputs by the root). */
  shareUrl: string;
}

export function ShareSheet({ results, currency, horizon, shareUrl }: Props) {
  const [copied, setCopied] = useState<'link' | 'verdict' | null>(null);

  const verdictText =
    results.verdict === 'tie'
      ? `Rent vs. buy is basically a tie in my scenario (${horizon} years) — check yours:`
      : results.verdict === 'rent'
        ? `Renting + investing beats buying by ${formatCurrency(Math.abs(results.difference), currency)} over ${horizon} years in my scenario — see if it does in yours:`
        : `Buying beats renting by ${formatCurrency(Math.abs(results.difference), currency)} over ${horizon} years in my scenario — see if it does in yours:`;

  const copy = async (text: string, which: 'link' | 'verdict') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable (permissions/http): fall back to prompt.
      window.prompt('Copy this link:', text);
    }
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Rent vs. Buy Calculator', text: verdictText, url: shareUrl }).catch(() => {});
      return true;
    }
    return false;
  };

  return (
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-lg bg-buy px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        onClick={() => copy(shareUrl, 'link')}
      >
        {copied === 'link' ? 'Link copied ✓' : 'Copy link to this scenario'}
      </button>
      <button
        type="button"
        class="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-raised"
        onClick={() => {
          if (!nativeShare()) copy(`${verdictText} ${shareUrl}`, 'verdict');
        }}
      >
        {copied === 'verdict' ? 'Copied ✓' : 'Share the verdict'}
      </button>
    </div>
  );
}
