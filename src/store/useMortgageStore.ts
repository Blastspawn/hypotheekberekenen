import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createExampleScenarios } from '../config/examples'
import type { Scenario } from '../types/mortgage'

interface MortgageState {
  scenarios: Scenario[]
  activeScenarioId: string
  theme: 'system' | 'light' | 'dark'
  setActiveScenario: (id: string) => void
  saveScenario: (scenario: Scenario) => void
  duplicateScenario: (id: string) => void
  deleteScenario: (id: string) => void
  importScenarios: (scenarios: Scenario[]) => void
  clearAll: () => void
  toggleTheme: () => void
}

const examples = createExampleScenarios()

export const useMortgageStore = create<MortgageState>()(
  persist(
    (set) => ({
      scenarios: examples,
      activeScenarioId: examples[0]!.id,
      theme: 'system',
      setActiveScenario: (activeScenarioId) => set({ activeScenarioId }),
      saveScenario: (scenario) =>
        set((state) => ({
          scenarios: state.scenarios.some((item) => item.id === scenario.id)
            ? state.scenarios.map((item) => (item.id === scenario.id ? scenario : item))
            : [...state.scenarios, scenario],
          activeScenarioId: scenario.id,
        })),
      duplicateScenario: (id) =>
        set((state) => {
          const source = state.scenarios.find((scenario) => scenario.id === id)
          if (!source) return state
          const copy = structuredClone(source)
          copy.id = crypto.randomUUID()
          copy.name = `${copy.name} (kopie)`
          copy.createdAt = new Date().toISOString()
          copy.updatedAt = copy.createdAt
          return { scenarios: [...state.scenarios, copy], activeScenarioId: copy.id }
        }),
      deleteScenario: (id) =>
        set((state) => {
          if (state.scenarios.length <= 1) return state
          const scenarios = state.scenarios.filter((scenario) => scenario.id !== id)
          return {
            scenarios,
            activeScenarioId:
              state.activeScenarioId === id ? scenarios[0]!.id : state.activeScenarioId,
          }
        }),
      importScenarios: (scenarios) =>
        set({ scenarios, activeScenarioId: scenarios[0]?.id ?? '' }),
      clearAll: () => {
        const fresh = createExampleScenarios()
        set({ scenarios: fresh, activeScenarioId: fresh[0]!.id })
      },
      toggleTheme: () =>
        set((state) => ({
          theme:
            state.theme === 'system' ? 'light' : state.theme === 'light' ? 'dark' : 'system',
        })),
    }),
    { name: 'hypotheekplanner-v1', version: 1 },
  ),
)
