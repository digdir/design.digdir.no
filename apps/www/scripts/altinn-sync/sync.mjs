/**
 * Synkroniserer komponentsidene for Altinn med kildene:
 *
 * - Innboks:               Altinn/altinn-components (lib/components og __screenshots__)
 * - Altinn Studio:         Storybook for Studio-komponentene (altinn-studio, libs/designer-components)
 * - Skjemaer og tjenester: Storybook for skjemakomponentene (altinn-studio, common/ts/form-component)
 *                          og komponentmappene i altinn-studio/src/App/frontend/src/layout
 *
 * Skriptet skriver bilder til public/images/altinn/<produkt>/ og bytter ut innholdet mellom
 * {/* altinn-sync:start *\/} og {/* altinn-sync:end *\/} i MDX-filene. Alt utenfor markørene
 * redigeres for hånd.
 *
 * Miljøvariabler:
 *   AC_REPO         Sti til en checkout av Altinn/altinn-components (minst lib/components)
 *   AS_REPO         Sti til en checkout av Altinn/altinn-studio (minst src/App/frontend/src/layout)
 *   SB_STUDIO       Sti til ferdigbygd Storybook for designer-components
 *   SB_FORM         Sti til ferdigbygd Storybook for form-component
 *   PLAYWRIGHT_DIR  Mappe der playwright er installert (valgfri)
 *   SUMMARY_FILE    Fil som får en oppsummering i Markdown (valgfri, brukes i PR-teksten)
 *   ONLY            Kommaseparert liste: innboks,studio,skjema (valgfri)
 */
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import sharp from 'sharp';

const env = process.env;
const WWW = path.resolve(import.meta.dirname, '../..');
const CONTENT = path.join(WWW, 'app/content/altinn');
const IMAGES = path.join(WWW, 'public/images/altinn');
const groups = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'groups.json'), 'utf8'),
);
const only = env.ONLY ? env.ONLY.split(',') : ['innboks', 'studio', 'skjema'];
const requireFrom = createRequire(
  path.join(env.PLAYWRIGHT_DIR || WWW, 'package.json'),
);
const { chromium } = requireFrom('playwright');
const wwwRequire = createRequire(path.join(WWW, 'package.json'));
const fontDir = path.join(
  path.dirname(wwwRequire.resolve('@fontsource/inter/package.json')),
  'files',
);

const START = '{/* altinn-sync:start */}';
const END = '{/* altinn-sync:end */}';
const NEW_GROUP = 'Nye komponenter';
const summary = [];

/* ---------- hjelpere ---------- */

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const subdirs = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

const storyId = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const kebab = (name) =>
  name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

const fileName = (name) => `${name.replace(/\//g, '-').toLowerCase()}.webp`;

/** Bytter ut det genererte innholdet i en MDX-fil og returnerer komponentene før og etter. */
const replaceSection = (file, body) => {
  const full = path.join(CONTENT, file);
  const src = fs.readFileSync(full, 'utf8');
  const a = src.indexOf(START);
  const b = src.indexOf(END);
  if (a === -1 || b === -1) {
    throw new Error(`${file} mangler markørene ${START} og ${END}`);
  }
  const old = src.slice(a + START.length, b);
  const names = (text) =>
    new Set(
      [
        ...text.matchAll(/^#### (.+)$/gm),
        ...text.matchAll(/\[([^\]]+)\]\(https:\/\/github\.com[^)]*\)/g),
      ]
        .map((m) => m[1])
        .filter((n) => !['Kode', 'Storybook'].includes(n)),
    );
  const before = names(old);
  const after = names(body);
  fs.writeFileSync(
    full,
    `${src.slice(0, a + START.length)}\n${body}\n${src.slice(b)}`,
  );
  return {
    added: [...after].filter((n) => !before.has(n)),
    removed: [...before].filter((n) => !after.has(n)),
  };
};

const report = (title, { added, removed }, extra = []) => {
  const lines = [`### ${title}`];
  if (added.length) lines.push(`- Nye: ${added.join(', ')}`);
  if (removed.length) lines.push(`- Fjernet: ${removed.join(', ')}`);
  lines.push(...extra);
  if (!added.length && !removed.length && !extra.length) {
    lines.push(
      '- Ingen nye eller fjernede komponenter. Skjermbilder kan være oppdatert.',
    );
  }
  summary.push(lines.join('\n'));
};

const writeImage = (dir, name, buf) => {
  fs.mkdirSync(path.join(IMAGES, dir), { recursive: true });
  const dest = path.join(IMAGES, dir, name);
  if (!fs.existsSync(dest) || !fs.readFileSync(dest).equals(buf)) {
    fs.writeFileSync(dest, buf);
  }
};

