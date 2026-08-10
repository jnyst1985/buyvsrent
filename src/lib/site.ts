/**
 * Facts about the site that appear in published copy in more than one place.
 *
 * The point of this file is that there is exactly ONE place to edit each of
 * them. The test count had already drifted twice - the footer said 57 on every
 * page while the README said 72 and the suite actually ran 82 - because the
 * same number was typed into five files by hand. On a site whose entire pitch
 * is "our figures do not drift", that is the worst possible thing to get wrong.
 *
 * `site-facts.test.ts` asserts that every file publishing one of these contains
 * the current value, so changing it here names the files still to update.
 */

/**
 * Number of tests in `npm test`. Read it off the vitest summary line; it is not
 * derivable at build time, which is exactly why it lives in one place.
 */
export const TEST_COUNT = 112;

/** Independently hand-derived verification vectors, a subset of TEST_COUNT. */
export const VECTOR_COUNT = 10;
