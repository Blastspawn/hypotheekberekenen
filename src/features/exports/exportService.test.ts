import { describe, expect, it } from 'vitest'
import { createDefaultScenario } from '../../config/defaults'
import { calculateScenario } from '../../calculation/schedules/generateSchedule'
import { scenarioSchema } from '../../types/schema'
import { scheduleCsv } from './exportService'

describe('export en import', () => {
  it('maakt Excel-vriendelijke CSV met alle regels', () => {
    const result = calculateScenario(createDefaultScenario())
    const csv = scheduleCsv(result.rows, { delimiter: ';', bom: true, values: 'raw' })
    expect(csv.startsWith('\ufeff')).toBe(true)
    expect(csv).toContain('Maandnummer;Datum')
    expect(csv.split('\n').length).toBe(361)
  })

  it('valideert een geëxporteerd scenario', () => {
    const scenario = createDefaultScenario()
    const parsed: unknown = JSON.parse(JSON.stringify(scenario))
    expect(scenarioSchema.parse(parsed).id).toBe(scenario.id)
  })

  it('weigert ongeldige negatieve invoer', () => {
    const scenario = createDefaultScenario()
    scenario.desiredLoan = -1
    expect(() => scenarioSchema.parse(scenario)).toThrow()
  })
})