const removeStaleImages = (dir, keep) => {
  const d = path.join(IMAGES, dir);
  if (!fs.existsSync(d)) return [];
  const stale = fs
    .readdirSync(d)
    .filter((f) => f.endsWith('.webp') && !keep.has(f));
  for (const f of stale) fs.rmSync(path.join(d, f));
  return stale;
};

const serve = (root) =>
  new Promise((resolve) => {
    const types = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.woff2': 'font/woff2',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
    };
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = path.join(root, url === '/' ? 'index.html' : url);
      if (
        !file.startsWith(root) ||
        !fs.existsSync(file) ||
        fs.statSync(file).isDirectory()
      ) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        'content-type': types[path.extname(file)] || 'application/octet-stream',
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, () => resolve({ server, port: server.address().port }));
  });

const SNAPSHOTS = path.join(WWW, 'public/altinn-snapshots');

/** Felles Inter-fonter for alle utdragene. */
const writeSnapshotFonts = () => {
  const dir = path.join(SNAPSHOTS, 'fonts');
  fs.mkdirSync(dir, { recursive: true });
  const faces = [];
  for (const w of [400, 500, 600, 700]) {
    for (const s of ['latin', 'latin-ext']) {
      const name = `inter-${s}-${w}-normal.woff2`;
      fs.copyFileSync(path.join(fontDir, name), path.join(dir, name));
      faces.push(
        `@font-face{font-family:'Inter';font-weight:${w};font-style:normal;font-display:swap;src:url(fonts/${name}) format('woff2');}`,
      );
    }
  }
  fs.writeFileSync(path.join(SNAPSHOTS, 'fonts.css'), `${faces.join('\n')}\n`);
};

const escapeAttr = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const attrs = (list) =>
  list
    .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
    .join('');

/**
 * Henter HTML-en til én story per tittel fra en ferdigbygd Storybook, og all CSS
 * som storyene bruker. Skriver én HTML-fil per komponent og én felles CSS-fil.
 */
const snapshotStorybook = async (dir, titles, product) => {
  const index = JSON.parse(
    fs.readFileSync(path.join(dir, 'index.json'), 'utf8'),
  ).entries;
  const byTitle = {};
  for (const [id, e] of Object.entries(index)) {
    if (e.type !== 'story') continue;
    byTitle[e.title] = [...(byTitle[e.title] || []), id];
  }
  const { server, port } = await serve(dir);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  await page.route('https://altinncdn.no/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  );
  const outDir = path.join(SNAPSHOTS, product);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const css = new Map();
  const done = {};
  for (const title of titles) {
    const ids = byTitle[title];
    if (!ids) continue;
    const id =
      ids.find((i) => i.endsWith('--preview')) ||
      ids.find((i) => i.endsWith('--default')) ||
      ids[0];
    try {
      await page.goto(
        `http://localhost:${port}/iframe.html?id=${id}&viewMode=story`,
        { waitUntil: 'networkidle', timeout: 30000 },
      );
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => {
        const rules = [];
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) rules.push(rule.cssText);
          } catch {}
        }
        const pick = (el) =>
          [...el.attributes]
            .filter((a) => a.name.startsWith('data-') || a.name === 'lang')
            .map((a) => [a.name, a.value]);
        return {
          html: document.querySelector('#storybook-root')?.innerHTML ?? '',
          rules,
          htmlAttrs: pick(document.documentElement),
          bodyAttrs: pick(document.body),
        };
      });
      for (const rule of r.rules) {
        // Storybooks egne grensesnittstiler trengs ikke.
        if (!/\.sb-|#storybook-|\.docs-story|nunito/i.test(rule))
          css.set(rule, true);
      }
      const name = title.split('/').slice(1).join('-');
      const file = `${name.toLowerCase()}.html`;
      const doc = `<!doctype html>
<html${attrs(r.htmlAttrs.some(([k]) => k === 'lang') ? r.htmlAttrs : [['lang', 'nb'], ...r.htmlAttrs])}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<link rel="stylesheet" href="../fonts.css">
<link rel="stylesheet" href="../${product}.css">
<style>html,body{margin:0;background:#fff}body{padding:24px;font-family:'Inter',sans-serif;font-feature-settings:'cv05' 1}</style>
</head>
<body${attrs(r.bodyAttrs)}>
<div id="story">${r.html}</div>
</body>
</html>
`;
      fs.writeFileSync(path.join(outDir, file), doc);
      done[title] = { id, file };
    } catch (err) {
      console.warn(`Fikk ikke hentet ${title}: ${err.message}`);
    }
  }
  fs.writeFileSync(
    path.join(SNAPSHOTS, `${product}.css`),
    `${[...css.keys()].join('\n')}\n`,
  );
  await browser.close();
  server.close();
  return done;
};

