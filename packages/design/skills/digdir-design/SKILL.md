---
name: digdir-design
description: Use when writing or reviewing UI code in a project that depends on @digdir/digdir-design, Digdir's design package built on Designsystemet. Covers which imports to use, theme and CSS setup, styling with --ds-* tokens and data-color, the profiles' own components and illustrations.
---

# @digdir/digdir-design

Components, themes and illustrations for Digdir's visual profiles. The package
re-exports Designsystemet and adds what each profile needs on top.

The package changes between versions, so this file holds the rules, not the
contents. Read the installed files for names and values. Do not invent import
paths, components, props, classes or variables.

## Where to look

Everything is in `node_modules/@digdir/digdir-design/`. Start with `exports`
in `package.json`: it lists every import path and the file behind it.

| To find                                  | Read                                                             |
| ---------------------------------------- | ---------------------------------------------------------------- |
| Import paths, profiles and scopes        | `exports` in `package.json`                                      |
| Colour names and `--ds-*` variables      | The file behind `<profile>/theme`                                |
| Components, props and examples           | The `types` file behind `<profile>/react`, and what it re-exports |
| Classes of the profile's own components  | The files behind `<profile>/css/*.css`                           |
| Illustrations, their tags and colours    | The files behind `<profile>/illustrations/meta` and `/react`     |
| Designsystemet's components and patterns | https://designsystemet.no/llms.txt                               |
| Examples and guidance for the profiles   | https://design.digdir.no                                         |

## Imports

Every import is `@digdir/digdir-design/<profile>/<scope>`. Use the profile the
project already imports from. If there is none, ask.

```ts
// Once, at the root of the app.
import '@digdir/digdir-design/<profile>/theme';
import '@digdir/digdir-design/<profile>/css';
```

```tsx
import { Button } from '@digdir/digdir-design/<profile>/react';
```

```ts
// Without React: registers the web components.
import '@digdir/digdir-design/<profile>/web';
```

- `css` contains Designsystemet's CSS. Do not also import
  `@digdir/designsystemet-css`.
- Import components from the profile's entry, not from
  `@digdir/designsystemet-react`. The profile has everything Designsystemet
  exports and may replace some of it.
- Do not install Designsystemet's packages. They come with this package.
- If the profile lacks a scope in `exports`, say so. Do not guess a path.

## Styling

Style with Designsystemet's design tokens and data attributes. Do not
hard-code colours, spacing, radii, shadows or font sizes.

- **Use `--ds-*` variables.** The theme file defines them all.
- **Set colour with `data-color`.** It applies to the element and everything
  inside it. The theme file has one `[data-color="<name>"]` rule per colour.
- **Prefer the unnamed colour variables.** Each colour has named variables,
  with the colour in the name. The `[data-color]` rules also set an unnamed
  set, without it, that points to the nearest `data-color`. Use the unnamed
  ones in your own CSS, so the component changes colour with `data-color` like
  Designsystemet's components do.
- **Use a named variable only when the colour must not change**, for example
  neutral body text.
- **`data-color-scheme`** is `light`, `dark` or `auto`. It resets `data-color`,
  so set `data-color` again on that element or inside it.
- **`data-size`** scales sizes and fonts for the element and everything inside.

```css
/* Follows data-color, data-color-scheme and data-size. */
.card {
  padding: var(--ds-size-6);
  border-radius: var(--ds-border-radius-md);
  background: var(--ds-color-surface-tinted);
  color: var(--ds-color-text-default);
}
```

Details: https://designsystemet.no/en/fundamentals/code/colors.md,
https://designsystemet.no/en/fundamentals/code/sizes.md and
https://designsystemet.no/en/fundamentals/code/css.md

## Components

- Components from Designsystemet are documented by Designsystemet. Append
  `.md` to a documentation URL to get it as Markdown.
- A profile can add components, or replace one from Designsystemet under the
  same name. The profile's `react` types show which, with examples in the
  comments.
- The profile's own components also work without React. Their classes are in
  the profile's `css` files, and https://design.digdir.no has the markup.

## Illustrations

```tsx
import { SomeIllustration } from '@digdir/digdir-design/<profile>/illustrations/react';
import '@digdir/digdir-design/<profile>/illustrations/css';

<SomeIllustration aria-hidden />;
```

- Pick an illustration that exists. `illustrations/meta` lists them with
  titles and tags.
- Illustrations are decorative by default. Add `aria-hidden`, or pass `title`
  when the illustration carries information.
- The `illustrations/css` import makes them follow dark mode.
- Some have props for recolouring a part. Use only the values in the types.
