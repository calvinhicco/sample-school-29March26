/** First day of a calendar month (month is 1–12). */
export function getStartOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1)
}

/** First day of a term (period 1–3). */
export function getStartOfTerm(year: number, termPeriod: number): Date {
  const termStartMonths: Record<number, number> = { 1: 0, 2: 4, 3: 8 }
  const startMonth = termStartMonths[termPeriod] ?? 0
  return new Date(year, startMonth, 1)
}
