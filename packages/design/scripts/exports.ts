import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
export const profilesDir = path.join(packageRoot, 'profiles');

/** Folder with components included in every profile. */
export const SHARED_PROFILE = '_shared';
/** Listed first, and the theme used by profiles without one of their own. */
export const MAIN_PROFILE = 'digdir';
/**
 * Profiles consumers can import everything from. Every profile in `profiles/`
 * is built, but the others only export their theme from `package.json` – add
 * a profile here to publish the rest of it.
 */
export const PUBLISHED_PROFILES = ['digdir'];

/** Profile folders, the main profile first. */
export const listProfiles = () =>
  fs
    .readdirSync(profilesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== SHARED_PROFILE)
    .map((entry) => entry.name)
    .sort(
      (a, b) =>
        Number(b === MAIN_PROFILE) - Number(a === MAIN_PROFILE) ||
        a.localeCompare(b),
    );

const code = (file: string) => ({
  types: `./dist/${file}.d.ts`,
  default: `./dist/${file}.js`,
});

const themeExports = (profile: string) => ({
  [`./${profile}/theme`]: `./dist/${profile}/theme/index.css`,
  [`./${profile}/theme/*.css`]: `./dist/${profile}/theme/*.css`,
});

const profileExports = (profile: string) => ({
  [`./${profile}/react`]: code(`${profile}/index.react`),
  [`./${profile}/web`]: code(`${profile}/index.web`),
  [`./${profile}/css`]: `./dist/${profile}/css/index.css`,
  [`./${profile}/css/*.css`]: `./dist/${profile}/css/*.css`,
  ...themeExports(profile),
  [`./${profile}/illustrations/react`]: code(
    `illustrations/${profile}/react/index`,
  ),
  [`./${profile}/illustrations/svg`]: code(`illustrations/${profile}/svg`),
  [`./${profile}/illustrations/meta`]: code(`illustrations/${profile}/meta`),
  [`./${profile}/illustrations/images`]: code(
    `illustrations/${profile}/images`,
  ),
  [`./${profile}/illustrations/css`]: `./dist/illustrations/${profile}.css`,
});

/** Not tied to one profile: shared types and helpers, and every palette. */
const sharedExports = {
  './illustrations': code('illustrations/index'),
  './illustrations.css': './dist/illustrations/index.css',
};

export const buildExports = (): Record<string, unknown> => {
  const profiles = listProfiles();
  const unknown = PUBLISHED_PROFILES.filter(
    (profile) => !profiles.includes(profile),
  );
  if (unknown.length > 0) {
    throw new Error(
      `PUBLISHED_PROFILES lists ${unknown.join(', ')}, but there is no such folder in profiles/.`,
    );
  }
  return Object.assign(
    {},
    ...profiles.map((profile) =>
      PUBLISHED_PROFILES.includes(profile)
        ? profileExports(profile)
        : themeExports(profile),
    ),
    sharedExports,
  );
};
