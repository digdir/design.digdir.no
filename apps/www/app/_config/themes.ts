/**
 * Maps each Designsystemet theme (see `_config/profiles`) to the built CSS
 * asset shipped in `designsystemet/css/<theme>.css`. The URLs are resolved by
 * Vite (`?url`) so they get content-hashed and served as static assets, which
 * lets us load exactly one theme at a time via a `<link>` instead of bundling
 * every theme's `:root` variables into the same document.
 */
import altinnTheme from '../../../../designsystemet/css/altinn.css?url';
import digdirTheme from '../../../../designsystemet/css/digdir.css?url';
import kiNorgeTheme from '../../../../designsystemet/css/ki-norge.css?url';
import norgePrivateTheme from '../../../../designsystemet/css/norge-private.css?url';
import portalTheme from '../../../../designsystemet/css/portal.css?url';
import uutilsynetTheme from '../../../../designsystemet/css/uutilsynet.css?url';
import tokensConfig from '../../../../designsystemet/designsystemet.config.json';
import kiNorgeConfig from '../../../../designsystemet/designsystemet.config.ki-norge.json';

/** Theme used when a profile maps to a theme without a built stylesheet. */
export const DEFAULT_THEME = 'digdir';

const themeStylesheets: Record<string, string> = {
  altinn: altinnTheme,
  digdir: digdirTheme,
  'ki-norge': kiNorgeTheme,
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
 * The main colours (`data-color` values) a theme defines in its config in
 * `designsystemet/`, e.g. `['accent', 'brand1', …, 'neutral']`.
 * Severity colours (info, success, warning, danger) are left out.
 */
export const getThemeColors = (theme?: string): string[] => {
  // KI Norge has its own config: all themes in one config must share colour names.
  const themes: TokensConfig['themes'] = {
    ...tokensConfig.themes,
    ...kiNorgeConfig.themes,
  };
  return Object.keys((themes[theme ?? ''] ?? themes[DEFAULT_THEME]).colors);
};
