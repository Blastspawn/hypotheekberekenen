import Decimal from 'decimal.js'
import type { ExtraPayment, LoanPart } from '../../types/mortgage'
import { monthsBetween, monthKey } from '../../utils/date'

function isDue(payment: ExtraPayment, date: string): boolean {
  const current = monthKey(date)
  const start = monthKey(payment.startDate)
  if (current < start || (payment.endDate && current > monthKey(payment.endDate))) return false
  const elapsed = monthsBetween(payment.startDate, date)
  if (payment.frequency === 'once') return elapsed === 0
  if (payment.frequency === 'yearly') return elapsed >= 0 && elapsed % 12 === 0
  return elapsed >= 0
}

export function extraPaymentForMonth(
  payments: ExtraPayment[],
  loanPart: LoanPart,
  date: string,
): { amount: Decimal; effect: ExtraPayment['effect'] } {
  let amount = new Decimal(0)
  let effect: ExtraPayment['effect'] = 'shortenTerm'
  for (const payment of payments) {
    if (payment.loanPartId && payment.loanPartId !== loanPart.id) continue
    if (!isDue(payment, date)) continue
    const elapsedYears = Math.floor(monthsBetween(payment.startDate, date) / 12)
    const increaseFactor = new Decimal(1)
      .plus(new Decimal(payment.annualIncreasePercentage).div(100))
      .pow(elapsedYears)
    const base = payment.percentageOfOriginal
      ? new Decimal(loanPart.principal).mul(payment.percentageOfOriginal).div(100)
      : new Decimal(payment.amount)
    amount = amount.plus(base.mul(increaseFactor))
    effect = payment.effect
  }
  return { amount, effect }
}