/** Plasserer komponenter i grupper fra groups.json, med nye komponenter til slutt. */
const grouped = (config, names) => {
  const known = new Set(config.flatMap((g) => g.items));
  const out = config
    .map((g) => ({
      title: g.title,
      items: g.items.filter((n) => names.includes(n)),
    }))
    .filter((g) => g.items.length);
  const fresh = names.filter((n) => !known.has(n));
  if (fresh.length) out.push({ title: NEW_GROUP, items: fresh });
  return { out, fresh };
};

/* ---------- Innboks: altinn-components ---------- */

const syncInnboks = async () => {
  const root = path.join(env.AC_REPO, 'lib/components');
  const comps = subdirs(root);
  const items = [];
  for (const c of comps) {
    const files = walk(path.join(root, c));
    const stories = {};
    for (const f of files.filter((f) => /\.stories\.tsx?$/.test(f))) {
      const s = fs.readFileSync(f, 'utf8');
      stories[path.basename(f).replace(/\.stories\.tsx?$/, '')] = {
        title: s.match(/^\s*title:\s*['"]([^'"]+)['"]/m)?.[1],
        exports: [...s.matchAll(/^export const (\w+)/gm)].map((m) => m[1]),
      };
    }
    const main = stories[c] || Object.values(stories)[0];
    const pngs = files
      .filter(
        (f) =>
          f.includes(`${path.sep}__screenshots__${path.sep}`) &&
          f.endsWith('.png'),
      )
      .map((f) => ({
        file: f,
        story: path.basename(path.dirname(f)),
        name: path.basename(f, '.png'),
      }))
      .sort((a, b) => a.file.localeCompare(b.file));
    const own = pngs.filter((p) => p.story === c);
    const pool = own.length ? own : pngs;
    const shot = pool.find((p) => p.name === 'Default') || pool[0];
    const title = main?.title;
    const shotTitle = shot && stories[shot.story]?.title;
    const sb = shotTitle
      ? `https://altinn.github.io/altinn-components/?path=/story/${storyId(shotTitle)}--${kebab(shot.name)}`
      : title && main.exports[0]
        ? `https://altinn.github.io/altinn-components/?path=/story/${storyId(title)}--${kebab(main.exports[0])}`
        : '';
    items.push({
      n: c,
      cat: title ? title.split('/')[0] : null,
      sb,
      shot,
      total: pngs.length,
    });
  }

  const keep = new Set();
  for (const it of items.filter((i) => i.shot)) {
    const img = sharp(it.shot.file).trim({ threshold: 10 }).extend({
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
      background: '#ffffff',
    });
    const buf = await img.png().toBuffer();
    const { width } = await sharp(buf).metadata();
    const out = await sharp(buf)
      .resize({ width: Math.min(1200, width) })
      .webp({ quality: 82 })
      .toBuffer();
    const fn = fileName(it.n);
    writeImage('innboks', fn, out);
    keep.add(fn);
  }
  removeStaleImages('innboks', keep);

  const cats = groups.innboksCategories;
  const groupOf = (it) =>
    it.cat === null
      ? 'Interne byggeklosser'
      : cats.find((g) => g.categories.includes(it.cat))?.title || NEW_GROUP;
  const order = [
    ...cats.map((g) => g.title),
    NEW_GROUP,
    'Interne byggeklosser',
  ];
  const catOrder = cats.flatMap((g) => g.categories);
  let body = '';
  for (const title of order) {
    const list = items
      .filter((it) => groupOf(it) === title)
      .sort(
        (a, b) =>
          catOrder.indexOf(a.cat) - catOrder.indexOf(b.cat) ||
          a.n.localeCompare(b.n),
      );
    if (!list.length) continue;
    body += `\n### ${title}\n`;
    if (title === 'Interne byggeklosser') {
      body += `\nHjelpekomponenter uten egen story i Storybook. De brukes inne i andre komponenter og velges sjelden direkte.\n\n${list
        .map(
          (it) =>
            `[${it.n}](https://github.com/Altinn/altinn-components/tree/main/lib/components/${it.n})`,
        )
        .join(', ')}\n`;
      continue;
    }
    for (const it of list) {
      body += `\n#### ${it.n}\n\n`;
      if (it.shot)
        body += `![Skjermbilde av ${it.n}, varianten ${it.shot.name}](/images/altinn/innboks/${fileName(it.n)})\n\n`;
      const links = [];
      if (it.sb) links.push(`[Storybook](${it.sb})`);
      links.push(
        `[Kode](https://github.com/Altinn/altinn-components/tree/main/lib/components/${it.n})`,
      );
      body += `${links.join(' · ')}\n`;
    }
  }
  const fresh = items
    .filter((it) => groupOf(it) === NEW_GROUP)
    .map((it) => it.n);
  report(
    'Innboks (altinn-components)',
    replaceSection('innboks.mdx', body),
    fresh.length
      ? [`- Må plasseres i en gruppe i groups.json: ${fresh.join(', ')}`]
      : [],
  );
};

