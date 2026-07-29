import { useMemo } from 'react'
import { calculateScenario } from '../calculation/schedules/generateSchedule'
import { useMortgageStore } from '../store/useMortgageStore'

export function useActiveScenario() {
  const scenarios = useMortgageStore((state) => state.scenarios)
  const activeScenarioId = useMortgageStore((state) => state.activeScenarioId)
  const scenario = scenarios.find((item) => item.id === activeScenarioId) ?? scenarios[0]
  const result = useMemo(() => (scenario ? calculateScenario(scenario) : undefined), [scenario])
  return { scenario, result }
}
