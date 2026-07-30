import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { taxDisclaimer } from '../config/defaults'
import { useActiveScenario } from '../hooks/useActiveScenario'
import { formatCurrency } from '../utils/format'

export function DashboardPage() {
  const { scenario, result } = useActiveScenario()
  if (!scenario || !result) return null
  const chartData = result.annual.map((row) => ({
    jaar: row.year,
    schuld: Math.round(row.closingBalance),
    woning: Math.round(row.estimatedPropertyValue),
  }))
  return (
    <>
      <PageHeader
        eyebrow={`Scenario-overzicht · belastingjaar ${scenario.tax.taxYear}`}
        title={scenario.name}
        description="Je hypotheek in één oogopslag, doorgerekend met je eigen fiscale aannames."
        actions={<Link className="button primary" to="/berekening">Berekening aanpassen</Link>}
      />
      {result.warnings.map((warning) => (
        <div className="notice warning" key={warning}>⚠ {warning}</div>
      ))}
      <section className="metrics">
        <MetricCard label="Totale hypotheek" value={formatCurrency(result.initialPrincipal)} detail={`${scenario.loanParts.length} leningdelen`} icon="€" />
        <MetricCard label="Eerste bruto maandlast" value={formatCurrency(result.firstGrossPayment)} detail="Rente + reguliere aflossing" icon="↗" />
        <MetricCard label="Eerste netto maandlast" value={formatCurrency(result.firstNetPayment)} detail="Na indicatief belastingvoordeel" icon="↓" />
        <MetricCard label="Totale rente" value={formatCurrency(result.totalInterest)} detail={`Tot ${new Date(`${result.endDate}T00:00:00`).toLocaleDateString('nl-NL')}`} icon="%" />
      </section>
      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Ontwikkeling</span><h2>Woningwaarde & hypotheekschuld</h2></div>
            <Link to="/grafieken">Alle grafieken →</Link>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="debt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff5a1f" stopOpacity={0.28}/><stop offset="95%" stopColor="#ff5a1f" stopOpacity={0}/></linearGradient>
                <linearGradient id="home" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#77736b" stopOpacity={0.22}/><stop offset="95%" stopColor="#77736b" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="jaar" />
              <YAxis tickFormatter={(value: number) => `€${Math.round(value / 1000)}k`} width={62} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="woning" stroke="#77736b" fill="url(#home)" name="Woningwaarde" />
              <Area type="monotone" dataKey="schuld" stroke="#ff5a1f" fill="url(#debt)" name="Hypotheekschuld" />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="panel">
          <span className="eyebrow">Aannames</span>
          <h2>Zo rekenen we</h2>
          <dl className="assumptions">
            <div><dt>Nominale rente</dt><dd>÷ 12 per maand</dd></div>
            <div><dt>Renteaftrek</dt><dd>{(scenario.tax.mortgageInterestDeductionRate * 100).toFixed(2)}%</dd></div>
            <div><dt>Eigenwoningforfait</dt><dd>{(scenario.tax.imputedRentalValueRate * 100).toFixed(3)}%</dd></div>
            <div><dt>Woningwaardegroei</dt><dd>{scenario.annualPropertyGrowth.toFixed(1)}% per jaar</dd></div>
            <div><dt>Teruggave</dt><dd>{scenario.tax.monthlyProvisionalRefund ? 'Maandelijks' : 'Jaarlijks achteraf'}</dd></div>
          </dl>
          <p className="disclaimer">{taxDisclaimer}</p>
        </article>
      </section>
    </>
  )
}
