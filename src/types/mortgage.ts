export const mortgageTypes = ['annuity', 'linear', 'interestOnly'] as const
export type MortgageType = (typeof mortgageTypes)[number]
export type ExtraPaymentEffect = 'shortenTerm' | 'lowerPayment' | 'interestOnly'
export type PaymentFrequency = 'monthly'

export interface InterestChange {
  id: string
  effectiveDate: string
  annualRate: number
  strategy: 'keepTerm' | 'keepPayment'
}

export interface LoanPart {
  id: string
  name: string
  type: MortgageType
  principal: number
  startDate: string
  termYears: number
  annualRate: number
  /** Alleen behouden voor compatibiliteit met scenario's uit een oudere versie. */
  fixedRateYears?: number
  fixedRateEndDate?: string
  paymentFrequency: PaymentFrequency
  closingCosts: number
  deductible: boolean
  interestOnlyEndBalance: number
  linkedProvision?: string
  notes?: string
  interestChanges: InterestChange[]
}

export type ExtraPaymentFrequency = 'once' | 'monthly' | 'yearly'
export interface ExtraPayment {
  id: string
  name: string
  loanPartId?: string
  amount: number
  percentageOfOriginal?: number
  frequency: ExtraPaymentFrequency
  startDate: string
  endDate?: string
  annualIncreasePercentage: number
  effect: ExtraPaymentEffect
  priority: 'specified' | 'highestRate' | 'interestOnly' | 'manual'
  manualPriority: string[]
}

export interface TaxSettings {
  taxYear: number
  marginalTaxRate: number
  mortgageInterestDeductionRate: number
  imputedRentalValueRate: number
  imputedRentalValueLimit: number
  maxAnnualTaxBenefit: number
  deductionRestrictionRate: number
  monthlyProvisionalRefund: boolean
  fiscalPartner: boolean
  partnerDeductionShare: number
}

export interface Scenario {
  schemaVersion: 1
  id: string
  name: string
  purchasePrice: number
  marketValue: number
  wozValue: number
  ownFunds: number
  buyerCosts: number
  financedCosts: number
  desiredLoan: number
  startDate: string
  termYears: number
  expectedSaleDate?: string
  annualPropertyGrowth: number
  grossAnnualIncome: number
  partnerIncome: number
  taxableIncome: number
  tax: TaxSettings
  loanParts: LoanPart[]
  extraPayments: ExtraPayment[]
  freeRepaymentPercentage: number
  createdAt: string
  updatedAt: string
}

export interface ScheduleRow {
  month: number
  date: string
  calendarYear: number
  loanPartId: string
  loanPartName: string
  mortgageType: MortgageType
  openingBalance: number
  annualRate: number
  grossPayment: number
  interest: number
  regularPrincipal: number
  extraPrincipal: number
  totalPrincipal: number
  closingBalance: number
  deductibleInterest: number
  nonDeductibleInterest: number
  imputedRentalValue: number
  taxBenefit: number
  netPayment: number
  totalCashOut: number
  cumulativeInterest: number
  cumulativePrincipal: number
  cumulativeExtraPrincipal: number
  cumulativeTaxBenefit: number
  cumulativeNetCost: number
}

export interface AnnualSummary {
  year: number
  averageGrossPayment: number
  averageNetPayment: number
  totalInterest: number
  regularPrincipal: number
  extraPrincipal: number
  taxBenefit: number
  closingBalance: number
  estimatedPropertyValue: number
  loanToValue: number
  equity: number
  cumulativeNetCost: number
}

export interface ScenarioResult {
  scenarioId: string
  rows: ScheduleRow[]
  annual: AnnualSummary[]
  initialPrincipal: number
  firstGrossPayment: number
  firstNetPayment: number
  averageGrossPayment: number
  averageNetPayment: number
  highestPayment: number
  totalInterest: number
  totalTaxBenefit: number
  totalRegularPrincipal: number
  totalExtraPrincipal: number
  totalCashOut: number
  remainingBalance: number
  endDate: string
  estimatedEquity: number
  warnings: string[]
}
