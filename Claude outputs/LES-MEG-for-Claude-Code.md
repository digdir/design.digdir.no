# Overlevering til Claude Code – branch `altinn-styleguide`

Ingenting er committet ennå. Gjør dette i rekkefølge, og spør Olav før push.

1. Flytt workflowen på plass:
   `mkdir -p .github/workflows && mv "Claude outputs/sync-altinn.yml" .github/workflows/`
2. Slett utdaterte filer (ikke lenger i bruk):
   - `apps/www/app/content/altinn/altinn-studio.mdx` (erstattet av `studio.mdx`)
   - `apps/www/public/images/altinn/studio/` og `apps/www/public/images/altinn/skjema/` (erstattet av `public/altinn-snapshots/`)
3. Sjekk: `pnpm lint` og `pnpm --filter www build` (eller `pnpm build`).
4. Commit alt unntatt `Claude outputs/`:
   `git add -A -- . ':!Claude outputs'`
5. Push: `git push -u origin altinn-styleguide`
6. Opprett PR med teksten i `Claude outputs/PR-beskrivelse.md`
   (f.eks. `gh pr create --title "Altinn i design.digdir.no: profil, produktsider og synkronisering" --body-file "Claude outputs/PR-beskrivelse.md"`).

Åpent: Olav har sett at ikoner fra Aksel mangler på en oversiktsside – avklar hvilken side før det fikses.
