const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

export const formatCurrency = (value: number) => euroFormatter.format(value)
export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
export const formatPercentage = (value: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: 2,
  }).format(value)

/** Houdt tussenliggende aswaarden zichtbaar, bijvoorbeeld € 500 en € 1,5k. */
export const formatAxisCurrency = (value: number) => {
  if (Math.abs(value) < 1000) {
    return `€ ${new Intl.NumberFormat('nl-NL', {
      maximumFractionDigits: 0,
    }).format(value)}`
  }

  return `€ ${new Intl.NumberFormat('nl-NL', {
    maximumFractionDigits: 2,
  }).format(value / 1000)}k`
}
