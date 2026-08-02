# Rekenmethodes

## Architectuur

De berekeningslaag staat volledig los van React. `calculateScenario(scenario)` is een pure
functie die per leningdeel een schema maakt, de regels op datum samenvoegt en daaruit
jaar- en scenariototalen afleidt. Alle invoer en uitvoer hebben expliciete TypeScript-types.

## Rente en annuïteit

De applicatie gebruikt een nominale jaarrente:

```text
maandrente = nominale jaarrente / 100 / 12
perioderente = beginstand × maandrente
A = P × r / (1 - (1 + r)^-n)
```

De rente wordt steeds berekend over de beginstand. Een rentewijziging gaat aan het begin
van de gekozen maand in. Bij `keepTerm` wordt de annuïteit opnieuw berekend over resterend
saldo en resterende contractuele maanden. Bij nulrente is `A = P / n`.

De rentevaste periode wordt als exacte einddatum opgeslagen, zodat bijvoorbeeld acht jaar
en tien maanden niet naar een geheel jaar wordt afgerond. Een nieuwe rente wordt vanaf de
ingevoerde kalendermaand toegepast. Omdat het schema maandperioden gebruikt, wordt een
datum midden in een maand niet naar dagen pro rata verdeeld. Zonder ingevoerde vervolgrente
blijft de oude rente als expliciet gewaarschuwde scenario-aanname gelden.

Voorbeeld: € 350.000, 4% nominaal en 360 maanden geeft een eerste termijn van ongeveer
€ 1.670,95.

## Lineair en aflossingsvrij

Lineaire aflossing is `oorspronkelijke hoofdsom / aantal maanden`; het rentedeel daalt.
Bij aflossingsvrij bestaat de termijn uit rente. Een configureerbaar eindsaldo levert
expliciet een waarschuwing op.

## Extra aflossingen

Een aflossing kan eenmalig, maandelijks of jaarlijks zijn en jaarlijks stijgen. Het bedrag
wordt begrensd op `max(0, beginstand - gewenst eindsaldo - reguliere aflossing)`.
`shortenTerm` houdt de termijn ongeveer gelijk; `lowerPayment` herberekent de termijn over
de resterende looptijd.

## Fiscaliteit

Alle tarieven staan in het scenario. Per maand:

```text
forfait = min(WOZ, WOZ-grens) × forfaitpercentage / 12
grondslag = max(aftrekbare rente - forfait, 0)
tarief = min(marginaal tarief, max. aftrektarief) × aftrekbeperking
voordeel = min(grondslag × tarief, maandlimiet, aftrekbare rente)
```

Bij meerdere leningdelen wordt het forfait pro rata naar oorspronkelijke hoofdsom verdeeld.
Maandelijkse of jaarlijkse ontvangst verandert de cashflowtiming, niet het jaarvoordeel.

## Precisie en afronding

`decimal.js` rekent met 40 significante cijfers en `ROUND_HALF_UP`. Tussenresultaten worden
niet op centen afgerond. Uitvoer bewaart maximaal tien decimalen; de UI rondt alleen de
presentatie op twee decimalen af. De laatste betaling wordt op de exacte restschuld begrensd.

## Grenzen

- Geen echte boeterente zonder bank-specifieke gegevens.
- De fiscale module is een transparante indicatie, geen volledige aangifte.
- Geen dagrente, schrikkeldagcorrectie of andere betaalfrequentie dan maandelijks.
