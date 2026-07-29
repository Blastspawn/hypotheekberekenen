import { PageHeader } from '../components/PageHeader'
import { useActiveScenario } from '../hooks/useActiveScenario'
import { formatCurrency, formatPercentage } from '../utils/format'

export function AnnualPage() {
  const { result } = useActiveScenario()
  if (!result) return null
  return (
    <>
      <PageHeader title="Jaaroverzicht" description="Maandregels samengevat per kalenderjaar; totalen sluiten aan op de volledige planning." />
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Jaar</th><th>Gem. bruto</th><th>Gem. netto</th><th>Rente</th><th>Aflossing</th><th>Extra</th><th>Belastingvoordeel</th><th>Eindschuld</th><th>Woningwaarde</th><th>LTV</th><th>Eigen vermogen</th></tr></thead>
            <tbody>{result.annual.map((row) => <tr key={row.year}><td><strong>{row.year}</strong></td><td>{formatCurrency(row.averageGrossPayment)}</td><td>{formatCurrency(row.averageNetPayment)}</td><td>{formatCurrency(row.totalInterest)}</td><td>{formatCurrency(row.regularPrincipal)}</td><td>{formatCurrency(row.extraPrincipal)}</td><td>{formatCurrency(row.taxBenefit)}</td><td>{formatCurrency(row.closingBalance)}</td><td>{formatCurrency(row.estimatedPropertyValue)}</td><td>{formatPercentage(row.loanToValue)}</td><td>{formatCurrency(row.equity)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  )
}
