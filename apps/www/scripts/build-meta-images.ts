import { mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { colors as digdirColors } from '@digdir/digdir-design/digdir/illustrations/meta';
import { PersonSomGarMedSirkel } from '@digdir/digdir-design/digdir/illustrations/react';
import {
  illustrationLoaders,
  resolveColorScheme,
} from '@digdir/digdir-design/illustrations';
import matter from 'gray-matter';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import satori from 'satori';
import sharp from 'sharp';
import { type Profile, profiles } from '../app/_config/profiles';
import {
  getFileFromContentDir,
  getProfileContentFiles,
} from '../app/_utils/files.server';
import { getMetaImagePath, SITE_NAME } from '../app/_utils/metadata';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const outputDir = join(publicDir, 'images/meta');
const fonts = await Promise.all(
  ([400, 700] as const).map(async (weight) => ({
    name: 'Inter',
    data: await readFile(
      fileURLToPath(
        import.meta.resolve(
          `@fontsource/inter/files/inter-latin-${weight}-normal.woff`,
        ),
      ),
    ),
    weight,
    style: 'normal' as const,
  })),
);

async function getArtwork(profile: Profile): Promise<string | undefined> {
  let source: Buffer;
  // Only the digdir profile is exported from the package. The others are
  // reached through the shared illustrations entry, which sits next to them.
  if (profile.slug === 'uutilsynet') {
    const illustrationsModule = import.meta.resolve(
      '@digdir/digdir-design/illustrations',
    );
    source = await readFile(
      fileURLToPath(
        new URL('./uutilsynet/dame-holder-nettbrett.png', illustrationsModule),
      ),
    );
  } else if (profile.slug === 'ki-norge') {
    const { svgs } = await illustrationLoaders['ki-norge']();
    source = Buffer.from(svgs.laptop);
  } else if (profile.slug === 'digdir') {
    const svg = resolveColorScheme(
      renderToStaticMarkup(
        createElement(PersonSomGarMedSirkel, { sirkel: 'red' }),
      ),
      digdirColors,
      'light',
      {
        '--design-illustration-digdir-person-som-gar-med-sirkel-sirkel': 'red',
      },
    );
    source = Buffer.from(svg);
  } else {
    return undefined;
  }
  const png = await sharp(source)
    .resize(430, 470, { fit: 'inside' })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

async function generateImage(
  profile: Profile,
  pathname: string,
  title: string,
  artwork?: string,
) {
  const svg = await satori(
    createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: 64,
          gap: 40,
          backgroundColor: profile.card.color,
          color: '#1e2b3c',
          fontFamily: 'Inter',
        },
      },
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: artwork ? 602 : 1072,
            height: 502,
          },
        },
        createElement(
          'div',
          { style: { fontSize: 32, color: profile.color } },
          profile.name,
        ),
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              fontSize: title.length > 60 ? 42 : 56,
              fontWeight: 700,
              lineHeight: 1.15,
              overflowWrap: 'anywhere',
            },
          },
          title,
        ),
        createElement('div', { style: { fontSize: 24 } }, SITE_NAME),
      ),
      artwork
        ? createElement('img', {
            src: artwork,
            width: 430,
            height: 470,
            style: { objectFit: 'contain' },
          })
        : null,
    ),
    { width: 1200, height: 630, fonts },
  );
  const destination = join(publicDir, getMetaImagePath(pathname));
  await mkdir(dirname(destination), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(destination);
}

await rm(outputDir, { recursive: true, force: true });
let count = 0;
for (const profile of profiles) {
  const artwork = await getArtwork(profile);
  await generateImage(profile, `/${profile.slug}`, profile.name, artwork);
  count++;
  for (const file of getProfileContentFiles(profile.slug)) {
    const { data } = matter(
      getFileFromContentDir(join(file.dir, file.relativePath)),
    );
    const pathname = `/${profile.slug}/${file.relativePath.replace(/\\/g, '/').replace(/\.mdx$/, '')}`;
    await generateImage(
      profile,
      pathname,
      String(data.title ?? SITE_NAME),
      artwork,
    );
    count++;
  }
}
console.log(`Generated ${count} meta images in public/images/meta.`);
