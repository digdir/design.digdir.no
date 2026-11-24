# Synkronisering av Altinn-komponenter

`sync.mjs` holder komponentsidene for Altinn oppdatert mot kildene. Arbeidsflyten
`.github/workflows/sync-altinn.yml` kjører skriptet hver mandag og lager en PR når noe har endret seg.
Den kan også startes for hånd under Actions › Synkroniser Altinn-komponenter › Run workflow.

| Side | Kilde | Hva som hentes |
| --- | --- | --- |
| `innboks.mdx` | [Altinn/altinn-components](https://github.com/Altinn/altinn-components) | Komponentmappene i `lib/components`, kategoriene i Storybook og skjermbildene i `__screenshots__` |
| `studio.mdx` | [Altinn/altinn-studio](https://github.com/Altinn/altinn-studio), `libs/designer-components` | Storybook bygges, og HTML og CSS for én story per komponent hentes ut |
| `skjemaer-og-tjenester.mdx` | [Altinn/altinn-studio](https://github.com/Altinn/altinn-studio), `src/App/frontend/src/layout` og `common/ts/form-component` | Komponentmappene, og HTML og CSS fra Storybook for skjemakomponentene |

## Hva som endres

Skriptet bytter bare ut innholdet mellom `{/* altinn-sync:start */}` og `{/* altinn-sync:end */}` i MDX-filene,
bildene i `public/images/altinn/innboks` og utdragene i `public/altinn-snapshots`. Tekst utenfor markørene redigeres for hånd.

## Eksemplene

Studio- og skjemakomponentene vises med komponenten `<StorySnapshot>`. Den viser HTML og CSS hentet fra Storybook i en isolert ramme, med knapp for å kopiere HTML-en og lenke til den interaktive storyen. Utdragene har ingen JavaScript, så nedtrekkslister og dialoger åpner seg ikke. Hver Storybook får én felles CSS-fil (`studio.css` og `skjema.css`).

Storybooken for skjemakomponentene er ikke publisert. Når den er det, setter dere `SB_FORM_URL` i arbeidsflyten, så får eksemplene lenke dit.

## Gruppering

`groups.json` bestemmer hvilken gruppe hver komponent står i. Nye komponenter som ikke står der, havner i gruppen
«Nye komponenter». Flytt dem til riktig gruppe i `groups.json` før PR-en flettes.

## Kjøre lokalt

```sh
AC_REPO=../altinn-components \
AS_REPO=../altinn-studio \
SB_STUDIO=/tmp/sb-studio \
SB_FORM=/tmp/sb-form \
node apps/www/scripts/altinn-sync/sync.mjs
```

`SB_STUDIO` og `SB_FORM` er ferdigbygde Storybooks (`npx storybook build -o …` i de to pakkene i altinn-studio).
Med `ONLY=innboks` kjøres bare én del.
