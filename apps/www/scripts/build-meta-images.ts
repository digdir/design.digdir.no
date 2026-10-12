import { mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveColorScheme } from '@digdir/design/illustrations';
import { colors as digdirColors } from '@digdir/design/illustrations/digdir/meta';
import { PersonSomGarMedSirkel } from '@digdir/design/illustrations/digdir/react';
import { Laptop } from '@digdir/design/illustrations/ki-norge/react';
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
  [
    ['Inter', '@fontsource/inter/files/inter-latin-400-normal.woff', 400],
    ['Inter', '@fontsource/inter/files/inter-latin-700-normal.woff', 700],
    [
      'Instrument Sans',
      'Instrument_Sans/static/InstrumentSans-Regular.ttf',
      400,
    ],
    ['Instrument Sans', 'Instrument_Sans/static/InstrumentSans-Bold.ttf', 700],
    ['PT Serif', 'PT_Serif/PTSerif-Bold.ttf', 700],
  ].map(async ([name, file, weight]) => ({
    name: String(name),
    data: await readFile(
      String(file).startsWith('@fontsource/')
        ? fileURLToPath(import.meta.resolve(String(file)))
        : join(publicDir, 'fonts', String(file)),
    ),
    weight: weight as 400 | 700,
    style: 'normal' as const,
  })),
);

async function getArtwork(profile: Profile): Promise<string | undefined> {
  let source: Buffer;
  if (profile.slug === 'uutilsynet') {
    const imagesModule = import.meta.resolve(
      '@digdir/design/illustrations/uutilsynet/images',
    );
    source = await readFile(
      fileURLToPath(new URL('./dame-holder-nettbrett.png', imagesModule)),
    );
  } else if (profile.slug === 'digdir' || profile.slug === 'ki-norge') {
    const artwork =
      profile.slug === 'digdir'
        ? createElement(PersonSomGarMedSirkel, { sirkel: 'red' })
        : createElement(Laptop);
    const svg = resolveColorScheme(
      renderToStaticMarkup(artwork),
      profile.slug === 'digdir' ? digdirColors : [],
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
  const textFont = profile.card.textFont?.includes('Instrument Sans')
    ? 'Instrument Sans'
    : 'Inter';
  const headingFont = profile.card.headingFont?.includes('PT Serif')
    ? 'PT Serif'
    : 'Inter';
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
          fontFamily: textFont,
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
              fontFamily: headingFont,
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
