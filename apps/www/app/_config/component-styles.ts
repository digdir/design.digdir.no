/**
 * Component styles per profile, from
 * `@digdir/digdir-design/<profile>/css/components.css`.
 *
 * Each profile ships its own stylesheet, so the URL is resolved by Vite
 * (`?url`) and loaded with a `<link>` on that profile's pages – the same way
 * as the themes in `_config/themes`. That way a profile's docs show the
 * components as that profile ships them, and nothing from the other profiles.
 *
 * `components.css` holds only the profile's own components. Consumers import
 * `@digdir/digdir-design/<profile>/css`, which also has Designsystemet's CSS;
 * the site loads that once in `root.tsx` instead, so it stays in place when
 * the profile changes.
 */
import digdir from '@digdir/digdir-design/digdir/css/components.css?url';

/**
 * Keyed by profile slug (see `_config/profiles`). Only profiles the package
 * exports are listed – the others have no components of their own yet.
 */
const componentStylesheets: Record<string, string> = {
  digdir,
};

/** A profile's component stylesheet URL, if it has one. */
export const getComponentStylesheet = (profile?: string): string | undefined =>
  componentStylesheets[profile ?? ''];
