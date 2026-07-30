import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { useActiveScenario } from '../hooks/useActiveScenario'
import { formatCurrency } from '../utils/format'

const axis = (value: number) => `€${Math.round(value / 1000)}k`
const tooltip = (value: unknown) => formatCurrency(Number(value))

export function ChartsPage() {
  const { result } = useActiveScenario()
  if (!result) return null
  const data = result.annual.map((row) => ({
    jaar: row.year, bruto: row.averageGrossPayment, netto: row.averageNetPayment,
    rente: row.totalInterest, aflossing: row.regularPrincipal, extra: row.extraPrincipal,
    schuld: row.closingBalance, woning: row.estimatedPropertyValue, belasting: row.taxBenefit,
  }))
  return (
    <>
      <PageHeader title="Grafieken" description="Vergelijk lasten, vermogensopbouw en schuld zonder afgeknotte of misleidende assen." />
      <div className="chart-grid">
        <Chart title="Bruto en netto maandlast">
          <LineChart data={data}><CartesianGrid strokeDasharray="4 4" /><XAxis dataKey="jaar" /><YAxis domain={[0, 'auto']} tickFormatter={axis} /><Tooltip formatter={tooltip} /><Legend /><Line type="monotone" dataKey="bruto" stroke="#ff5a1f" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="netto" stroke="#77736b" strokeWidth={2} dot={false} /></LineChart>
        </Chart>
        <Chart title="Rente versus aflossing per jaar">
          <BarChart data={data}><CartesianGrid strokeDasharray="4 4" vertical={false} /><XAxis dataKey="jaar" /><YAxis domain={[0, 'auto']} tickFormatter={axis} /><Tooltip formatter={tooltip} /><Legend /><Bar dataKey="rente" stackId="a" fill="#ff5a1f" /><Bar dataKey="aflossing" stackId="a" fill="#242421" /><Bar dataKey="extra" stackId="a" fill="#aaa69d" /></BarChart>
        </Chart>
        <Chart title="Woningwaarde en resterende schuld">
          <AreaChart data={data}><CartesianGrid strokeDasharray="4 4" /><XAxis dataKey="jaar" /><YAxis domain={[0, 'auto']} tickFormatter={axis} /><Tooltip formatter={tooltip} /><Legend /><Area type="monotone" dataKey="woning" stroke="#242421" fill="#aaa69d" /><Area type="monotone" dataKey="schuld" stroke="#ff5a1f" fill="#ffd5c5" /></AreaChart>
        </Chart>
        <Chart title="Belastingvoordeel per jaar">
          <BarChart data={data}><CartesianGrid strokeDasharray="4 4" vertical={false} /><XAxis dataKey="jaar" /><YAxis domain={[0, 'auto']} tickFormatter={axis} /><Tooltip formatter={tooltip} /><Legend /><Bar dataKey="belasting" fill="#ff5a1f" /></BarChart>
        </Chart>
      </div>
    </>
  )
}

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return <article className="panel chart-card"><h2>{title}</h2><ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer></article>
}
