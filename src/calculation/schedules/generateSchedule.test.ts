import { describe, expect, it } from 'vitest'
import { createDefaultScenario } from '../../config/defaults'
import { addMonths } from '../../utils/date'
import { calculateScenario } from './generateSchedule'

describe('hypotheekschema', () => {
  it('berekent een bekende annuïteit en lost exact af', () => {
    const scenario = createDefaultScenario()
    const result = calculateScenario(scenario)
    expect(result.firstGrossPayment).toBeCloseTo(1670.95, 2)
    expect(result.rows).toHaveLength(360)
    expect(result.remainingBalance).toBe(0)
    expect(result.totalRegularPrincipal).toBeCloseTo(350_000, 4)
  })

  it('berekent een lineaire hypotheek met dalende termijnen', () => {
    const scenario = createDefaultScenario()
    scenario.loanParts[0]!.type = 'linear'
    const result = calculateScenario(scenario)
    expect(result.rows[0]!.grossPayment).toBeGreaterThan(result.rows[100]!.grossPayment)
    expect(result.remainingBalance).toBe(0)
  })

  it('laat bij aflossingsvrij een configureerbare restschuld staan', () => {
    const scenario = createDefaultScenario()
    scenario.loanParts[0]!.type = 'interestOnly'
    scenario.loanParts[0]!.interestOnlyEndBalance = 350_000
    const result = calculateScenario(scenario)
    expect(result.rows).toHaveLength(360)
    expect(result.remainingBalance).toBe(350_000)
    expect(result.warnings).toContain('Aan het einde blijft een aflossingsvrije restschuld bestaan.')
  })

  it('verkort de looptijd met maandelijkse extra aflossing', () => {
    const baseline = createDefaultScenario()
    const extra = structuredClone(baseline)
    extra.extraPayments = [{
      id: 'extra', name: 'Extra', loanPartId: extra.loanParts[0]!.id, amount: 250,
      frequency: 'monthly', startDate: extra.startDate, annualIncreasePercentage: 0,
      effect: 'shortenTerm', priority: 'specified', manualPriority: [],
    }]
    const baselineResult = calculateScenario(baseline)
    const extraResult = calculateScenario(extra)
    expect(extraResult.rows.length).toBeLessThan(baselineResult.rows.length)
    expect(extraResult.totalInterest).toBeLessThan(baselineResult.totalInterest)
    expect(extraResult.remainingBalance).toBe(0)
  })

  it('past een toekomstige rente toe en herberekent de termijn', () => {
    const scenario = createDefaultScenario()
    scenario.loanParts[0]!.interestChanges = [{
      id: 'rate', effectiveDate: `${Number(scenario.startDate.slice(0, 4)) + 10}-01-01`,
      annualRate: 6, strategy: 'keepTerm',
    }]
    const result = calculateScenario(scenario)
    expect(result.rows[120]!.annualRate).toBe(6)
    expect(result.rows[120]!.grossPayment).toBeGreaterThan(result.rows[119]!.grossPayment)
  })

  it('past een rente ook na acht jaar en tien maanden in de juiste maand toe', () => {
    const scenario = createDefaultScenario()
    const effectiveDate = addMonths(scenario.startDate, 106)
    scenario.loanParts[0]!.fixedRateEndDate = effectiveDate
    scenario.loanParts[0]!.interestChanges = [{
      id: 'rate-8y10m', effectiveDate, annualRate: 5.25, strategy: 'keepTerm',
    }]

    const result = calculateScenario(scenario)

    expect(result.rows[105]!.annualRate).toBe(4)
    expect(result.rows[106]!.annualRate).toBe(5.25)
    expect(result.rows[106]!.grossPayment).toBeGreaterThan(result.rows[105]!.grossPayment)
    expect(result.warnings.some((warning) => warning.includes('ontbreekt een nieuw rentepercentage'))).toBe(false)
  })

  it('meldt een ontbrekende rente na de exacte rentevaste einddatum', () => {
    const scenario = createDefaultScenario()
    scenario.loanParts[0]!.fixedRateEndDate = addMonths(scenario.startDate, 106)
    scenario.loanParts[0]!.interestChanges = []

    const result = calculateScenario(scenario)

    expect(result.warnings.some((warning) => warning.includes('ontbreekt een nieuw rentepercentage'))).toBe(true)
  })

  it('combineert leningdelen zonder fiscale aftrek boven de rente', () => {
    const scenario = createDefaultScenario()
    const second = structuredClone(scenario.loanParts[0]!)
    second.id = 'second'
    second.principal = 100_000
    second.type = 'interestOnly'
    second.deductible = false
    scenario.loanParts[0]!.principal = 250_000
    scenario.loanParts = [scenario.loanParts[0]!, second]
    const result = calculateScenario(scenario)
    expect(result.rows.some((row) => row.loanPartId === second.id)).toBe(true)
    expect(result.rows.every((row) => row.taxBenefit <= row.deductibleInterest)).toBe(true)
  })

  it('handelt nul procent rente en een korte looptijd af', () => {
    const scenario = createDefaultScenario()
    scenario.loanParts[0]!.annualRate = 0
    scenario.loanParts[0]!.termYears = 1
    const result = calculateScenario(scenario)
    expect(result.rows).toHaveLength(12)
    expect(result.totalInterest).toBe(0)
    expect(result.remainingBalance).toBe(0)
  })
})
