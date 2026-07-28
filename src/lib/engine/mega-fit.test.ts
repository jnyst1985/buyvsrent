import { describe, expect, it } from 'vitest';
import { emWidth } from '../../components/calculator/AnswerBand';

/**
 * The answer band sizes its figure to FIT its column, using emWidth() to know
 * how wide the string will be before it is drawn. If that estimate drifts from
 * the real font, the figure silently overlaps the copy in the right-hand
 * column again - which is exactly the bug this replaced, and it looks like a
 * layout accident rather than a broken constant.
 *
 * GROUND TRUTH: widths measured in Chromium against the live .mega element
 * (Manrope 800, letter-spacing -0.04em, font-variant-numeric: tabular-nums),
 * expressed as a multiple of font-size. Re-measure these if the display font
 * or the tracking on .mega ever changes.
 */
const MEASURED: Record<string, number> = {
  '+$1,000': 3.727,
  '+$67,000': 4.3071,
  '+$159,000': 4.8871,
  '+$999,000': 4.8871,
  '+$1,200,000': 5.743,
  '+$17,858,000': 6.323,
};

describe('answer band figure fitting', () => {
  for (const [str, measured] of Object.entries(MEASURED)) {
    it(`estimates "${str}" within 0.01em of the browser`, () => {
      expect(Math.abs(emWidth(str) - measured)).toBeLessThan(0.01);
    });
  }

  it('gives every digit the same width, because the figures are tabular', () => {
    // If this stopped holding, the estimate would drift with the DIGITS in the
    // number rather than its length, which is far harder to notice.
    expect(emWidth('+$111,111')).toBeCloseTo(emWidth('+$999,999'), 6);
  });

  it('grows by exactly one digit-width per extra digit', () => {
    expect(emWidth('+$159,000') - emWidth('+$67,000')).toBeCloseTo(0.58, 6);
  });

  /**
   * The CSS is `min(132px, (100cqi - 4px) / --em)`. The estimate is allowed to
   * sit a hair UNDER the true width (it does, by ~0.001em), and that 4px is
   * what absorbs it. This pins the headroom: at the largest size the shortfall
   * must stay well inside 4px, or the figure can touch the next column.
   */
  it('never under-estimates by more than the 4px of slack the CSS allows', () => {
    for (const [str, measured] of Object.entries(MEASURED)) {
      const shortfallPx = (measured - emWidth(str)) * 132;
      expect(shortfallPx).toBeLessThan(4);
    }
  });

  it('handles the tie label without blowing up', () => {
    expect(emWidth('Level')).toBeGreaterThan(0);
    expect(emWidth('Level')).toBeLessThan(4);
  });
});
