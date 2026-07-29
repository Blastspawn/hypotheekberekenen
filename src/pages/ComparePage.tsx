import { useMemo } from 'react'
import { calculateScenario } from '../calculation/schedules/generateSchedule'
import { PageHeader } from '../components/PageHeader'
import { useMortgageStore } from '../store/useMortgageStore'
import { formatCurrency } from '../utils/format'

export function ComparePage() {
  const scenarios = useMortgageStore((state) => state.scenarios)
  const activeId = useMortgageStore((state) => state.activeScenarioId)
  const duplicate = useMortgageStore((state) => state.duplicateScenario)
  const remove = useMortgageStore((state) => state.deleteScenario)
  const results = useMemo(
    () => scenarios.map((scenario) => ({ scenario, result: calculateScenario(scenario) })),
    [scenarios],
  )
  const base = results[0]?.result
  return (
    <>
      <PageHeader
        title="Scenario’s vergelijken"
        description="Verschillen worden afgezet tegen het eerste scenario als basis."
        actions={<button className="button primary" onClick={() => duplicate(activeId)}>Actief scenario dupliceren</button>}
      />
      <section className="comparison-grid">
        {results.map(({ scenario, result }, index) => (
          <article className={`panel comparison-card ${scenario.id === activeId ? 'selected' : ''}`} key={scenario.id}>
            <div className="scenario-number">{String(index + 1).padStart(2, '0')}</div>
            <span className="eyebrow">{index === 0 ? 'Basisscenario' : 'Variant'}</span>
            <h2>{scenario.name}</h2>
            <dl className="compare-list">
              <Compare label="Hoofdsom" value={result.initialPrincipal} base={base?.initialPrincipal} />
              <Compare label="Gem. bruto maandlast" value={result.averageGrossPayment} base={base?.averageGrossPayment} />
              <Compare label="Gem. netto maandlast" value={result.averageNetPayment} base={base?.averageNetPayment} />
              <Compare label="Hoogste maandlast" value={result.highestPayment} base={base?.highestPayment} />
              <Compare label="Totale rente" value={result.totalInterest} base={base?.totalInterest} />
              <Compare label="Extra aflossing" value={result.totalExtraPrincipal} base={base?.totalExtraPrincipal} />
              <Compare label="Belastingvoordeel" value={result.totalTaxBenefit} base={base?.totalTaxBenefit} />
              <Compare label="Resterende schuld" value={result.remainingBalance} base={base?.remainingBalance} />
            </dl>
            <div className="compare-end"><span>Verwacht eindmoment</span><strong>{new Date(`${result.endDate}T00:00:00`).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}</strong></div>
            {scenarios.length > 1 && <button className="text-button danger" onClick={() => { if (confirm(`Scenario “${scenario.name}” verwijderen?`)) remove(scenario.id) }}>Scenario verwijderen</button>}
          </article>
        ))}
      </section>
    </>
  )
}

function Compare({ label, value, base }: { label: string; value: number; base?: number }) {
  const difference = base === undefined ? 0 : value - base
  return <div><dt>{label}</dt><dd>{formatCurrency(value)}{Math.abs(difference) > 0.01 && <small className={difference < 0 ? 'positive' : 'negative'}>{difference > 0 ? '+' : ''}{formatCurrency(difference)}</small>}</dd></div>
}
