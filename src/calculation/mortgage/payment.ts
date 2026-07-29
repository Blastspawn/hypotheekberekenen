import Decimal from 'decimal.js'

export function monthlyRate(annualPercentage: number): Decimal {
  return new Decimal(annualPercentage).div(100).div(12)
}

export function annuityPayment(
  principal: Decimal.Value,
  annualPercentage: number,
  months: number,
): Decimal {
  const balance = new Decimal(principal)
  if (months <= 0 || balance.lte(0)) return new Decimal(0)
  const rate = monthlyRate(annualPercentage)
  if (rate.isZero()) return balance.div(months)
  return balance.mul(rate).div(new Decimal(1).minus(new Decimal(1).plus(rate).pow(-months)))
}
