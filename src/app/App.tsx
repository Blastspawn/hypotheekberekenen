import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { AnnualPage } from '../pages/AnnualPage'
import { CalculationPage } from '../pages/CalculationPage'
import { ChartsPage } from '../pages/ChartsPage'
import { ComparePage } from '../pages/ComparePage'
import { DashboardPage } from '../pages/DashboardPage'
import { ExportPage } from '../pages/ExportPage'
import { HelpPage } from '../pages/HelpPage'
import { MonthlyPage } from '../pages/MonthlyPage'
import { SettingsPage } from '../pages/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="berekening" element={<CalculationPage />} />
          <Route path="maanden" element={<MonthlyPage />} />
          <Route path="jaren" element={<AnnualPage />} />
          <Route path="grafieken" element={<ChartsPage />} />
          <Route path="vergelijken" element={<ComparePage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="instellingen" element={<SettingsPage />} />
          <Route path="uitleg" element={<HelpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
