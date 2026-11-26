## Altinn i design.digdir.no: profil, produktsider og synkronisering

Første utkast til Altinn-profilen på design.digdir.no. Si gjerne fra om noe ikke henger på greip.

### Bakgrunnen
Altinn er ikke ett produkt, men flere flater med ulike brukere og komponentbibliotek: Studio for tjenesteeiere, skjemaene og tjenestene innbyggerne fyller ut, Innboks for innbyggere og virksomheter, og infoportalen. Felles for dem er logo, Inter, Altinn-temaet og størrelsene i Designsystemet. Derfor er profilen delt i to:

- **Identitet:** det som gjelder alle produktene, altså om profilen, logo, farger, typografi og avstander.
- **Produkter:** én side per produkt med brukere, størrelsesmodus og komponentene produktet faktisk bruker.

### Hvordan jeg har jobbet
- **Kilder:** Innholdet bygger på koden, ikke på skisser. Fargene kommer fra temaene, komponentlistene fra repoene og eksemplene fra Storybook og de visuelle testene. Kildene er lenket på hver side.
- **Farger:** Fargene i `altinn.css` er sjekket mot altinn-components. Accent, neutral og statusfargene stemmer. Fargerollene `person` og `company` fra altinn-components finnes ikke i noe tema her ennå, så de står på fargesiden som egne skalaer.
- **Fonter:** Inter er standard i alle produktene. Studio laster fortsatt Roboto, og eldre sider i infoportalen bruker DIN. Det står på typografisiden.
- **Logo:** Logosiden lenker til Figma-filen «Digdir – Logo» for interne.

### Komponenteksempler
- **Altinn Studio og Skjemaer og tjenester:** Komponentene vises som ekte HTML og CSS hentet fra Storybook, i en isolert ramme (`<StorySnapshot>`). Under hvert eksempel kan man kopiere HTML-en og åpne storyen i Storybook. Eksemplene har ingen JavaScript, så nedtrekkslister og dialoger åpner seg ikke.
- **Innboks:** Skjermbilder fra de visuelle testene i altinn-components (`__screenshots__`), gruppert etter kategoriene i Storybook.
- **Plassering:** Eksemplene ligger i `public/altinn-snapshots/` (rundt 2 MB) og skjermbildene i `public/images/altinn/`.

### Synkronisering
`.github/workflows/sync-altinn.yml` kjører hver mandag og kan også startes for hånd. Den henter altinn-components og altinn-studio, bygger Storybookene, lager eksemplene på nytt og åpner en PR når noe har endret seg. Bare innholdet mellom `{/* altinn-sync:start */}` og `{/* altinn-sync:end */}` i MDX-filene byttes ut, så tekst som skrives for hånd blir stående. Nye komponenter havner i gruppen «Nye komponenter» til noen plasserer dem i `apps/www/scripts/altinn-sync/groups.json`. Detaljer står i `apps/www/scripts/altinn-sync/README.md`.

### Åpne spørsmål
- [ ] **Gruppering:** Er grupperingen av Studio- og skjemakomponentene riktig?
- [ ] **Størrelsesmodus:** Medium for Innboks og skjemaene: stemmer det?
- [ ] **Enkeltpersonforetak:** Skal de bruke fargerollen `company`?
- [ ] **Tema i Storybook:** Storybooken for skjemakomponentene bruker standardtemaet i Designsystemet. Bør den få Altinn-temaet?
- [ ] **Publisering:** Storybooken for skjemakomponentene er ikke publisert. Kan den publiseres, slik at eksemplene kan lenke dit (`SB_FORM_URL`)?
- [ ] **Manglende stories:** 23 skjemakomponenter mangler story, blant annet Input, Likert, RepeatingGroup og signeringskomponentene.

### Før fletting
- [ ] Slå på «Allow GitHub Actions to create and approve pull requests» under Settings › Actions › General.
- [ ] Kjør «Synkroniser Altinn-komponenter» for hånd én gang og se at den lager en PR.
