import { BillingCycle, TERMS, type AppSettings, type BillingCycleType, type Student } from "@/types/school"
import { getBillingWindowStartMonth, getOutstandingWindowStart } from "./billingStart"
import { getStartOfMonth, getStartOfTerm } from "./dateUtils"

export { BillingCycle, type AppSettings, type BillingCycleType, type Student }

const HOLIDAY_MONTHS = new Set([4, 8, 12])

function isHolidayMonth(billingCycle: BillingCycleType, period: number): boolean {
  return billingCycle === BillingCycle.MONTHLY && HOLIDAY_MONTHS.has(period)
}

function getPeriodStartDate(
  billingCycle: BillingCycleType,
  period: number,
  year: number,
): Date {
  if (billingCycle === BillingCycle.MONTHLY) {
    return getStartOfMonth(year, period)
  }
  return getStartOfTerm(year, period)
}

export function calculateSchoolFeesOutstanding(
  student: Student,
  settings: AppSettings,
): number {
  if (!Array.isArray(student.feePayments)) return 0

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const billingCycle = settings.billingCycle
  const windowStart = getOutstandingWindowStart(student, settings, currentYear)

  let outstanding = 0

  student.feePayments.forEach((payment) => {
    if (payment.isSkipped || isHolidayMonth(billingCycle, payment.period)) return

    const periodStartDate = getPeriodStartDate(billingCycle, payment.period, currentYear)

    if (periodStartDate <= currentDate && periodStartDate >= windowStart) {
      if (!student.hasTransport || payment.isTransportWaived) {
        outstanding += payment.outstandingAmount
      } else {
        const transportPart = billingCycle === BillingCycle.MONTHLY ? student.transportFee || 0 : 0
        outstanding += Math.max(0, payment.outstandingAmount - transportPart)
      }
    }
  })

  return Math.round((outstanding + Number.EPSILON) * 100) / 100
}

export function calculateTransportOutstanding(student: Student, settings: AppSettings): number {
  if (!student.hasTransport || !Array.isArray(student.transportPayments)) return 0

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const activationDate = student.transportActivationDate
    ? new Date(student.transportActivationDate)
    : new Date()

  const windowStartMonth = Math.max(
    1,
    getBillingWindowStartMonth(student, settings, currentYear),
    !Number.isNaN(activationDate.getTime()) && activationDate.getFullYear() === currentYear
      ? activationDate.getMonth() + 1
      : 1,
  )

  return student.transportPayments.reduce((total, payment) => {
    const paymentMonth = payment.month
    const isCurrentOrPast = paymentMonth <= currentMonth
    const isAfterWindowStart = paymentMonth >= windowStartMonth

    if (isCurrentOrPast && isAfterWindowStart && !payment.isSkipped && !payment.isWaived) {
      return total + payment.outstandingAmount
    }
    return total
  }, 0)
}

export function calculateOutstandingFromEnrollment(student: Student, settings: AppSettings): number {
  const schoolFees = calculateSchoolFeesOutstanding(student, settings)
  const transport = calculateTransportOutstanding(student, settings)
  return Math.round((schoolFees + transport + Number.EPSILON) * 100) / 100
}

export function formatMoney(amount: number, currency = "$"): string {
  return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
