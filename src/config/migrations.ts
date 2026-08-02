import type { Scenario } from '../types/mortgage'
import { addMonths } from '../utils/date'

/** Zet oudere gehele rentevaste jaren eenmalig om naar een exacte contractdatum. */
export function normalizeScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    loanParts: scenario.loanParts.map((part) => ({
      ...part,
      fixedRateEndDate:
        part.fixedRateEndDate ||
        (part.fixedRateYears ? addMonths(part.startDate, part.fixedRateYears * 12) : ''),
      interestChanges: part.interestChanges ?? [],
    })),
  }
}
