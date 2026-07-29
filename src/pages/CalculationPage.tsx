import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { PageHeader } from '../components/PageHeader'
import { useActiveScenario } from '../hooks/useActiveScenario'
import { useMortgageStore } from '../store/useMortgageStore'
import type { Scenario } from '../types/mortgage'
import { scenarioSchema } from '../types/schema'
import { formatCurrency } from '../utils/format'

const numberValue = { valueAsNumber: true }

export function CalculationPage() {
  const { scenario } = useActiveScenario()
  const saveScenario = useMortgageStore((state) => state.saveScenario)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Scenario>({ resolver: zodResolver(scenarioSchema), defaultValues: scenario })
  const loans = useFieldArray({ control, name: 'loanParts' })
  const extras = useFieldArray({ control, name: 'extraPayments' })
  useEffect(() => reset(scenario), [scenario, reset])
  const values = useWatch({ control }) as Scenario
  const loanTotal = values.loanParts?.reduce((sum, part) => sum + (part.principal || 0), 0) ?? 0

  if (!scenario) return null
  const onSubmit = (data: Scenario) =>
    saveScenario({ ...data, updatedAt: new Date().toISOString() })

  return (
    <>
      <PageHeader
        eyebrow="Scenario-invoer"
        title="Je berekening opbouwen"
        description="Alle wijzigingen worden pas lokaal opgeslagen wanneer je op Opslaan en berekenen klikt."
        actions={
          <button className="button primary" form="scenario-form" type="submit">
            {isDirty ? 'Opslaan en berekenen' : 'Opnieuw berekenen'}
          </button>
        }
      />
      <form id="scenario-form" onSubmit={handleSubmit(onSubmit)} className="form-stack">
        {errors.root?.message && <div className="notice error">{errors.root.message}</div>}
        <section className="panel form-section">
          <div className="section-title"><span>01</span><div><h2>Woning & scenario</h2><p>De uitgangspunten van je aankoop en lening.</p></div></div>
          <div className="form-grid">
            <Field label="Naam scenario" error={errors.name?.message}><input {...register('name')} /></Field>
            <Field label="Startdatum" error={errors.startDate?.message}><input type="date" {...register('startDate')} /></Field>
            <Field label="Aankoopprijs"><input type="number" step="0.01" {...register('purchasePrice', numberValue)} /></Field>
            <Field label="Marktwaarde"><input type="number" step="0.01" {...register('marketValue', numberValue)} /></Field>
            <Field label="WOZ-waarde"><input type="number" step="0.01" {...register('wozValue', numberValue)} /></Field>
            <Field label="Eigen geld"><input type="number" step="0.01" {...register('ownFunds', numberValue)} /></Field>
            <Field label="Kosten koper"><input type="number" step="0.01" {...register('buyerCosts', numberValue)} /></Field>
            <Field label="Meegefinancierde kosten"><input type="number" step="0.01" {...register('financedCosts', numberValue)} /></Field>
            <Field label="Gewenste totale lening"><input type="number" step="0.01" {...register('desiredLoan', numberValue)} /></Field>
            <Field label="Looptijd (jaar)"><input type="number" {...register('termYears', numberValue)} /></Field>
            <Field label="Verwachte verkoopdatum"><input type="date" {...register('expectedSaleDate')} /></Field>
            <Field label="Woningwaardestijging per jaar (%)"><input type="number" step="0.1" {...register('annualPropertyGrowth', numberValue)} /></Field>
          </div>
        </section>

        <section className="panel form-section">
          <div className="section-title"><span>02</span><div><h2>Inkomen & fiscaliteit</h2><p>Configureerbare aannames; waarden worden niet extern opgehaald.</p></div></div>
          <div className="form-grid">
            <Field label="Bruto jaarinkomen"><input type="number" {...register('grossAnnualIncome', numberValue)} /></Field>
            <Field label="Inkomen fiscale partner"><input type="number" {...register('partnerIncome', numberValue)} /></Field>
            <Field label="Belastbaar inkomen"><input type="number" {...register('taxableIncome', numberValue)} /></Field>
            <Field label="Belastingjaar"><input type="number" {...register('tax.taxYear', numberValue)} /></Field>
            <Field label="Marginaal tarief (0–1)"><input type="number" step="0.0001" {...register('tax.marginalTaxRate', numberValue)} /></Field>
            <Field label="Max. renteaftrekpercentage (0–1)"><input type="number" step="0.0001" {...register('tax.mortgageInterestDeductionRate', numberValue)} /></Field>
            <Field label="Eigenwoningforfaitpercentage (0–1)"><input type="number" step="0.0001" {...register('tax.imputedRentalValueRate', numberValue)} /></Field>
            <Field label="WOZ-grens forfait"><input type="number" {...register('tax.imputedRentalValueLimit', numberValue)} /></Field>
            <Field label="Max. belastingvoordeel per jaar"><input type="number" {...register('tax.maxAnnualTaxBenefit', numberValue)} /></Field>
            <Field label="Aftrekbeperking factor (0–1)"><input type="number" step="0.01" {...register('tax.deductionRestrictionRate', numberValue)} /></Field>
          </div>
          <div className="check-row">
            <label><input type="checkbox" {...register('tax.monthlyProvisionalRefund')} /> Voorlopige teruggave maandelijks ontvangen</label>
            <label><input type="checkbox" {...register('tax.fiscalPartner')} /> Fiscale partner meenemen</label>
          </div>
        </section>

        <section className="panel form-section">
          <div className="section-title split">
            <span>03</span><div><h2>Leningdelen</h2><p>Som leningdelen: <strong>{formatCurrency(loanTotal)}</strong> · gewenst: {formatCurrency(values.desiredLoan || 0)}</p></div>
            <button className="button secondary" type="button" onClick={() => loans.append({
              id: crypto.randomUUID(), name: `Leningdeel ${loans.fields.length + 1}`, type: 'annuity',
              principal: 100_000, startDate: values.startDate, termYears: values.termYears, annualRate: 4,
              fixedRateYears: 10, paymentFrequency: 'monthly', closingCosts: 0, deductible: true,
              interestOnlyEndBalance: 0, interestChanges: [],
            })}>+ Leningdeel</button>
          </div>
          {Math.abs(loanTotal - (values.desiredLoan || 0)) > 0.01 && <div className="notice warning">De leningdelen wijken {formatCurrency(Math.abs(loanTotal - values.desiredLoan))} af van de gewenste lening.</div>}
          <div className="loan-list">
            {loans.fields.map((field, index) => (
              <article className="loan-card" key={field.id}>
                <div className="loan-card-head"><strong>Leningdeel {index + 1}</strong>{loans.fields.length > 1 && <button type="button" className="text-button danger" onClick={() => loans.remove(index)}>Verwijderen</button>}</div>
                <div className="form-grid">
                  <Field label="Naam"><input {...register(`loanParts.${index}.name`)} /></Field>
                  <Field label="Hypotheekvorm"><select {...register(`loanParts.${index}.type`)}><option value="annuity">Annuïtair</option><option value="linear">Lineair</option><option value="interestOnly">Aflossingsvrij</option></select></Field>
                  <Field label="Hoofdsom"><input type="number" {...register(`loanParts.${index}.principal`, numberValue)} /></Field>
                  <Field label="Startdatum"><input type="date" {...register(`loanParts.${index}.startDate`)} /></Field>
                  <Field label="Looptijd (jaar)"><input type="number" {...register(`loanParts.${index}.termYears`, numberValue)} /></Field>
                  <Field label="Nominale rente (%)"><input type="number" step="0.01" {...register(`loanParts.${index}.annualRate`, numberValue)} /></Field>
                  <Field label="Rentevast (jaar)"><input type="number" {...register(`loanParts.${index}.fixedRateYears`, numberValue)} /></Field>
                  <Field label="Afsluitkosten"><input type="number" {...register(`loanParts.${index}.closingCosts`, numberValue)} /></Field>
                  <Field label="Gewenst aflossingsvrij eindsaldo"><input type="number" {...register(`loanParts.${index}.interestOnlyEndBalance`, numberValue)} /></Field>
                  <Field label="Notities"><input {...register(`loanParts.${index}.notes`)} /></Field>
                </div>
                <label className="check"><input type="checkbox" {...register(`loanParts.${index}.deductible`)} /> Rente fiscaal aftrekbaar</label>
              </article>
            ))}
          </div>
        </section>

        <section className="panel form-section">
          <div className="section-title split">
            <span>04</span><div><h2>Extra aflossingen</h2><p>Eenmalig, maandelijks of jaarlijks; altijd begrensd op de restschuld.</p></div>
            <button className="button secondary" type="button" onClick={() => extras.append({
              id: crypto.randomUUID(), name: 'Extra aflossing', loanPartId: values.loanParts[0]?.id,
              amount: 250, frequency: 'monthly', startDate: values.startDate, annualIncreasePercentage: 0,
              effect: 'shortenTerm', priority: 'specified', manualPriority: [],
            })}>+ Extra aflossing</button>
          </div>
          {extras.fields.length === 0 && <div className="empty-state">Geen extra aflossingen ingesteld.</div>}
          {extras.fields.map((field, index) => (
            <article className="loan-card" key={field.id}>
              <div className="loan-card-head"><strong>{values.extraPayments[index]?.name ?? 'Extra aflossing'}</strong><button type="button" className="text-button danger" onClick={() => extras.remove(index)}>Verwijderen</button></div>
              <div className="form-grid">
                <Field label="Naam"><input {...register(`extraPayments.${index}.name`)} /></Field>
                <Field label="Leningdeel"><select {...register(`extraPayments.${index}.loanPartId`)}>{values.loanParts.map((part) => <option key={part.id} value={part.id}>{part.name}</option>)}</select></Field>
                <Field label="Bedrag"><input type="number" {...register(`extraPayments.${index}.amount`, numberValue)} /></Field>
                <Field label="Frequentie"><select {...register(`extraPayments.${index}.frequency`)}><option value="once">Eenmalig</option><option value="monthly">Maandelijks</option><option value="yearly">Jaarlijks</option></select></Field>
                <Field label="Vanaf"><input type="date" {...register(`extraPayments.${index}.startDate`)} /></Field>
                <Field label="Tot en met"><input type="date" {...register(`extraPayments.${index}.endDate`)} /></Field>
                <Field label="Jaarlijkse stijging (%)"><input type="number" {...register(`extraPayments.${index}.annualIncreasePercentage`, numberValue)} /></Field>
                <Field label="Effect"><select {...register(`extraPayments.${index}.effect`)}><option value="shortenTerm">Looptijd verkorten</option><option value="lowerPayment">Maandtermijn verlagen</option><option value="interestOnly">Alleen schuld/rente verlagen</option></select></Field>
              </div>
            </article>
          ))}
        </section>
        <div className="form-submit"><button className="button primary large" type="submit">Opslaan en berekenen</button></div>
      </form>
    </>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>
}
