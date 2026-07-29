import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useActiveScenario } from '../hooks/useActiveScenario'
import type { ScheduleRow } from '../types/mortgage'
import { formatCurrency, formatNumber } from '../utils/format'

const columns: { key: keyof ScheduleRow; label: string; money?: boolean }[] = [
  { key: 'month', label: 'Nr.' },
  { key: 'date', label: 'Maand' },
  { key: 'loanPartName', label: 'Leningdeel' },
  { key: 'openingBalance', label: 'Beginstand', money: true },
  { key: 'annualRate', label: 'Rente %' },
  { key: 'grossPayment', label: 'Bruto termijn', money: true },
  { key: 'interest', label: 'Rente', money: true },
  { key: 'regularPrincipal', label: 'Aflossing', money: true },
  { key: 'extraPrincipal', label: 'Extra', money: true },
  { key: 'closingBalance', label: 'Eindstand', money: true },
  { key: 'taxBenefit', label: 'Belastingvoordeel', money: true },
  { key: 'netPayment', label: 'Netto termijn', money: true },
  { key: 'totalCashOut', label: 'Cash-out', money: true },
]

export function MonthlyPage() {
  const { scenario, result } = useActiveScenario()
  const [year, setYear] = useState('all')
  const [part, setPart] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<keyof ScheduleRow>('date')
  const [ascending, setAscending] = useState(true)
  const [visible, setVisible] = useState(columns.map((column) => column.key))
  const pageSize = 24
  const filtered = useMemo(() => {
    if (!result) return []
    return result.rows
      .filter((row) => year === 'all' || row.calendarYear === Number(year))
      .filter((row) => part === 'all' || row.loanPartId === part)
      .filter((row) => row.loanPartName.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const left = a[sort]
        const right = b[sort]
        const compared = typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right))
        return ascending ? compared : -compared
      })
  }, [result, year, part, query, sort, ascending])
  if (!scenario || !result) return null
  const shownColumns = columns.filter((column) => visible.includes(column.key))
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const changeFilter = (callback: () => void) => { callback(); setPage(0) }
  return (
    <>
      <PageHeader title="Maandoverzicht" description={`${result.rows.length.toLocaleString('nl-NL')} controleerbare regels over de volledige looptijd.`} />
      <section className="panel table-panel">
        <div className="table-tools">
          <input aria-label="Zoeken" placeholder="Zoek leningdeel…" value={query} onChange={(event) => changeFilter(() => setQuery(event.target.value))} />
          <select aria-label="Filter op jaar" value={year} onChange={(event) => changeFilter(() => setYear(event.target.value))}>
            <option value="all">Alle jaren</option>
            {[...new Set(result.rows.map((row) => row.calendarYear))].map((value) => <option key={value}>{value}</option>)}
          </select>
          <select aria-label="Filter op leningdeel" value={part} onChange={(event) => changeFilter(() => setPart(event.target.value))}>
            <option value="all">Alle leningdelen</option>
            {scenario.loanParts.map((loan) => <option key={loan.id} value={loan.id}>{loan.name}</option>)}
          </select>
          <details className="column-picker"><summary>Kolommen</summary><div>{columns.map((column) => <label key={column.key}><input type="checkbox" checked={visible.includes(column.key)} onChange={() => setVisible((current) => current.includes(column.key) ? current.filter((key) => key !== column.key) : [...current, column.key])} /> {column.label}</label>)}</div></details>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr>{shownColumns.map((column) => <th key={column.key}><button onClick={() => { if (sort === column.key) setAscending(!ascending); else { setSort(column.key); setAscending(true) } }}>{column.label} {sort === column.key ? (ascending ? '↑' : '↓') : ''}</button></th>)}</tr></thead>
            <tbody>{rows.map((row) => <tr key={`${row.loanPartId}-${row.month}`}>{shownColumns.map((column) => <td key={column.key}>{column.money ? formatCurrency(Number(row[column.key])) : column.key === 'annualRate' ? formatNumber(Number(row[column.key])) : String(row[column.key])}</td>)}</tr>)}</tbody>
            <tfoot><tr><td colSpan={shownColumns.length}>Selectie: {filtered.length} regels · rente {formatCurrency(filtered.reduce((sum, row) => sum + row.interest, 0))} · aflossing {formatCurrency(filtered.reduce((sum, row) => sum + row.totalPrincipal, 0))}</td></tr></tfoot>
          </table>
        </div>
        <div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>← Vorige</button><span>Pagina {page + 1} van {pages}</span><button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Volgende →</button></div>
      </section>
    </>
  )
}
