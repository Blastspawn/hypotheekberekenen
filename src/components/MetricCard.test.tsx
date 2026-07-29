import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MetricCard } from './MetricCard'

describe('MetricCard', () => {
  it('toont label, bedrag en toelichting', () => {
    render(<MetricCard label="Totale hypotheek" value="€ 350.000,00" detail="Een leningdeel" icon="€" />)
    expect(screen.getByText('Totale hypotheek')).toBeInTheDocument()
    expect(screen.getByText('€ 350.000,00')).toBeInTheDocument()
  })
})
