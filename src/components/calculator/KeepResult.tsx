import { useEffect, useRef, useState } from 'preact/hooks';
import { buildKeepText, scenarioLink } from '../../lib/keepText';
import { track } from '../../lib/track';
import type { CoreResults, EngineInputs } from '../../lib/engine/types';

interface Props {
  inputs: EngineInputs;
  results: CoreResults;
  tippingRent: number | null;
  investedMonthly: number;
}

export function KeepResult({ inputs, results, tippingRent, investedMonthly }: Props) {
  const text = buildKeepText(inputs, results, tippingRent, investedMonthly);
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 1800);
  };

  const copy = async (value: string, ok: string, what: 'ai_text' | 'link') => {
    // Tracked on click (the intent), not on clipboard success - the fallback
    // path cannot reliably report success anyway.
    track('share_copy', { what });
    try {
      await navigator.clipboard.writeText(value);
      flash(ok);
      return;
    } catch {
      // Clipboard API needs a secure context and a permission that some
      // browsers refuse; fall back to a throwaway textarea + execCommand.
    }
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      flash(ok);
    } catch {
      flash('Press Cmd+C to copy');
    }
    ta.remove();
  };

  return (
    <div class="kcard">
      <pre class="kpre">{text}</pre>
      <div class="krow">
        <button
          class="pill"
          type="button"
          onClick={() => copy(text, 'Copied - paste it into your AI', 'ai_text')}
        >
          Copy for your AI
        </button>
        <button
          class="pill ghost"
          type="button"
          onClick={() => copy(scenarioLink(inputs), 'Link copied', 'link')}
        >
          Copy link to this scenario
        </button>
        {/* aria-live so the confirmation reaches screen readers, which cannot
            see the fade. */}
        <span class={msg ? 'kmsg on' : 'kmsg'} role="status" aria-live="polite">
          {msg}
        </span>
      </div>
    </div>
  );
}
