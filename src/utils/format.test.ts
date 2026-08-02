import { describe, expect, it } from 'vitest'
import { formatAxisCurrency } from './format'

describe('grafiekasnotatie', () => {
  it('behoudt waarden onder duizend als eurobedrag', () => {
    expect(formatAxisCurrency(0)).toBe('€ 0')
    expect(formatAxisCurrency(500)).toBe('€ 500')
  })

  it('behoudt halve en kwart duizendtallen', () => {
    expect(formatAxisCurrency(1500)).toBe('€ 1,5k')
    expect(formatAxisCurrency(2500)).toBe('€ 2,5k')
    expect(formatAxisCurrency(1250)).toBe('€ 1,25k')
  })
})
