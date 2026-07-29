import { createDefaultScenario } from './defaults'
import type { Scenario } from '../types/mortgage'

const clone = (scenario: Scenario): Scenario => structuredClone(scenario)

export function createExampleScenarios(): Scenario[] {
  const base = createDefaultScenario()
  const extra = clone(base)
  extra.id = crypto.randomUUID()
  extra.name = 'Annuïtair + € 250 per maand'
  extra.extraPayments = [
    {
      id: crypto.randomUUID(),
      name: 'Maandelijks extra',
      loanPartId: extra.loanParts[0]?.id,
      amount: 250,
      frequency: 'monthly',
      startDate: extra.startDate,
      annualIncreasePercentage: 0,
      effect: 'shortenTerm',
      priority: 'specified',
      manualPriority: [],
    },
  ]

  const combination = clone(base)
  combination.id = crypto.randomUUID()
  combination.name = 'Combinatiehypotheek'
  const annuityId = crypto.randomUUID()
  const interestOnlyId = crypto.randomUUID()
  combination.loanParts = [
    {
      ...combination.loanParts[0]!,
      id: annuityId,
      name: 'Annuïtair € 250.000',
      principal: 250_000,
      annualRate: 3.8,
    },
    {
      ...combination.loanParts[0]!,
      id: interestOnlyId,
      name: 'Aflossingsvrij € 100.000',
      type: 'interestOnly',
      principal: 100_000,
      annualRate: 4.2,
      deductible: false,
      interestOnlyEndBalance: 0,
    },
  ]
  combination.extraPayments = [
    {
      id: crypto.randomUUID(),
      name: 'Jaarlijks aflossen aflossingsvrij',
      loanPartId: interestOnlyId,
      amount: 5_000,
      frequency: 'yearly',
      startDate: combination.startDate,
      annualIncreasePercentage: 0,
      effect: 'interestOnly',
      priority: 'interestOnly',
      manualPriority: [],
    },
  ]

  const rateChange = clone(base)
  rateChange.id = crypto.randomUUID()
  rateChange.name = 'Rente na tien jaar naar 5%'
  rateChange.loanParts[0]!.annualRate = 3.5
  rateChange.loanParts[0]!.interestChanges = [
    {
      id: crypto.randomUUID(),
      effectiveDate: `${Number(rateChange.startDate.slice(0, 4)) + 10}-01-01`,
      annualRate: 5,
      strategy: 'keepTerm',
    },
  ]
  return [base, extra, combination, rateChange]
}
