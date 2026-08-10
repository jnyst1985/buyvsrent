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
  /**
   * Byline form. Jonathan's standing instruction (2026-08-04): his name is
   * always published as "Jonathan Nyst", never shortened to "Jon Nyst".
   */
  short: 'Jonathan Nyst',
  initials: 'JN',
  url: 'https://rentvsbuymath.com/about',
  /** One line, used under the byline and in the About page intro. */
  role: 'Built and maintains the model behind this calculator',
  bio: 'Jonathan Nyst built RentVsBuyMath as an independent project — for himself first. He spent fifteen years marketing financial products, in banking, fintech and payments at CMO level, which is exactly how he knows what a lead-generation calculator looks like from the inside. This is the calculator without the funnel: he is not a lender, broker or agent, the site takes no referral fees, and nobody is paid more if you decide to buy. The whole model is public — every formula documented on the methodology page, the engine MIT-licensed, covered by automated tests including scenarios computed by hand to check it.',
  /** Photo shipped 2026-08-11; also the Person schema image. */
  image: 'https://rentvsbuymath.com/jonathan-nyst.jpg',
  /**
   * Profiles that let a reader (or a search engine) confirm the same person
   * across the web. Only add URLs that actually exist - a wrong sameAs is worse
   * than none.
   */
  sameAs: ['https://github.com/jnyst1985', 'https://www.linkedin.com/in/jonathannyst/'],
} as const;

/** schema.org Person, reused by /about and every guide. */
export const authorSchema = {
  '@type': 'Person',
  name: AUTHOR.name,
  url: AUTHOR.url,
  description: AUTHOR.role,
  image: AUTHOR.image,
  sameAs: [...AUTHOR.sameAs],
} as const;