/* ---------- Altinn Studio: designer-components ---------- */

const syncStudio = async () => {
  const index = JSON.parse(
    fs.readFileSync(path.join(env.SB_STUDIO, 'index.json'), 'utf8'),
  ).entries;
  const titles = [
    ...new Set(
      Object.values(index)
        .filter((e) => e.type === 'story' && e.title.startsWith('Components/'))
        .map((e) => e.title),
    ),
  ];
  const snaps = await snapshotStorybook(env.SB_STUDIO, titles, 'studio');
  removeStaleImages('studio', new Set());
  const names = titles.map((t) => t.replace('Components/', ''));
  const { out, fresh } = grouped(groups.studio, names);
  let body = '';
  for (const g of out) {
    body += `\n### ${g.title}\n`;
    for (const n of g.items) {
      const s = snaps[`Components/${n}`];
      const sb = `https://components.altinn.studio/?path=/story/${s ? s.id : `components-${storyId(n)}--preview`}`;
      body += `\n#### ${n}\n\n`;
      body += s
        ? `<StorySnapshot title="${n}" src="/altinn-snapshots/studio/${s.file}" storybook="${sb}" />\n`
        : `[Storybook](${sb})\n`;
    }
  }
  report(
    'Altinn Studio (designer-components)',
    replaceSection('studio.mdx', body),
    fresh.length
      ? [`- Må plasseres i en gruppe i groups.json: ${fresh.join(', ')}`]
      : [],
  );
};

/* ---------- Skjemaer og tjenester: app-frontend og form-component ---------- */

const syncSkjema = async () => {
  const layoutDir = path.join(env.AS_REPO, 'src/App/frontend/src/layout');
  const names = subdirs(layoutDir).filter((n) => /^[A-Z]/.test(n));
  const alias = groups.skjemaAlias;
  const titles = names.map((n) => `LayoutComponents/${alias[n] || n}`);
  const snaps = await snapshotStorybook(env.SB_FORM, titles, 'skjema');
  removeStaleImages('skjema', new Set());
  // Storybooken for skjemakomponentene er ikke publisert. Sett SB_FORM_URL når den er det.
  const sbBase = env.SB_FORM_URL;
  const code = (n) =>
    `https://github.com/Altinn/altinn-studio/tree/main/src/App/frontend/src/layout/${n}`;
  const { out, fresh } = grouped(groups.skjema, names);
  let body = '';
  let withSnap = 0;
  for (const g of out) {
    body += `\n### ${g.title}\n`;
    const without = [];
    for (const n of g.items) {
      const s = snaps[`LayoutComponents/${alias[n] || n}`];
      if (s) {
        withSnap++;
        const sb = sbBase ? ` storybook="${sbBase}?path=/story/${s.id}"` : '';
        body += `\n#### ${n}\n\n<StorySnapshot title="${n}" src="/altinn-snapshots/skjema/${s.file}"${sb} />\n\n[Kode](${code(n)})\n`;
      } else {
        without.push(`[${n}](${code(n)})`);
      }
    }
    if (without.length) body += `\n**Uten eksempel:** ${without.join(', ')}\n`;
  }
  report(
    'Skjemaer og tjenester (app-frontend)',
    replaceSection('skjemaer-og-tjenester.mdx', body),
    [
      `- ${withSnap} av ${names.length} komponenter har eksempel.`,
      ...(fresh.length
        ? [`- Må plasseres i en gruppe i groups.json: ${fresh.join(', ')}`]
        : []),
    ],
  );
};

/* ---------- kjør ---------- */

if (only.includes('innboks')) await syncInnboks();
if (only.includes('studio') || only.includes('skjema')) writeSnapshotFonts();
if (only.includes('studio')) await syncStudio();
if (only.includes('skjema')) await syncSkjema();

const text = `## Synkronisering av Altinn-komponenter\n\n${summary.join('\n\n')}\n`;
console.log(text);
if (env.SUMMARY_FILE) fs.writeFileSync(env.SUMMARY_FILE, text);
