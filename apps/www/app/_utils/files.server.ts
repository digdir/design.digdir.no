import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

const dirname = cwd();
const CONTENT_BASE_PATH = join(dirname, './app/content');

/**
 * Folder under `app/content/` with pages shown in *every* profile, e.g.
 * component docs. A profile can override a shared page by adding a file with
 * the same relative path to its own folder.
 */
export const SHARED_CONTENT_DIR = '_shared';

export const safeReadDir = (path: string): string[] => {
  try {
    return readdirSync(path);
  } catch (_error) {
    console.warn(`Could not read directory: ${path}`);
    return [];
  }
};

const safeReadFile = (path: string): string => {
  try {
    return readFileSync(path, 'utf-8');
  } catch (_error) {
    console.error(`Error reading file: ${path}`);
    return '';
  }
};

/**
 * Recursively collect every `.mdx` file under `app/content/<path>`.
 * Returns absolute paths together with the path relative to `<path>`.
 */
export const getFilesFromContentDir = (
  path: string,
  currentRelativePath = '',
): Array<{ path: string; relativePath: string }> => {
  const currentPath = join(CONTENT_BASE_PATH, path, currentRelativePath);

  try {
    const entries = safeReadDir(currentPath);
    let results: Array<{ path: string; relativePath: string }> = [];

    for (const entry of entries) {
      const entryPath = join(currentPath, entry);
      const entryRelativePath = currentRelativePath
        ? join(currentRelativePath, entry)
        : entry;

      try {
        const stats = statSync(entryPath);
        if (stats.isDirectory()) {
          results = results.concat(
            getFilesFromContentDir(path, entryRelativePath),
          );
        } else if (entry.endsWith('.mdx')) {
          results.push({
            path: entryPath,
            relativePath: entryRelativePath,
          });
        }
      } catch (_error) {
        console.warn(`Could not stat entry: ${entryPath}`);
      }
    }

    return results;
  } catch (_error) {
    console.warn(`Could not read content directory: ${currentPath}`);
    return [];
  }
};

/**
 * Read a single file from the content directory, e.g.
 * `getFileFromContentDir(join("digdir", "getting-started.mdx"))`.
 */
export const getFileFromContentDir = (path: string): string => {
  try {
    return safeReadFile(join(CONTENT_BASE_PATH, path));
  } catch (_error) {
    console.error(`Error reading file from content directory: ${path}`);
    return '';
  }
};

/** List the immediate sub-directories of `app/content/<path>`. */
export const getFoldersInContentDir = (path = ''): string[] => {
  try {
    const entries = safeReadDir(join(CONTENT_BASE_PATH, path));
    return entries.filter((entry) =>
      statSync(join(CONTENT_BASE_PATH, path, entry)).isDirectory(),
    );
  } catch (_error) {
    console.error(`Error reading folders from content directory: ${path}`);
    return [];
  }
};

/**
 * Every `.mdx` page for a profile: its own files plus the shared ones it does
 * not override. `dir` is the content folder the file should be read from.
 */
export const getProfileContentFiles = (
  profile: string,
): Array<{ dir: string; relativePath: string }> => {
  const own = getFilesFromContentDir(profile).map((file) => ({
    dir: profile,
    relativePath: file.relativePath,
  }));
  const ownPaths = new Set(own.map((file) => file.relativePath));
  const shared = getFilesFromContentDir(SHARED_CONTENT_DIR)
    .filter((file) => !ownPaths.has(file.relativePath))
    .map((file) => ({
      dir: SHARED_CONTENT_DIR,
      relativePath: file.relativePath,
    }));
  return [...own, ...shared];
};

/**
 * Read a profile's page, falling back to the shared page with the same path.
 * Returns an empty string when neither exists.
 */
export const getProfilePage = (profile: string, relativePath: string) => {
  for (const dir of [profile, SHARED_CONTENT_DIR]) {
    const path = join(dir, relativePath);
    if (existsSync(join(CONTENT_BASE_PATH, path))) {
      return getFileFromContentDir(path);
    }
  }
  return '';
};
