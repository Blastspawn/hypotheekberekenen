export function addMonths(isoDate: string, months: number): string {
  const [year = 1970, month = 1, day = 1] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1 + months, day))
  return date.toISOString().slice(0, 10)
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function monthsBetween(start: string, end: string): number {
  const [sy = 0, sm = 1] = start.split('-').map(Number)
  const [ey = 0, em = 1] = end.split('-').map(Number)
  return (ey - sy) * 12 + em - sm
}

export function formatMonth(isoDate: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`))
}
