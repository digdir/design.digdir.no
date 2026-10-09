/**
 * Copies the framework-agnostic component CSS from `components/<name>/` to
 * `dist/components/<name>.css`, and writes a `dist/components/index.css` that
 * imports every component.
 *
 * Run with `node scripts/build-components.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const sourceDir = path.join(packageRoot, 'components');
const distDir = path.join(packageRoot, 'dist', 'components');

const components = fs
  .readdirSync(sourceDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

fs.mkdirSync(distDir, { recursive: true });

for (const name of components) {
  fs.copyFileSync(
    path.join(sourceDir, name, `${name}.css`),
    path.join(distDir, `${name}.css`),
  );
}

fs.writeFileSync(
  path.join(distDir, 'index.css'),
  `${components.map((name) => `@import './${name}.css';`).join('\n')}\n`,
);

console.log(`Built ${components.length} component stylesheet(s).`);
