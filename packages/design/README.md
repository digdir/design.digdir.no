# `@digdir/digdir-design`

Components, themes and illustrations for Digdir's visual profiles. Built on
[Designsystemet](https://designsystemet.no).

## Install

```bash
npm install @digdir/digdir-design
```

Designsystemet is included, so there is nothing else to install.

## Use

Everything is imported per profile: `@digdir/digdir-design/<profile>/<scope>`.

```ts
import '@digdir/digdir-design/digdir/theme';
import '@digdir/digdir-design/digdir/css';
```

```tsx
import { Button, Search } from '@digdir/digdir-design/digdir/react';
import { PersonMedJojo } from '@digdir/digdir-design/digdir/illustrations/react';
```

Without React:

```ts
import '@digdir/digdir-design/digdir/web';
```

| Scope                  | Contents                                            |
| ---------------------- | --------------------------------------------------- |
| `theme`                | The profile's Designsystemet theme                  |
| `css`                  | Designsystemet's CSS and the profile's components   |
| `react`                | Designsystemet's React components and the profile's |
| `web`                  | Designsystemet's web components and the profile's   |
| `illustrations/react`  | Illustrations as React components                   |
| `illustrations/svg`    | Illustrations as SVG strings                        |
| `illustrations/meta`   | Titles, tags and colours                            |
| `illustrations/images` | URLs of raster illustrations                        |
| `illustrations/css`    | Colours for dark mode                               |

Only `digdir` has every scope for now. `altinn`, `dodsfall-og-arv`, `ki-norge`,
`norge-no` and `uutilsynet` export `theme`.

The theme does not load the font. See
[Designsystemet's setup](https://designsystemet.no/en/fundamentals/code/setup).

## Documentation

- Components from Designsystemet: [designsystemet.no](https://designsystemet.no/en/components)
- Our own components and the profiles: [design.digdir.no](https://design.digdir.no)

## AI assistants

The package ships a skill in `skills/digdir-design/SKILL.md`. Copy the folder
to where your assistant reads skills, for example `.claude/skills/`.

## Development

```bash
pnpm build
pnpm typecheck
```

- **Components** live in `profiles/<profile>/<component>/` and are exported
  from the profile's `index.react.ts` and `index.web.ts`. CSS files in the
  folder become part of the profile's `css`.
- **Illustrations** live in `illustrations/<profile>/<name>/`, with one image
  and a `meta.json`. Layer names for colours are described in
  [the guide for designers](https://design.digdir.no/digdir/illustrasjoner/for-designeren).
- **Themes** are built with `pnpm tokens` in the repository root. A profile
  with more than one lists them in `profiles/<profile>/themes.json`.
- **Exports** in `package.json` are written by `pnpm run exports`. To publish
  more than the theme of a profile, add it to `PUBLISHED_PROFILES` in
  `scripts/exports.ts` first.
- **Designsystemet** is pinned: `@digdir/designsystemet-react`, `-web` and
  `-css` must have the same version.
