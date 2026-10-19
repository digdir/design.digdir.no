# Merkevarereisen mot Norge

Arbeidsdokumentet for hvordan Digdirs løsninger og komponentbibliotek flytter fra dagens profiler til Norge og Digdir.
Én statisk side (`index.html`), hostet på Vercel: https://merkevarereisen.vercel.app

> **Konseptgren.** Grenen `conceptual/merkevarereisen` står alene: den deler ingen historikk eller kode med `main` i design.digdir.no og inneholder bare dette arbeidsdokumentet. Den er ment for diskusjon, ikke for å flettes inn.

## Deploy

```bash
vercel login
vercel link     # første gang: velg prosjektet «merkevarereisen»
vercel --prod
```

## Redigere

All data ligger i blokken merket `DATA (rediger her)` øverst i scriptet i `index.html`.
Deploy på nytt med `vercel --prod`.
