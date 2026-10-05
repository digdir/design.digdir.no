/**
 * Maps each Designsystemet theme (see `_config/profiles`) to the built CSS
 * asset shipped in `design-tokens-build/<theme>.css`. The URLs are resolved by
 * Vite (`?url`) so they get content-hashed and served as static assets, which
 * lets us load exactly one theme at a time via a `<link>` instead of bundling
 * every theme's `:root` variables into the same document.
 */
import altinnTheme from '../../../../design-tokens-build/altinn.css?url';
import digdirTheme from '../../../../design-tokens-build/digdir.css?url';
import norgePrivateTheme from '../../../../design-tokens-build/norge-private.css?url';
import portalTheme from '../../../../design-tokens-build/portal.css?url';
import uutilsynetTheme from '../../../../design-tokens-build/uutilsynet.css?url';
import tokensConfig from '../../../../designsystemet.config.json';

/** Theme used when a profile maps to a theme without a built stylesheet. */
export const DEFAULT_THEME = 'digdir';

const themeStylesheets: Record<string, string> = {
  altinn: altinnTheme,
  digdir: digdirTheme,
  norge: norgePrivateTheme,
  portal: portalTheme,
  uutilsynet: uutilsynetTheme,
};

/** Resolve a theme name to its stylesheet URL, falling back to the default. */
export const getThemeStylesheet = (theme?: string): string =>
  themeStylesheets[theme ?? ''] ?? themeStylesheets[DEFAULT_THEME];

type TokensConfig = {
  themes: Record<string, { colors: Record<string, string> }>;
};

/**
 * The main colours (`data-color` values) a theme defines in
 * `designsystemet.config.json`, e.g. `['accent', 'brand1', …, 'neutral']`.
 * Severity colours (info, success, warning, danger) are left out.
 */
export const getThemeColors = (theme?: string): string[] => {
  const { themes } = tokensConfig as TokensConfig;
  return Object.keys((themes[theme ?? ''] ?? themes[DEFAULT_THEME]).colors);
};
