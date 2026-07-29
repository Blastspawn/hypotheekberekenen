import { PageHeader } from '../components/PageHeader'
import { taxDisclaimer } from '../config/defaults'

const topics = [
  ['Bruto maandlast', 'De betaalde rente plus de contractuele aflossing. Een extra aflossing staat apart als aanvullende cash-out.'],
  ['Netto maandlast', 'De bruto termijn verminderd met het indicatief berekende fiscale voordeel. Bij jaarlijkse teruggave verandert alleen de timing van de cashflow.'],
  ['Aflossing en vermogen', 'Aflossing verlaagt je schuld. Het is cash-out, maar economisch doorgaans vermogensopbouw en daarom geen rentekostenpost.'],
  ['Hypotheekrenteaftrek', 'Alleen als aftrekbaar gemarkeerde rente telt mee. Het eigenwoningforfait wordt van de aftrekgrondslag afgetrokken en het voordeel wordt begrensd door je instellingen.'],
  ['Extra aflossen', 'Een lager saldo geeft vanaf de volgende periode minder rente. Je kunt de looptijd verkorten of bij annuïtair/lineair de toekomstige termijn verlagen.'],
  ['Afronding', 'Intern rekent de applicatie met Decimal en 40 significante cijfers. Alleen getoonde bedragen worden op twee decimalen afgerond; CSV kan ruwe waarden bevatten.'],
]

export function HelpPage() {
  return (
    <>
      <PageHeader title="Uitleg & disclaimer" description="Wat de bedragen betekenen en waar deze planner bewust grenzen trekt." />
      <div className="help-grid">{topics.map(([title, text], index) => <article className="panel help-card" key={title}><span>{String(index + 1).padStart(2, '0')}</span><h2>{title}</h2><p>{text}</p></article>)}</div>
      <div className="notice warning"><strong>Belangrijk:</strong> {taxDisclaimer} Controleer beslissingen altijd bij een gekwalificeerd adviseur en met de actuele regels van de Belastingdienst.</div>
    </>
  )
}
