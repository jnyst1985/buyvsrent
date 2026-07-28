import type { CoreResults } from '../../lib/engine/types';

interface Props {
  results: CoreResults;
  stayYears: number;
}

const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

/** The inverted variant Jon locked: ink band, acid figure at up to 132px. */
export function AnswerBand({ results, stayYears }: Props) {
  const tie = results.verdict === 'tie';
  const rentWins = results.difference < 0;
  const gap = Math.abs(results.difference);

  return (
    <section class="answer" id="answerBand">
      <div class="wrap">
        <div>
          <div class="eyebrow">
            The answer after {stayYears} year{stayYears === 1 ? '' : 's'}
          </div>
          {/* aria-live lives on the status region in HomePage, not here, so a
              slider drag does not read this figure out on every frame. */}
          <p class="mega">{tie ? 'Level' : `+${round1k(gap)}`}</p>
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
