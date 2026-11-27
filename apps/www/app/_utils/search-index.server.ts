import { profiles } from '~/_config/profiles';
import { getProfileContentFiles, getProfilePage } from './files.server';

export type SearchIndexItem = {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  /** The page's `category` from the frontmatter. */
  category: string;
  /** Slug of the profile the page belongs to. */
  profile: string;
  keywords: string;
};

export type SearchIndex = SearchIndexItem[];

/**
 * Extract frontmatter from MDX content
 */
function extractFrontmatter(content: string): Record<string, string> {
  // Normalize line endings to LF
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const frontmatterMatch = normalizedContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatterContent = frontmatterMatch[1];
  const frontmatter: Record<string, string> = {};

  for (const line of frontmatterContent.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * Strip MDX/Markdown syntax to get plain text
 */
function stripMdxSyntax(content: string): string {
  // Normalize line endings
  let text = content.replace(/\r\n/g, '\n');

  // Remove frontmatter
  text = text.replace(/^---\n[\s\S]*?\n---\n?/, '');

  // Remove JSX/MDX components
  text = text.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, '');
  text = text.replace(/<[A-Z][^>]*\/>/g, '');

  // Remove HTML comments (repeat until fully removed to avoid incomplete multi-character sanitization)
  let prevText: string;
  do {
    prevText = text;
    text = text.replace(/<!--[\s\S]*?-->/g, '');
  } while (text !== prevText);

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');

  // Remove markdown images
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

  // Remove markdown links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown formatting
  text = text.replace(/[*_~]+([^*_~]+)[*_~]+/g, '$1');

  // Remove headings markers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Truncate for index size
  return text.slice(0, 500);
}

/**
 * Build search index for one profile: its own pages plus the shared ones
 */
function indexProfile(profile: string): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];

  for (const { relativePath } of getProfileContentFiles(profile)) {
    const content = getProfilePage(profile, relativePath);
    const frontmatter = extractFrontmatter(content);
    if (frontmatter.published === 'false') continue;

    // Convert file path to URL path
    const slug = relativePath.replace(/\.mdx$/, '').replace(/\\/g, '/');

    items.push({
      id: `${profile}-${slug}`,
      title: frontmatter.title || slug.split('/').pop() || slug,
      description: (frontmatter.description || '').replace(/`/g, ''),
      content: stripMdxSyntax(content),
      url: `/${profile}/${slug}`,
      category: frontmatter.category || '',
      profile,
      keywords: frontmatter.search_terms || '',
    });
  }

  return items;
}

/**
 * Build the complete search index
 */
export function buildSearchIndex(): SearchIndex {
  return profiles.flatMap((profile) => indexProfile(profile.slug));
}

/** Matches `term` as a whole word, also next to æ, ø and å. */
const isWholeWord = (text: string, term: string) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`,
    'u',
  ).test(text);

/**
 * Simple search function that scores results by relevance. Searches one
 * profile, or all of them when `profile` is left out.
 */
export function searchIndex(
  index: SearchIndex,
  query: string,
  profile?: string,
  limit = 20,
): SearchIndexItem[] {
  if (!query.trim()) return [];

  const queryLower = query.trim().toLowerCase();
  const searchTerms = queryLower.split(/\s+/).filter(Boolean);

  const scored = index
    .filter((item) => !profile || item.profile === profile)
    .map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const contentLower = item.content.toLowerCase();
      const keywordsLower = item.keywords.toLowerCase();

      // Exact match search when query has more than 2 words
      if (searchTerms.length > 2) {
        if (descLower.includes(queryLower)) score += 1000;
        if (contentLower.includes(queryLower)) score += 1000;
      }

      for (const term of searchTerms) {
        // Keyword matches (highly prioritized)
        if (keywordsLower.includes(term)) score += 300;
        // Title matches (heavily prioritized)
        if (titleLower === term) {
          // Exact title match
          score += 1000;
        } else if (titleLower.startsWith(term)) {
          // Title starts with term
          score += 500;
        } else if (titleLower.includes(term)) {
          // Title contains term as a word
          score += isWholeWord(titleLower, term) ? 200 : 100;
        }

        // Description matches
        if (descLower.includes(term)) {
          score += isWholeWord(descLower, term) ? 20 : 10;
        }

        // Content matches (lowest priority)
        if (contentLower.includes(term)) score += 5;
      }

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);

  return scored;
}

// Cache for the search index
let cachedIndex: SearchIndex | null = null;

/**
 * Get or build the search index (with caching, except in dev)
 */
export function getSearchIndex(): SearchIndex {
  if (!cachedIndex || import.meta.env.DEV) {
    cachedIndex = buildSearchIndex();
  }
  return cachedIndex;
}
