export const SITE_NAME = 'design.digdir.no';

export interface PageMetadata {
  title: string;
  description?: string;
  profile?: string;
}

/**
 * Build the meta descriptor array React Router's `meta` export expects.
 * Kept intentionally small – extend with og/twitter tags as needed.
 */
export const generateMetadata = ({
  title,
  description,
  profile,
}: PageMetadata) => [
  { title: [title, profile, SITE_NAME].filter(Boolean).join(' - ') },
  ...(description ? [{ name: 'description', content: description }] : []),
];
