# `@digdir/digdir-design`

Components, styles and illustrations for Digdir's visual profiles, built on
[Designsystemet](https://designsystemet.no).

Every profile (`digdir`, `altinn`, `uutilsynet`, …) has its own entry points,
so a service only gets what its profile uses. For now only `digdir` exports
every scope; the other profiles export their `theme`:

```
@digdir/digdir-design/<profile>/<scope>
```

| Scope           | What                                                             |
| --------------- | ---------------------------------------------------------------- |
| `theme`         | The profile's Designsystemet theme (design tokens)               |
| `css`           | Designsystemet's CSS + the profile's own components              |
| `react`         | Designsystemet's React components + the profile's own            |
| `web`           | Designsystemet's web components + the profile's own              |
| `illustrations` | The profile's illustrations, see [Illustrations](#illustrations) |

`digdir` is the main profile. Designsystemet comes with the package – there is
nothing else to install.

## Components

```bash
npm install @digdir/digdir-design
```

```ts
import '@digdir/digdir-design/digdir/theme';
import '@digdir/digdir-design/digdir/css';
```

`theme` is the profile's design tokens and `css` is Designsystemet's CSS
followed by the profile's own components. The theme does not load the font –
see [Designsystemet's setup](https://designsystemet.no/en/fundamentals/code/setup).

| Import                          | What                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| `<profile>/theme`               | The profile's default theme                                                |
| `<profile>/theme/<theme>.css`   | One of its themes, e.g. `norge-no/theme/norge-business.css`                |
| `<profile>/css`                 | Designsystemet's CSS + the profile's components                            |
| `<profile>/css/components.css`  | Only the profile's components, when you load Designsystemet's CSS yourself |
| `<profile>/css/<component>.css` | One component, e.g. `digdir/css/search.css`                                |

React:

```tsx
import { Button, Search } from '@digdir/digdir-design/digdir/react';
```

Without a framework:

```ts
import '@digdir/digdir-design/digdir/web';
```

The components from Designsystemet are documented at
[designsystemet.no](https://designsystemet.no/en/components). A profile's own
components are documented at [design.digdir.no](https://design.digdir.no). An
own component with the same name as one from Designsystemet replaces it – the
digdir profile's `Search` replaces Designsystemet's deprecated one.

### Adding a component

Components live in `profiles/<profile>/<component>/`, and each profile has one
index file per scope that lists what it exports:

```
profiles/
  digdir/
    index.react.ts         @digdir/digdir-design/digdir/react
    index.web.ts           @digdir/digdir-design/digdir/web
    search/
      search.tsx
      search.css           part of @digdir/digdir-design/digdir/css
```

1. Create `profiles/<profile>/<component>/` with the component's files.
2. Export React components from the profile's `index.react.ts`, and web
   components from `index.web.ts`.
3. Any `.css` file in the folder is added to the profile's stylesheet. Put the
   rules in a layer ordered after Designsystemet's. The digdir profile uses
   `@layer dd.components`, the class prefix `dd-` and `--ddc-` for custom
   properties.

A component every profile should get goes in `profiles/_shared/<component>/`.
Its styles are included in every profile's stylesheet, and a profile overrides
one by adding a file with the same name.

### Themes

Themes are built at the repository root (`pnpm tokens`) into
`design-tokens-build/`, and copied into the package by the build. A profile
ships the theme with its own name. To ship others, list them in
`profiles/<profile>/themes.json` with the default first:

```json
["norge-private", "norge-business"]
```

A profile without a theme of its own gets the main profile's.

### Designsystemet's version

`@digdir/designsystemet-react`, `-web` and `-css` are pinned to the same exact
version, because the CSS is copied into each profile's `css` at build time.
Bump all three together – the build fails if they differ.

### Adding and publishing a profile

Create `profiles/<profile>/` with an `index.react.ts` and an `index.web.ts`
(copy another profile's). Every profile is built, and its theme is exported.
To export the rest of it, add the profile to `PUBLISHED_PROFILES` in
`scripts/exports.ts`.

Run `pnpm run exports` afterwards to write `exports` in `package.json`. The
build fails with a message if an index file is missing or the exports are out
of date.

## Illustrations

Every profile has its own set of illustrations, published as React components,
as framework-agnostic SVG strings and with metadata (title, description, tags)
for building galleries, under `@digdir/digdir-design/<profile>/illustrations/`.
Shared types and helpers are in `@digdir/digdir-design/illustrations`.

React components, one profile at a time:

```tsx
import { TelefonMedVarsel } from '@digdir/digdir-design/digdir/illustrations/react';

<TelefonMedVarsel aria-hidden />;
```

Illustrations are decorative by default – add `aria-hidden` when they carry no
information, or pass `title="…"` when they do.

Framework-agnostic SVG strings:

```ts
import { telefonMedVarsel } from '@digdir/digdir-design/digdir/illustrations/svg';

element.innerHTML = telefonMedVarsel;
```

Metadata (for galleries, search and filtering):

```ts
import {
  colors,
  illustrations,
} from '@digdir/digdir-design/digdir/illustrations/meta';
import type { IllustrationMeta } from '@digdir/digdir-design/illustrations';
```

### Dark mode

Colours in the SVGs are written as
`var(--design-illustration-<profile>-<colour>, <light hex>)`, so they render
correctly in light mode without any CSS. To follow `data-color-scheme="dark"`
(as set by Designsystemet), load the stylesheet for the profile – or one for
all profiles:

```ts
import '@digdir/digdir-design/digdir/illustrations/css';
// or
import '@digdir/digdir-design/illustrations.css';
```

### Adding an illustration

Illustrations live in `illustrations/<profile>/<name>/`:

```
illustrations/
  digdir/
    colors.json                  palette for this profile (light + dark)
    telefon-med-varsel/
      telefon-med-varsel.svg     exactly one .svg file (any file name)
      meta.json                  title, description and tags
```

1. Create a kebab-case folder – the name becomes the component name
   (`telefon-med-varsel` → `TelefonMedVarsel`) and the download file name.
2. Drop the SVG in the folder. Use colours from `colors.json` so they get
   themed; the build warns about colours it does not recognise.
3. Add `meta.json`:

   ```json
   {
     "$schema": "../../meta.schema.json",
     "title": "Telefon med varsel",
     "description": "Når og hvor illustrasjonen passer.",
     "tags": ["teknologi", "telefon"]
   }
   ```

4. Run `pnpm build`.

### Raster illustrations (PNG, WebP, JPEG)

A folder may hold a `.png`, `.webp` or `.jpg` instead of an `.svg`, with the
same `meta.json`. Raster files are copied as-is (no colour theming, dark mode
or slots) and exposed as URLs rather than inlined as base64, so they stay
cacheable and out of your JavaScript bundle:

```tsx
// Once the uutilsynet profile is published:
import { mangeMennesker } from '@digdir/digdir-design/uutilsynet/illustrations/images';

<img src={mangeMennesker} alt='' />;
```

The module imports each file (`import url from './file.png'`), which Vite,
webpack and Parcel turn into an emitted asset and its URL – on the server as
well as in the browser. It needs a bundler; plain Node cannot import `.png`.

To add a new profile, create `illustrations/<profile>/` with at least one
illustration folder (and a `colors.json` if it should support dark mode or
colour slots). The build picks it up and adds it to
`illustrationProfiles` and `illustrationLoaders` in `@digdir/digdir-design/illustrations`.

### Recolourable parts (colour slots)

Some illustrations have a part that may be shown in more than one brand
colour. Designers mark this in Illustrator by adding the allowed palette
colours in square brackets to the **layer name**:

```
Former [red,yellow,blue]   may be shown in any of the three
Former [red,yellow]          only these two
Former                          fixed – no brackets, never recoloured
```

The build reads the marker from the exported `data-name` attribute, which
Illustrator only writes with _File → Export → Export As → SVG_ and
_Object IDs: Layer Names_ (the `id` has the brackets flattened and is ignored).
Rules:

- Colour names are the keys in `colors.json`. Unknown names fail the build.
- The colour the part is drawn in is the default. If it is missing from the
  list the build adds it and warns.
- Layers with the same name share one slot and must list the same colours.
  A marker on a group applies to every shape in it drawn in the slot's colour.
- The slot name comes from the text before the brackets: `Former` becomes the
  React prop `former` and the CSS variable
  `--design-illustration-<profile>-<illustration>-former`.

Using a slot:

```tsx
<PersonerSomHolderFigurer former='brand1' aria-hidden />;
```

```css
/* SVG strings: set the slot variable to a palette variable */
.hero svg {
  --design-illustration-digdir-personer-som-holder-figurer-former: var(
    --design-illustration-digdir-brand3
  );
}
```

`meta.ts` lists every slot (`slots[]`) with its variable, default and allowed
colours, which is what the documentation site uses for its colour dropdowns.

### Slot groups (`{Group}`)

Parts that should change colour together, but not to the same colour, share
a group. Add `{Group}` after the colour list:

```
Flammer [yellow-40,red-40,blue-40] {Farger}
Rakettsekk og koffert [red,yellow,blue] {Farger}
```

The group gets one prop, set to a colour **family** – the colour name without
its `-NN` step. Each slot takes its own colour in that family, so
`farger="red"` makes the flames `red-40` and the backpack `red`. The order of
the lists does not matter. Rules:

- Every slot in a group must cover the same families, with one colour per
  family, and be drawn in the same family. Anything else fails the build.
- Grouped slots have no prop of their own; the group name becomes the prop
  (`Farger` → `farger`) and must not clash with an ungrouped slot.
- Slots without `{…}` work as before.

```tsx
<PersonMedRakettsekk farger='red' aria-hidden />;
```

`meta.ts` lists groups in `groups[]`, and each grouped slot names its group in
`slot.group`. `slotColorInFamily(slot, family)` gives a slot's colour for a
family, for setting the slot variables yourself.

### Fixed parts (`[no-edit]`)

Some illustrations, such as `forerkort`, must look the same in light and dark
mode. Add `[no-edit]` to the layer name in Illustrator to keep its drawn
colours:

```
Førerkort [no-edit]
```

Palette colours inside the layer are not swapped for CSS variables, and other
colours in it are not reported as missing from `colors.json`. On a group it
applies to everything in the group, including any slot markers inside it.

### `colors.json`

Each entry maps a colour name to its light and dark value. Any `fill`/`stroke`
in an SVG that matches a light value is replaced with the corresponding CSS
variable:

```json
{
  "figure": { "label": "Mørk blå", "light": "#1E2B3C", "dark": "#384A5E" },
  "brand1": { "label": "Rød", "light": "#F45F63", "dark": "#F45F63" }
}
```

`label` is optional and is what the documentation shows in colour dropdowns.

`colors.json` is optional. Without it, the profile's illustrations keep the
colours they were drawn in: there is no dark mode and no colour slots, and
`meta.ts` exports `darkMode = false`.

## Development

```bash
pnpm build       # generate + compile to dist/
pnpm typecheck   # type-check the build scripts and the profiles
```

`scripts/build-illustrations.ts` generates TypeScript into `generated/`
(React components via SVGR, SVG strings, metadata) and CSS into `dist/`; `tsc`
then compiles `generated/` into `dist/`. `scripts/build-profiles.ts` runs
each profile's CSS through PostCSS (nesting, prefixes for the browsers in
`browserslist`, minifying) and writes it and the themes to `dist/<profile>/`, and `tsc` compiles `profiles/`
into `dist/<profile>/`. Both folders are git-ignored.
