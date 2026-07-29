import JSZip from 'jszip'
import Papa from 'papaparse'
import type { AnnualSummary, Scenario, ScenarioResult, ScheduleRow } from '../../types/mortgage'

export interface CsvOptions {
  delimiter: ',' | ';'
  bom: boolean
  values: 'display' | 'raw' | 'both'
}

const scheduleHeaders: Record<keyof ScheduleRow, string> = {
  month: 'Maandnummer',
  date: 'Datum',
  calendarYear: 'Jaar',
  loanPartId: 'Leningdeel-ID',
  loanPartName: 'Leningdeel',
  mortgageType: 'Hypotheekvorm',
  openingBalance: 'Beginstand',
  annualRate: 'Rentepercentage',
  grossPayment: 'Bruto termijn',
  interest: 'Rente',
  regularPrincipal: 'Reguliere aflossing',
  extraPrincipal: 'Extra aflossing',
  totalPrincipal: 'Totale aflossing',
  closingBalance: 'Eindstand',
  deductibleInterest: 'Aftrekbare rente',
  nonDeductibleInterest: 'Niet-aftrekbare rente',
  imputedRentalValue: 'Eigenwoningforfait',
  taxBenefit: 'Belastingvoordeel',
  netPayment: 'Netto termijn',
  totalCashOut: 'Totale cash-out',
  cumulativeInterest: 'Cumulatieve rente',
  cumulativePrincipal: 'Cumulatieve aflossing',
  cumulativeExtraPrincipal: 'Cumulatieve extra aflossing',
  cumulativeTaxBenefit: 'Cumulatief belastingvoordeel',
  cumulativeNetCost: 'Cumulatieve netto kosten',
}

function displayValue(value: unknown): unknown {
  return typeof value === 'number'
    ? new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 10 }).format(value)
    : value
}

export function scheduleCsv(rows: ScheduleRow[], options: CsvOptions): string {
  const data = rows.map((row) =>
    Object.fromEntries(
      Object.entries(scheduleHeaders).flatMap(([key, label]) => {
        const value = row[key as keyof ScheduleRow]
        if (options.values === 'raw') return [[label, value]]
        if (options.values === 'display') return [[label, displayValue(value)]]
        return [
          [`${label} (weergave)`, displayValue(value)],
          [`${label} (ruw)`, value],
        ]
      }),
    ),
  )
  const csv = Papa.unparse(data, { delimiter: options.delimiter })
  return `${options.bom ? '\ufeff' : ''}${csv}`
}

export function annualCsv(rows: AnnualSummary[], options: CsvOptions): string {
  const csv = Papa.unparse(rows, { delimiter: options.delimiter })
  return `${options.bom ? '\ufeff' : ''}${csv}`
}

export function downloadText(contents: string, filename: string, type = 'text/csv;charset=utf-8') {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([contents], { type }))
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export async function downloadZip(
  scenario: Scenario,
  result: ScenarioResult,
  options: CsvOptions,
) {
  const zip = new JSZip()
  zip.file('maandoverzicht.csv', scheduleCsv(result.rows, options))
  zip.file('jaaroverzicht.csv', annualCsv(result.annual, options))
  zip.file('scenario-en-aannames.json', JSON.stringify(scenario, null, 2))
  const blob = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${scenario.name.replaceAll(/[^a-z0-9]+/gi, '-')}.zip`
  link.click()
  URL.revokeObjectURL(link.href)
}
