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
