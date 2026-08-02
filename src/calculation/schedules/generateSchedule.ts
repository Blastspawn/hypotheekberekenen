import Decimal from 'decimal.js'
import type {
  AnnualSummary,
  LoanPart,
  Scenario,
  ScenarioResult,
  ScheduleRow,
} from '../../types/mortgage'
import { addMonths } from '../../utils/date'
import { annuityPayment, monthlyRate } from '../mortgage/payment'
import { calculateMonthlyTaxBenefit } from '../tax/calculateTax'
import { extraPaymentForMonth } from './extraPayments'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

const n = (value: Decimal) => value.toDecimalPlaces(10).toNumber()

interface PartState {
  balance: Decimal
  payment: Decimal
  rate: number
  cumulativeInterest: Decimal
  cumulativePrincipal: Decimal
  cumulativeExtra: Decimal
  cumulativeTax: Decimal
  cumulativeNetCost: Decimal
}

function activeRate(part: LoanPart, date: string): { rate: number; changed: boolean } {
  const changes = [...part.interestChanges].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate),
  )
  let rate = part.annualRate
  let changed = false
  for (const change of changes) {
    if (change.effectiveDate.slice(0, 7) <= date.slice(0, 7)) {
      rate = change.annualRate
      changed = change.effectiveDate.slice(0, 7) === date.slice(0, 7)
    }
  }
  return { rate, changed }
}

function scheduledPayment(
  part: LoanPart,
  state: PartState,
  remainingMonths: number,
): Decimal {
  if (part.type === 'annuity') return annuityPayment(state.balance, state.rate, remainingMonths)
  if (part.type === 'linear') return state.balance.div(Math.max(remainingMonths, 1))
  return new Decimal(0)
}

