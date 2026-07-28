/**
 * The site's one named author.
 *
 * Rent-vs-buy is YMYL territory, so "who is responsible for this content" has
 * to be answerable from any page, not just /about. Every guide carries a byline
 * that links here and repeats this person in its Article schema.
 *
 * The credential is deliberately demonstrated experience rather than a title:
 * the model is public, MIT-licensed and covered by automated tests, which is
 * checkable. A job title is not, and no employer is named.
 */
export const AUTHOR = {
  name: 'Jonathan Nyst',
  /** Byline short form. */
  short: 'Jon Nyst',
  initials: 'JN',
  url: 'https://rentvsbuymath.com/about',
  /** One line, used under the byline and in the About page intro. */
  role: 'Built and maintains the model behind this calculator',
  bio: 'Jonathan Nyst built RentVsBuyMath as an independent project. He is not a lender, broker or agent, and the site takes no referral fees. The whole model is public: every formula is documented on the methodology page, the engine is MIT-licensed, and it is covered by automated tests including scenarios computed by hand to check it.',
  /**
   * Profiles that let a reader (or a search engine) confirm the same person
   * across the web. Only add URLs that actually exist - a wrong sameAs is worse
   * than none.
   */
  sameAs: ['https://github.com/jnyst1985'],
} as const;

/** schema.org Person, reused by /about and every guide. */
export const authorSchema = {
  '@type': 'Person',
  name: AUTHOR.name,
  url: AUTHOR.url,
  description: AUTHOR.role,
  sameAs: [...AUTHOR.sameAs],
} as const;
