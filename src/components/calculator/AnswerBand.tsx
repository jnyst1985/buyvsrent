import type { CoreResults } from '../../lib/engine/types';

interface Props {
  results: CoreResults;
  stayYears: number;
}

const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

/**
 * Width of the figure in ems, so CSS can size it to fit its column.
 *
 * Advances measured in-browser for Manrope 800 at the -0.04em tracking .mega
 * uses, and already net of that tracking. `font-variant-numeric: tabular-nums`
 * gives every digit the same advance, which is what makes this exact rather
 * than an estimate: "+$159,000" is knowably one digit wider than "+$67,000".
 *
 * Letters fall back to a deliberately generous 0.62 - the only word that ever
 * lands here is "Level", which is short enough that it never hits the cap.
 */
const EM_ADVANCE: Record<string, number> = { '+': 0.53, $: 0.6, ',': 0.276, '.': 0.28, '-': 0.36 };
const DIGIT_EM = 0.58;
export const emWidth = (s: string) =>
  [...s].reduce(
    (total, ch) => total + (ch >= '0' && ch <= '9' ? DIGIT_EM : (EM_ADVANCE[ch] ?? 0.62)),
    0
  );

/** The inverted variant Jon locked: ink band, acid figure at up to 132px. */
export function AnswerBand({ results, stayYears }: Props) {
  const tie = results.verdict === 'tie';
  const rentWins = results.difference < 0;
  const gap = Math.abs(results.difference);
  const figure = tie ? 'Level' : `+${round1k(gap)}`;

  return (
    <section class="answer" id="answerBand">
      <div class="wrap">
        <div class="megacol">
          <div class="eyebrow">
            The answer after {stayYears} year{stayYears === 1 ? '' : 's'}
          </div>
          {/* aria-live lives on the status region in HomePage, not here, so a
              slider drag does not read this figure out on every frame. */}
          <p class="mega" style={{ '--em': emWidth(figure).toFixed(3) }}>
            {figure}
          </p>
        </div>
        <div>
          <p class="megasub">
            {tie
              ? 'Neither path pulls ahead at these numbers.'
              : rentWins
                ? 'Renting and investing ends that far ahead.'
                : 'Buying ends that far ahead.'}
          </p>
          <p class="megafoot">
            {tie
              ? 'Within one percent of each other, which is well inside the margin of the assumptions. Treat this as a tie and decide on the things this page cannot measure.'
              : 'That is the difference in what you are worth at the end of the stay - not what you paid, and not what the home is worth.'}
          </p>
        </div>
      </div>
    </section>
  );
}
