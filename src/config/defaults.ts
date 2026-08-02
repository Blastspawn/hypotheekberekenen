import type { Scenario, TaxSettings } from '../types/mortgage'
import { addMonths } from '../utils/date'

export const defaultTaxSettings: TaxSettings = {
  taxYear: 2026,
  marginalTaxRate: 0.3575,
  mortgageInterestDeductionRate: 0.3575,
  imputedRentalValueRate: 0.0035,
  imputedRentalValueLimit: 1_350_000,
  maxAnnualTaxBenefit: 100_000,
  deductionRestrictionRate: 1,
  monthlyProvisionalRefund: true,
  fiscalPartner: false,
  partnerDeductionShare: 0.5,
}

export const taxDisclaimer =
  'Indicatieve berekening op basis van handmatig instelbare aannames. Dit is geen financieel of fiscaal advies.'

const isoNow = () => new Date().toISOString()
const id = () => crypto.randomUUID()

export function createDefaultScenario(): Scenario {
  const now = isoNow()
  const startDate = `${new Date().getFullYear()}-01-01`
  return {
    schemaVersion: 1,
    id: id(),
    name: 'Standaard annuïtair',
    purchasePrice: 350_000,
    marketValue: 350_000,
    wozValue: 350_000,
    ownFunds: 25_000,
    buyerCosts: 14_000,
    financedCosts: 0,
    desiredLoan: 350_000,
    startDate,
    termYears: 30,
    annualPropertyGrowth: 2,
    grossAnnualIncome: 75_000,
    partnerIncome: 0,
    taxableIncome: 75_000,
    tax: { ...defaultTaxSettings },
    loanParts: [
      {
        id: id(),
        name: 'Annuïtair leningdeel',
        type: 'annuity',
        principal: 350_000,
        startDate,
        termYears: 30,
        annualRate: 4,
        fixedRateEndDate: addMonths(startDate, 120),
        paymentFrequency: 'monthly',
        closingCosts: 0,
        deductible: true,
        interestOnlyEndBalance: 0,
        interestChanges: [],
      },
    ],
    extraPayments: [],
    freeRepaymentPercentage: 10,
    createdAt: now,
    updatedAt: now,
  }
}
