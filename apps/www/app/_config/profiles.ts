/**
 * Identities are the top-level sections of the site (shown as cards on the
 * landing page). Each identity owns a folder under `app/content/<slug>/`
 * containing its `.mdx` docs pages, and maps to a Designsystemet theme built
 * into `design-tokens-build/<theme>.css`.
 *
 * This module is safe to import on both the client and the server – it must not
 * pull in any Node-only APIs.
 */
/** How an identity's card on the landing page looks. */
export type ProfileCard = {
  /** Card background colour. */
  color: string;
  /** CSS `font-family` for the card heading. Defaults to the site font (Inter). */
  headingFont?: string;
  /** CSS `font-family` for the card text. Defaults to the site font (Inter). */
  textFont?: string;
};

export type Profile = {
  /** Folder name under `app/content/` and the `:profile` route param. */
  slug: string;
  /** Display name shown in the chooser and sidebar. */
  name: string;
  /** Short blurb for the identity card. */
  description: string;
  /** Brand colour, shown as a dot next to the name in the profile switcher. */
  color: string;
  /** The identity's card on the landing page. */
  card: ProfileCard;
  /**
   * The theme's *main* colour, given as a Designsystemet `data-color` value.
   * Setting `data-color={mainColor}` on a subtree lets it use the unnamed
   * `--ds-color-*` variables instead of hard-coding a colour name like
   * `--ds-color-brand1-*`, so each profile can name its main colour whatever it
   * likes. `neutral` is the only colour every theme is guaranteed to have.
   */
  mainColor: string;
  /**
   * Designsystemet theme this identity maps to. A matching
   * `design-tokens-build/<theme>.css` should exist (run `pnpm tokens`).
   */
  theme: string;
};

export const profiles: Profile[] = [
  {
    slug: 'digdir',
    name: 'Digdir',
    description:
      'Profilbibliotek og dokumentasjon for Digitaliseringsdirektoratet sine tjenester.',
    color: '#C2132C',
    card: { color: '#fde2e3' },
    mainColor: 'brand1',
    theme: 'digdir',
  },
  {
    slug: 'uutilsynet',
    name: 'uutilsynet',
    description: 'Profil og komponenter for uutilsynet.',
    color: '#5B60D1',
    card: { color: '#e7e7f8' },
    mainColor: 'brand1',
    theme: 'uutilsynet',
  },
  {
    slug: 'ki-norge',
    name: 'KI Norge',
    description:
      'Visuell identitet for KI Norge – forumet for kunstig intelligens i offentlig sektor.',
    color: '#B42946',
    card: {
      color: '#f1e5ed',
      headingFont: "'PT Serif', ui-serif, Georgia, serif",
      textFont: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
    },
    mainColor: 'brand1',
    theme: 'ki-norge',
  },
  {
    slug: 'dodsfall-og-arv',
    name: 'Dødsfall og arv',
    description: 'Profil og komponenter for Dødsfall og arv.',
    color: '#123456',
    card: { color: '#f0f0f0' },
    mainColor: 'brand1',
    theme: 'dodsfall-og-arv',
  },
  {
    slug: 'altinn',
    name: 'Altinn',
    description: 'Profil og komponenter for Altinn.',
    color: '#0062BA',
    card: { color: '#fff4e6' },
    mainColor: 'brand1',
    theme: 'altinn',
  },
  {
    slug: 'norge-no',
    name: 'Norge.no',
    description: 'Profil og komponenter for Norge.no.',
    color: '#123123',
    card: { color: '#f9f9f9' },
    mainColor: 'brand1',
    theme: 'norge-no-private',
  },
];

export const profileSlugs = profiles.map((profile) => profile.slug);

export const getProfile = (slug?: string): Profile | undefined =>
  profiles.find((profile) => profile.slug === slug);