function generatePartRows(
  scenario: Scenario,
  part: LoanPart,
  totalPrincipal: Decimal,
): ScheduleRow[] {
  const contractualMonths = part.termYears * 12
  const initialRate = activeRate(part, part.startDate).rate
  const state: PartState = {
    balance: new Decimal(part.principal),
    payment: part.type === 'annuity' ? annuityPayment(part.principal, initialRate, contractualMonths) : new Decimal(0),
    rate: initialRate,
    cumulativeInterest: new Decimal(0),
    cumulativePrincipal: new Decimal(0),
    cumulativeExtra: new Decimal(0),
    cumulativeTax: new Decimal(0),
    cumulativeNetCost: new Decimal(0),
  }
  const rows: ScheduleRow[] = []
  const maximumMonths = Math.max(contractualMonths + 600, 600)

  for (let index = 0; index < maximumMonths && state.balance.gt(0); index += 1) {
    const date = addMonths(part.startDate, index)
    const remainingMonths = Math.max(contractualMonths - index, 1)
    const rateInfo = activeRate(part, date)
    if (rateInfo.rate !== state.rate) {
      state.rate = rateInfo.rate
      const change = part.interestChanges.find(
        (item) => item.effectiveDate.slice(0, 7) === date.slice(0, 7),
      )
      if (!change || change.strategy === 'keepTerm') {
        state.payment = scheduledPayment(part, state, remainingMonths)
      }
    }
    const opening = state.balance
    const interest = opening.mul(monthlyRate(state.rate))
    let regularPrincipal = new Decimal(0)
    if (part.type === 'annuity') regularPrincipal = Decimal.max(state.payment.minus(interest), 0)
    if (part.type === 'linear') regularPrincipal = new Decimal(part.principal).div(contractualMonths)
    if (index === contractualMonths - 1 && part.type !== 'interestOnly') regularPrincipal = opening
    const desiredEndBalance =
      part.type === 'interestOnly' ? new Decimal(part.interestOnlyEndBalance) : new Decimal(0)
    const repayable = Decimal.max(opening.minus(desiredEndBalance), 0)
    regularPrincipal = Decimal.min(regularPrincipal, repayable)
    const extra = extraPaymentForMonth(scenario.extraPayments, part, date)
    const extraPrincipal = Decimal.min(extra.amount, Decimal.max(repayable.minus(regularPrincipal), 0))
    const totalPrincipalPayment = regularPrincipal.plus(extraPrincipal)
    state.balance = Decimal.max(opening.minus(totalPrincipalPayment), desiredEndBalance)
    const grossPayment = interest.plus(regularPrincipal)
    const deductibleInterest = part.deductible ? interest : new Decimal(0)
    const tax = calculateMonthlyTaxBenefit({
      deductibleInterest,
      wozValue: scenario.wozValue,
      loanShare: new Decimal(part.principal).div(totalPrincipal),
      settings: scenario.tax,
    })
    const netPayment = grossPayment.minus(tax.benefit)
    const totalCashOut = grossPayment.plus(extraPrincipal).minus(
      scenario.tax.monthlyProvisionalRefund ? tax.benefit : 0,
    )
    state.cumulativeInterest = state.cumulativeInterest.plus(interest)
    state.cumulativePrincipal = state.cumulativePrincipal.plus(totalPrincipalPayment)
    state.cumulativeExtra = state.cumulativeExtra.plus(extraPrincipal)
    state.cumulativeTax = state.cumulativeTax.plus(tax.benefit)
    state.cumulativeNetCost = state.cumulativeNetCost.plus(interest).minus(tax.benefit)

    rows.push({
      month: index + 1,
      date,
      calendarYear: Number(date.slice(0, 4)),
      loanPartId: part.id,
      loanPartName: part.name,
      mortgageType: part.type,
      openingBalance: n(opening),
      annualRate: state.rate,
      grossPayment: n(grossPayment),
      interest: n(interest),
      regularPrincipal: n(regularPrincipal),
      extraPrincipal: n(extraPrincipal),
      totalPrincipal: n(totalPrincipalPayment),
      closingBalance: n(state.balance),
      deductibleInterest: n(deductibleInterest),
      nonDeductibleInterest: n(interest.minus(deductibleInterest)),
      imputedRentalValue: n(tax.imputedRentalValue),
      taxBenefit: n(tax.benefit),
      netPayment: n(netPayment),
      totalCashOut: n(totalCashOut),
      cumulativeInterest: n(state.cumulativeInterest),
      cumulativePrincipal: n(state.cumulativePrincipal),
      cumulativeExtraPrincipal: n(state.cumulativeExtra),
      cumulativeTaxBenefit: n(state.cumulativeTax),
      cumulativeNetCost: n(state.cumulativeNetCost),
    })
    if (extra.effect === 'lowerPayment' && extraPrincipal.gt(0)) {
      state.payment = scheduledPayment(part, state, Math.max(contractualMonths - index - 1, 1))
    }
    if (part.type === 'interestOnly' && index + 1 >= contractualMonths) break
  }
  return rows
}

function annualSummaries(scenario: Scenario, rows: ScheduleRow[]): AnnualSummary[] {
  const years = [...new Set(rows.map((row) => row.calendarYear))]
  let cumulativeNetCost = 0
  return years.map((year, yearIndex) => {
    const yearRows = rows.filter((row) => row.calendarYear === year)
    const dates = [...new Set(yearRows.map((row) => row.date))]
    const total = (key: keyof ScheduleRow) =>
      yearRows.reduce((sum, row) => sum + Number(row[key]), 0)
    const closingBalance = scenario.loanParts.reduce((sum, part) => {
      const last = yearRows.filter((row) => row.loanPartId === part.id).at(-1)
      if (last) return sum + last.closingBalance
      const started = part.startDate.slice(0, 4) <= String(year)
      return sum + (started ? 0 : part.principal)
    }, 0)
    const propertyValue = scenario.marketValue * (1 + scenario.annualPropertyGrowth / 100) ** yearIndex
    const interest = total('interest')
    const tax = total('taxBenefit')
    cumulativeNetCost += interest - tax
    return {
      year,
      averageGrossPayment: total('grossPayment') / Math.max(dates.length, 1),
      averageNetPayment: (total('grossPayment') - tax) / Math.max(dates.length, 1),
      totalInterest: interest,
      regularPrincipal: total('regularPrincipal'),
      extraPrincipal: total('extraPrincipal'),
      taxBenefit: tax,
      closingBalance,
      estimatedPropertyValue: propertyValue,
      loanToValue: propertyValue > 0 ? closingBalance / propertyValue : 0,
      equity: propertyValue - closingBalance,
      cumulativeNetCost,
    }
  })
}

