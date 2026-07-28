/**
 * Reading time from the raw markdown body.
 *
 * Computed rather than hand-authored in frontmatter: a "7 min read" typed by
 * hand is one more figure that silently drifts as the article is edited.
 */
export function readingMinutes(markdown: string, wordsPerMinute = 230): number {
  const prose = markdown
    // Tables are scanned, not read; code and links shouldn't inflate the count.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\|.*$/gm, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, ' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
