import Decimal from 'decimal.js'
import type { TaxSettings } from '../../types/mortgage'

export interface MonthlyTaxInput {
  deductibleInterest: Decimal
  wozValue: number
  loanShare: Decimal
  settings: TaxSettings
}

export function calculateMonthlyTaxBenefit(input: MonthlyTaxInput): {
  imputedRentalValue: Decimal
  benefit: Decimal
} {
  const { settings } = input
  const cappedWoz = Decimal.min(input.wozValue, settings.imputedRentalValueLimit)
  const imputedRentalValue = cappedWoz
    .mul(settings.imputedRentalValueRate)
    .div(12)
    .mul(input.loanShare)
  const deductibleBase = Decimal.max(input.deductibleInterest.minus(imputedRentalValue), 0)
  const effectiveRate = Decimal.min(
    settings.marginalTaxRate,
    settings.mortgageInterestDeductionRate,
  ).mul(settings.deductionRestrictionRate)
  const benefit = Decimal.min(
    deductibleBase.mul(effectiveRate),
    new Decimal(settings.maxAnnualTaxBenefit).div(12).mul(input.loanShare),
    input.deductibleInterest,
  )
  return { imputedRentalValue, benefit: Decimal.max(benefit, 0) }
}
