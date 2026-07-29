# Hypotheekplanner

Een Nederlandstalige, privacyvriendelijke calculator voor annuïtaire, lineaire,
aflossingsvrije en gecombineerde hypotheken. De applicatie draait volledig in de browser,
slaat scenario's lokaal op en gebruikt geen externe diensten.

## Functionaliteiten

- Meerdere leningdelen met eigen vorm, rente, looptijd en fiscale behandeling
- Eenmalige, maandelijkse en jaarlijkse extra aflossingen
- Looptijd verkorten of toekomstige maandtermijn verlagen
- Toekomstige rentewijzigingen in de rekenkern
- Configureerbare renteaftrek, eigenwoningforfait en fiscale begrenzingen
- Maand- en jaaroverzicht met filters, sortering, kolomkeuze en paginering
- Grafieken voor lasten, rente, aflossing, schuld en woningwaarde
- Vier demonstratiescenario's en verschilweergave
- CSV, JSON en gecombineerde ZIP-export; gevalideerde JSON-import
- LocalStorage, light/dark mode en responsieve layout

## Lokaal ontwikkelen

```bash
npm ci
npm run dev
npm run check
```

`check` voert ESLint, Vitest, TypeScript en de Vite-productiebundel uit.

## Docker en Portainer

Kopieer optioneel `.env.example` naar `.env` en kies `APP_PORT`.

```bash
docker compose up -d --build
```

Open `http://localhost:3002`. De multi-stage build en kleine Express static-server volgen
de bestaande `defaultwebsite`-baseline. `/health` is de healthcheck.

In Portainer gebruik je `compose.production.yaml`. Deze publiceert geen hostpoort maar
hangt de container op het bestaande externe `web-network`; de algemene reverse proxy kan
de service daar op poort 3002 bereiken. Er is bewust geen projectspecifieke Nginx-config.
Er zijn geen secrets, database of volumes nodig.

## Configuratie en fiscaliteit

Defaults staan in `src/config/defaults.ts` en worden in een scenario gekopieerd. Pas ze aan
op Berekening. De samenvatting toont belastingjaar en aannames; controleer deze zelf tegen
de voor jou geldende actuele regels.

## Opslag, import en export

LocalStorage-sleutel: `hypotheekplanner-v1`. JSON gebruikt `schemaVersion: 1` en import
wordt met Zod gevalideerd. CSV ondersteunt komma/puntkomma, UTF-8 BOM en ruwe of
Nederlandse weergavewaarden. ZIP bevat maand-CSV, jaar-CSV en invoer plus aannames.

## Architectuur

```text
src/
  app/                  router
  calculation/          pure formules, schema's en fiscale module
  components/           herbruikbare UI
  config/               defaults en voorbeelden
  features/exports/     CSV, JSON en ZIP
  hooks/                 afgeleide scenariodata
  pages/                 routepagina's
  store/                 Zustand + LocalStorage
  types/                 domeintypes en Zod-schema
  utils/                 datum en notatie
```

Zie [CALCULATIONS.md](CALCULATIONS.md) voor formules, volgorde en precisie.

## Tests

Tests dekken annuïtair, lineair, aflossingsvrij, combinaties, extra aflossing,
rentewijziging, nulrente, laatste termijn, fiscale begrenzing, CSV, JSON en componenten.

```bash
npm test
npm run lint
npm run build
docker build -t hypotheekplanner-local .
```

## Bekende beperkingen en disclaimer

Er wordt geen bank-specifieke boeterente of volledige inkomstenbelastingaangifte berekend.
De methode gebruikt nominale jaarrente gedeeld door twaalf en geen dagrente. Browseropslag
hoort bij één profiel; maak JSON-back-ups.

Alle resultaten zijn indicatief en vormen geen financieel, juridisch of fiscaal advies.
Laat belangrijke beslissingen controleren door een gekwalificeerd adviseur.
