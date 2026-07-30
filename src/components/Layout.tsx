import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useMortgageStore } from '../store/useMortgageStore'

const navigation: ReadonlyArray<readonly [string, string, string]> = [
  ['/', 'Overzicht', '⌂'],
  ['/berekening', 'Berekening', '✎'],
  ['/maanden', 'Maanden', '≡'],
  ['/jaren', 'Jaren', '▦'],
  ['/grafieken', 'Grafieken', '⌁'],
  ['/vergelijken', 'Vergelijken', '⇄'],
  ['/export', 'Import & export', '⇩'],
  ['/instellingen', 'Instellingen', '⚙'],
  ['/uitleg', 'Uitleg', '?'],
]

export function Layout() {
  const { scenarios, activeScenarioId, setActiveScenario, theme, toggleTheme } =
    useMortgageStore()
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery) return

    const updateSystemTheme = (event: MediaQueryListEvent | MediaQueryList) =>
      setSystemTheme(event.matches ? 'dark' : 'light')

    updateSystemTheme(mediaQuery)
    mediaQuery.addEventListener('change', updateSystemTheme)
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  const activeTheme = theme === 'system' ? systemTheme : theme
  const nextTheme = theme === 'system' ? 'licht' : theme === 'light' ? 'donker' : 'systeem'

  return (
    <div className="app" data-theme={activeTheme}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <strong>Hypotheekplanner</strong>
            <small>Inzicht voor thuis</small>
          </div>
        </div>
        <nav aria-label="Hoofdnavigatie">
          {navigation.map(([path, label, icon]) => (
            <NavLink key={path} to={path} end={path === '/'}>
              <span aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>100% lokaal</strong>
          <span>Je financiële gegevens verlaten deze browser niet.</span>
        </div>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <label className="scenario-picker">
            <span>Actief scenario</span>
            <select
              value={activeScenarioId}
              onChange={(event) => setActiveScenario(event.target.value)}
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={`Kleurmodus: ${theme}. Wissel naar ${nextTheme}`}
            title={`Kleurmodus: ${theme === 'system' ? 'systeem' : theme}. Klik voor ${nextTheme}`}
          >
            {theme === 'system' ? '◐' : theme === 'light' ? '☀' : '☾'}
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
