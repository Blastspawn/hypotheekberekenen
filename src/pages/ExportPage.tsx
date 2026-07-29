import { useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { annualCsv, downloadText, downloadZip, scheduleCsv, type CsvOptions } from '../features/exports/exportService'
import { useActiveScenario } from '../hooks/useActiveScenario'
import { useMortgageStore } from '../store/useMortgageStore'
import { scenarioSchema } from '../types/schema'

export function ExportPage() {
  const { scenario, result } = useActiveScenario()
  const scenarios = useMortgageStore((state) => state.scenarios)
  const importScenarios = useMortgageStore((state) => state.importScenarios)
  const [options, setOptions] = useState<CsvOptions>({ delimiter: ';', bom: true, values: 'raw' })
  const [message, setMessage] = useState('')
  const input = useRef<HTMLInputElement>(null)
  if (!scenario || !result) return null
  const importJson = async (file?: File) => {
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      const validated = candidates.map((candidate) => scenarioSchema.parse(candidate))
      importScenarios(validated)
      setMessage(`${validated.length} scenario('s) veilig geïmporteerd.`)
    } catch {
      setMessage('Import mislukt: het bestand voldoet niet aan schemaversie 1.')
    }
  }
  return (
    <>
      <PageHeader title="Import & export" description="Neem je gegevens mee zonder ze naar een server te sturen." />
      {message && <div className="notice">{message}</div>}
      <div className="export-grid">
        <section className="panel">
          <span className="eyebrow">CSV-instellingen</span><h2>Bestandsopmaak</h2>
          <div className="form-grid one">
            <label className="field"><span>Scheidingsteken</span><select value={options.delimiter} onChange={(event) => setOptions({ ...options, delimiter: event.target.value as ',' | ';' })}><option value=";">Puntkomma (Excel NL)</option><option value=",">Komma</option></select></label>
            <label className="field"><span>Waarden</span><select value={options.values} onChange={(event) => setOptions({ ...options, values: event.target.value as CsvOptions['values'] })}><option value="raw">Ruwe rekenwaarden</option><option value="display">Nederlandse weergave</option><option value="both">Beide</option></select></label>
            <label className="check"><input type="checkbox" checked={options.bom} onChange={(event) => setOptions({ ...options, bom: event.target.checked })} /> UTF-8 BOM voor Excel</label>
          </div>
        </section>
        <section className="panel export-actions">
          <span className="eyebrow">Actief scenario</span><h2>Losse exports</h2>
          <button className="export-button" onClick={() => downloadText(scheduleCsv(result.rows, options), 'maandoverzicht.csv')}><span>CSV</span><div><strong>Volledig maandoverzicht</strong><small>{result.rows.length} rekenregels</small></div>↓</button>
          <button className="export-button" onClick={() => downloadText(annualCsv(result.annual, options), 'jaaroverzicht.csv')}><span>CSV</span><div><strong>Jaaroverzicht</strong><small>{result.annual.length} kalenderjaren</small></div>↓</button>
          <button className="export-button" onClick={() => downloadText(JSON.stringify(scenario, null, 2), 'scenario.json', 'application/json')}><span>JSON</span><div><strong>Invoer & aannames</strong><small>Schemaversie 1</small></div>↓</button>
          <button className="button primary" onClick={() => void downloadZip(scenario, result, options)}>Alles als ZIP downloaden</button>
        </section>
        <section className="panel">
          <span className="eyebrow">Back-up</span><h2>Alle scenario’s</h2>
          <p>Exporteer alle lokaal opgeslagen scenario’s als één valideerbaar JSON-bestand.</p>
          <button className="button secondary full" onClick={() => downloadText(JSON.stringify(scenarios, null, 2), 'hypotheek-scenarios.json', 'application/json')}>Alle scenario’s exporteren</button>
          <input ref={input} hidden type="file" accept="application/json,.json" onChange={(event) => void importJson(event.target.files?.[0])} />
          <button className="button secondary full" onClick={() => input.current?.click()}>JSON-bestand importeren</button>
        </section>
      </div>
    </>
  )
}
