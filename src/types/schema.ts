import { z } from 'zod'

const nonNegative = z.number().min(0, 'Voer een bedrag van nul of hoger in.')
const percentage = z.number().min(0).max(100, 'Een percentage mag maximaal 100 zijn.')

export const loanPartSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Geef het leningdeel een naam.'),
  type: z.enum(['annuity', 'linear', 'interestOnly']),
  principal: z.number().positive('De hoofdsom moet groter zijn dan nul.'),
  startDate: z.string().date(),
  termYears: z.number().int().min(1).max(60),
  annualRate: percentage,
  fixedRateYears: z.number().int().min(1).max(60).optional(),
  fixedRateEndDate: z.union([z.string().date(), z.literal('')]).optional(),
  paymentFrequency: z.literal('monthly'),
  closingCosts: nonNegative,
  deductible: z.boolean(),
  interestOnlyEndBalance: nonNegative,
  linkedProvision: z.string().optional(),
  notes: z.string().optional(),
  interestChanges: z.array(
    z.object({
      id: z.string(),
      effectiveDate: z.string().date(),
      annualRate: percentage,
      strategy: z.enum(['keepTerm', 'keepPayment']),
    }),
  ),
})

export const scenarioSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string(),
    name: z.string().min(1, 'Geef het scenario een naam.'),
    purchasePrice: nonNegative,
    marketValue: nonNegative,
    wozValue: nonNegative,
    ownFunds: nonNegative,
    buyerCosts: nonNegative,
    financedCosts: nonNegative,
    desiredLoan: z.number().positive(),
    startDate: z.string().date(),
    termYears: z.number().int().min(1).max(60),
    expectedSaleDate: z.string().optional(),
    annualPropertyGrowth: z.number().min(-100).max(100),
    grossAnnualIncome: nonNegative,
    partnerIncome: nonNegative,
    taxableIncome: nonNegative,
    tax: z.object({
      taxYear: z.number().int().min(2000).max(2100),
      marginalTaxRate: z.number().min(0).max(1),
      mortgageInterestDeductionRate: z.number().min(0).max(1),
      imputedRentalValueRate: z.number().min(0).max(1),
      imputedRentalValueLimit: nonNegative,
      maxAnnualTaxBenefit: nonNegative,
      deductionRestrictionRate: z.number().min(0).max(1),
      monthlyProvisionalRefund: z.boolean(),
      fiscalPartner: z.boolean(),
      partnerDeductionShare: z.number().min(0).max(1),
    }),
    loanParts: z.array(loanPartSchema).min(1),
    extraPayments: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        loanPartId: z.string().optional(),
        amount: nonNegative,
        percentageOfOriginal: percentage.optional(),
        frequency: z.enum(['once', 'monthly', 'yearly']),
        startDate: z.string().date(),
        endDate: z.string().optional(),
        annualIncreasePercentage: percentage,
        effect: z.enum(['shortenTerm', 'lowerPayment', 'interestOnly']),
        priority: z.enum(['specified', 'highestRate', 'interestOnly', 'manual']),
        manualPriority: z.array(z.string()),
      }),
    ),
    freeRepaymentPercentage: percentage,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .superRefine((scenario, context) => {
    for (const part of scenario.loanParts) {
      const sorted = [...part.interestChanges].sort((a, b) =>
        a.effectiveDate.localeCompare(b.effectiveDate),
      )
      if (sorted.some((change, index) => index > 0 && change.effectiveDate === sorted[index - 1]?.effectiveDate)) {
        context.addIssue({
          code: 'custom',
          message: `Rentewijzigingen van ${part.name} moeten unieke, chronologische datums hebben.`,
        })
      }
      if (part.fixedRateEndDate && part.fixedRateEndDate <= part.startDate) {
        context.addIssue({
          code: 'custom',
          message: `De rentevaste einddatum van ${part.name} moet na de startdatum liggen.`,
        })
      }
      for (const change of sorted) {
        if (change.effectiveDate <= part.startDate) {
          context.addIssue({
            code: 'custom',
            message: `Een rentewijziging van ${part.name} moet na de startdatum liggen.`,
          })
        }
      }
    }
  })
