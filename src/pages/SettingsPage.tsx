import { PageHeader } from '../components/PageHeader'
import { taxDisclaimer } from '../config/defaults'
import { useActiveScenario } from '../hooks/useActiveScenario'
import { useMortgageStore } from '../store/useMortgageStore'

export function SettingsPage() {
  const { scenario } = useActiveScenario()
  const clearAll = useMortgageStore((state) => state.clearAll)
  if (!scenario) return null
  return (
    <>
      <PageHeader title="Applicatie-instellingen" description="Privacy, lokale gegevens en de fiscale configuratie van het actieve scenario." />
      <div className="settings-grid">
        <section className="panel"><span className="eyebrow">Privacy</span><h2>Alleen deze browser</h2><p>Scenario’s worden opgeslagen in LocalStorage. De applicatie bevat geen analytics, trackers of externe financiële API’s.</p><div className="notice">Er worden geen financiële gegevens naar een server verstuurd.</div></section>
        <section className="panel"><span className="eyebrow">Fiscale set</span><h2>Belastingjaar {scenario.tax.taxYear}</h2><dl className="assumptions"><div><dt>Marginaal tarief</dt><dd>{(scenario.tax.marginalTaxRate * 100).toFixed(2)}%</dd></div><div><dt>Renteaftrek</dt><dd>{(scenario.tax.mortgageInterestDeductionRate * 100).toFixed(2)}%</dd></div><div><dt>Eigenwoningforfait</dt><dd>{(scenario.tax.imputedRentalValueRate * 100).toFixed(3)}%</dd></div><div><dt>Boetevrij aflossen</dt><dd>{scenario.freeRepaymentPercentage}% indicatie</dd></div></dl><p className="disclaimer">{taxDisclaimer}</p></section>
        <section className="panel danger-zone"><span className="eyebrow">Gegevensbeheer</span><h2>Lokale gegevens herstellen</h2><p>Dit verwijdert je wijzigingen en zet de vier meegeleverde demonstratiescenario’s terug.</p><button className="button danger" onClick={() => { if (confirm('Alle lokale scenario’s verwijderen en voorbeelden terugzetten?')) clearAll() }}>Alle lokale gegevens verwijderen</button></section>
      </div>
    </>
  )
}
