import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { defaultTaxSettings } from '../../config/defaults'
import { calculateMonthlyTaxBenefit } from './calculateTax'

describe('fiscale berekening', () => {
  it('trekt eigenwoningforfait af en begrenst het voordeel', () => {
    const result = calculateMonthlyTaxBenefit({
      deductibleInterest: new Decimal(1000),
      wozValue: 350_000,
      loanShare: new Decimal(1),
      settings: defaultTaxSettings,
    })
    expect(result.imputedRentalValue.toNumber()).toBeCloseTo(102.0833, 3)
    expect(result.benefit.toNumber()).toBeGreaterThan(0)
    expect(result.benefit.lte(1000)).toBe(true)
  })

  it('levert nooit een negatief voordeel', () => {
    const result = calculateMonthlyTaxBenefit({
      deductibleInterest: new Decimal(10),
      wozValue: 1_000_000,
      loanShare: new Decimal(1),
      settings: defaultTaxSettings,
    })
    expect(result.benefit.toNumber()).toBe(0)
  })
})