export function calculateScenario(scenario: Scenario): ScenarioResult {
  const totalPrincipal = scenario.loanParts.reduce(
    (sum, part) => sum.plus(part.principal),
    new Decimal(0),
  )
  const rows = scenario.loanParts
    .flatMap((part) => generatePartRows(scenario, part, totalPrincipal))
    .sort((a, b) => a.date.localeCompare(b.date) || a.loanPartName.localeCompare(b.loanPartName))
  const annual = annualSummaries(scenario, rows)
  const dates = [...new Set(rows.map((row) => row.date))]
  const monthlyTotals = dates.map((date) =>
    rows
      .filter((row) => row.date === date)
      .reduce(
        (sum, row) => ({
          gross: sum.gross + row.grossPayment,
          net: sum.net + row.netPayment,
          cash: sum.cash + row.totalCashOut,
        }),
        { gross: 0, net: 0, cash: 0 },
      ),
  )
  const sum = (key: keyof ScheduleRow) => rows.reduce((total, row) => total + Number(row[key]), 0)
  const lastDate = rows.at(-1)?.date ?? scenario.startDate
  const remainingBalance = scenario.loanParts.reduce((total, part) => {
    const last = rows.filter((row) => row.loanPartId === part.id).at(-1)
    return total + (last?.closingBalance ?? part.principal)
  }, 0)
  const lastAnnual = annual.at(-1)
  const warnings: string[] = []
  if (scenario.loanParts.some((part) => part.type === 'interestOnly' && part.interestOnlyEndBalance > 0)) {
    warnings.push('Aan het einde blijft een aflossingsvrije restschuld bestaan.')
  }
  if (Math.abs(totalPrincipal.toNumber() - scenario.desiredLoan) > 0.01) {
    warnings.push('De som van de leningdelen wijkt af van de gewenste totale lening.')
  }
  for (const part of scenario.loanParts) {
    if (!part.fixedRateEndDate) continue
    const partEndDate = rows.filter((row) => row.loanPartId === part.id).at(-1)?.date
    const hasRateAtFixedEnd = part.interestChanges.some(
      (change) => change.effectiveDate.slice(0, 7) === part.fixedRateEndDate?.slice(0, 7),
    )
    if (partEndDate && part.fixedRateEndDate <= partEndDate && !hasRateAtFixedEnd) {
      warnings.push(
        `Voor ${part.name} ontbreekt een nieuw rentepercentage vanaf ${part.fixedRateEndDate}. Totdat je dit toevoegt, blijft ${part.annualRate}% als rekenaanname gelden.`,
      )
    }
  }
  return {
    scenarioId: scenario.id,
    rows,
    annual,
    initialPrincipal: totalPrincipal.toNumber(),
    firstGrossPayment: monthlyTotals[0]?.gross ?? 0,
    firstNetPayment: monthlyTotals[0]?.net ?? 0,
    averageGrossPayment:
      monthlyTotals.reduce((total, month) => total + month.gross, 0) / Math.max(monthlyTotals.length, 1),
    averageNetPayment:
      monthlyTotals.reduce((total, month) => total + month.net, 0) / Math.max(monthlyTotals.length, 1),
    highestPayment: Math.max(0, ...monthlyTotals.map((month) => month.gross)),
    totalInterest: sum('interest'),
    totalTaxBenefit: sum('taxBenefit'),
    totalRegularPrincipal: sum('regularPrincipal'),
    totalExtraPrincipal: sum('extraPrincipal'),
    totalCashOut: monthlyTotals.reduce((total, month) => total + month.cash, 0),
    remainingBalance,
    endDate: lastDate,
    estimatedEquity: lastAnnual?.equity ?? scenario.marketValue - remainingBalance,
    warnings,
  }
}
