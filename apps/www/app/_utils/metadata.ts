export const SITE_NAME = 'design.digdir.no';

export interface PageMetadata {
  title: string;
  description?: string;
  profile?: string;
  pathname?: string;
}

export const getMetaImagePath = (pathname: string) =>
  `/images/meta${pathname.replace(/\/+$/, '')}/index.png`;

export const generateMetadata = ({
  title,
  description,
  profile,
  pathname,
}: PageMetadata) => {
  const pageTitle = [title, profile, SITE_NAME].filter(Boolean).join(' - ');
  return [
    { title: pageTitle },
    ...(description ? [{ name: 'description', content: description }] : []),
    ...(pathname
      ? [
          { property: 'og:type', content: 'website' },
          { property: 'og:site_name', content: SITE_NAME },
          { property: 'og:title', content: pageTitle },
          { property: 'og:url', content: `https://${SITE_NAME}${pathname}` },
          ...(description
            ? [{ property: 'og:description', content: description }]
            : []),
          {
            property: 'og:image',
            content: `https://${SITE_NAME}${getMetaImagePath(pathname)}`,
          },
          { property: 'og:image:type', content: 'image/png' },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          { property: 'og:image:alt', content: pageTitle },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: pageTitle },
          ...(description
            ? [{ name: 'twitter:description', content: description }]
            : []),
          {
            name: 'twitter:image',
            content: `https://${SITE_NAME}${getMetaImagePath(pathname)}`,
          },
          { name: 'twitter:image:alt', content: pageTitle },
        ]
      : []),
  ];
};
