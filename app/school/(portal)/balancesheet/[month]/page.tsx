"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Loader2, Scale } from "lucide-react"
import { getInitial, subscribe, subscribeAppSettings } from "@/lib/realtime"
import { buildMonthlyBalanceSheet } from "@/lib/accountsBalanceSheet"
import { formatMoney } from "@/lib/calculations"
import type { AppSettings, Expense, ExtraBillingPage, Student } from "@/types/school"
import type { SaleRecord } from "@/types/inventory"

type PageProps = { params: { month: string } }

export default function BalanceSheetMonthPage({ params }: PageProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [extraBilling, setExtraBilling] = useState<ExtraBillingPage[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthIndex = now.getMonth()

  const monthIndex = useMemo(() => {
    const parsed = Number.parseInt(params.month, 10)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 12) return null
    return parsed - 1
  }, [params.month])

  const monthLabel = useMemo(() => {
    if (monthIndex === null) return null
    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(
      new Date(currentYear, monthIndex, 1),
    )
  }, [currentYear, monthIndex])

  const isMonthAllowed = monthIndex !== null && monthIndex <= currentMonthIndex
  const monthNumber = monthIndex !== null ? monthIndex + 1 : 1

  useEffect(() => {
    if (!isMonthAllowed) {
      setLoading(false)
      return
    }

    const load = async () => {
      const [s, e, sa, eb] = await Promise.all([
        getInitial<Student>("students"),
        getInitial<Expense>("expenses"),
        getInitial<SaleRecord>("sales"),
        getInitial<ExtraBillingPage>("extraBilling"),
      ])
      setStudents(s)
      setExpenses(e)
      setSales(sa)
      setExtraBilling(eb)
      setLoading(false)
    }

    load()

    const unsubs = [
      subscribe<Student>("students", setStudents),
      subscribe<Expense>("expenses", setExpenses),
      subscribe<SaleRecord>("sales", setSales),
      subscribe<ExtraBillingPage>("extraBilling", setExtraBilling),
      subscribeAppSettings<AppSettings>(setSettings),
    ]

    return () => unsubs.forEach((u) => u())
  }, [isMonthAllowed])

  const sheet = useMemo(() => {
    if (!isMonthAllowed || monthIndex === null) return null
    return buildMonthlyBalanceSheet(
      currentYear,
      monthNumber,
      students,
      settings || { billingCycle: "monthly" },
      expenses,
      sales,
      extraBilling,
    )
  }, [currentYear, monthNumber, monthIndex, students, settings, expenses, sales, extraBilling, isMonthAllowed])

  const currency = settings?.currency || "$"

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!isMonthAllowed || !sheet) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-rose-600">This month is not available yet.</p>
        <Link href="/school/balancesheet" className="mt-4 inline-block text-brand-600 hover:underline">
          ← Back to balance sheet
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/school/balancesheet" className="text-brand-600 hover:underline">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Scale className="h-5 w-5" />
          Balance Sheet — {monthLabel} {currentYear}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-600 p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Total Income</p>
          <p className="text-2xl font-bold">{formatMoney(sheet.totalIncome, currency)}</p>
        </div>
        <div className="rounded-xl bg-rose-500 p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Total Expenses</p>
          <p className="text-2xl font-bold">{formatMoney(sheet.totalExpenses, currency)}</p>
        </div>
        <div className={`rounded-xl p-5 text-white shadow-lg ${sheet.netBalance >= 0 ? "bg-brand-600" : "bg-amber-600"}`}>
          <p className="text-sm opacity-90">Net Balance</p>
          <p className="text-2xl font-bold">{formatMoney(sheet.netBalance, currency)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-emerald-700">Income</h2>
          {sheet.income.length === 0 ? (
            <p className="text-sm text-slate-500">No income recorded this month.</p>
          ) : (
            <ul className="space-y-2">
              {sheet.income.map((line) => (
                <li key={line.label} className="flex justify-between text-sm">
                  <span className="text-slate-700">{line.label}</span>
                  <span className="font-medium text-slate-900">{formatMoney(line.amount, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-rose-700">Expenses</h2>
          {sheet.expenses.length === 0 ? (
            <p className="text-sm text-slate-500">No expenses recorded this month.</p>
          ) : (
            <ul className="space-y-2">
              {sheet.expenses.map((line) => (
                <li key={line.label} className="flex justify-between text-sm">
                  <span className="text-slate-700">{line.label}</span>
                  <span className="font-medium text-slate-900">{formatMoney(line.amount, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
