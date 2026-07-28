import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Guide categories.
 *
 * Assigned now so nothing ships uncategorised, but the pill row on /guides only
 * renders once a category actually holds enough posts to read as one - four
 * guides across four pills looks broken, not organised. See
 * CATEGORY_PILL_THRESHOLD in src/pages/guides/index.astro.
 *
 * A working set, not a final taxonomy: these should follow real keyword targets.
 */
export const CATEGORIES = ['The math', 'Rates & timing', 'Taxes', 'Myths', 'By market'] as const;

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Short label for cards/nav, defaults to title. */
    shortTitle: z.string().optional(),
    category: z.enum(CATEGORIES),
    /** The one guide featured at the top of /guides. Exactly one should set it. */
    pillar: z.boolean().optional(),
    /**
     * Mortgage rate the article's inline figures are computed at. Defaults to
     * the model default, so a guide arguing about 7% quotes 7% figures and can
     * never drift from the engine.
     */
    calcRate: z.number().optional(),
  }),
});

const sections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sections' }),
  schema: z.object({ title: z.string() }),
});

export const collections = { guides, sections };
