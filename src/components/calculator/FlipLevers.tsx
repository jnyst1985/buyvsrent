import type { SensitivityRow } from '../../lib/engine/types';

interface Props {
  sensitivity: SensitivityRow[];
}

/**
 * "What would change the answer" - the sensitivity table rewritten as plain
 * sentences. Jon killed the table-of-numbers version: a reader wants to know
 * whether the verdict is fragile, not to read a grid of deltas.
 */
export function FlipLevers({ sensitivity }: Props) {
  const flips = sensitivity.filter((s) => s.flips);

  return (
    <div class="levers">
      <h3>What would change the answer</h3>
      {flips.length > 0 ? (
        flips.map((s) => (
          <p key={s.key}>
            A one-point move in <b>{s.label.toLowerCase()}</b> is enough to flip the answer.
          </p>
        ))
      ) : (
        <p class="none">
          Nothing here flips it. A one-point move in home appreciation, investment return, rent
          growth or the mortgage rate all leave the same path ahead - the answer is not balanced on
          a knife edge.
        </p>
      )}
    </div>
  );
}
