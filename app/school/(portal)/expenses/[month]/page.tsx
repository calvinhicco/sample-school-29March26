"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ArrowLeft, Loader2, Receipt } from "lucide-react"
import { getInitial, subscribe } from "@/lib/realtime"
import type { Expense } from "@/types/school"

type PageProps = {
  params: { month: string }
}

function safeParseDate(dateString: string) {
  const d = new Date(dateString)
  return Number.isNaN(d.getTime()) ? null : d
}

export default function SchoolExpensesMonthPage({ params }: PageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!isMonthAllowed || monthIndex === null) {
      setLoading(false)
      setError("This month is not available yet.")
      return
    }

    const filterToMonth = (all: Expense[]) =>
      (all || []).filter((exp) => {
        const d = safeParseDate(exp.date)
        if (!d) return false
        return d.getFullYear() === currentYear && d.getMonth() === monthIndex
      })

    const load = async () => {
      const data = await getInitial<Expense>("expenses")
      setExpenses(filterToMonth(data))
      setLoading(false)
    }

    load()
    const unsub = subscribe<Expense>("expenses", (docs) => setExpenses(filterToMonth(docs)))
    return () => unsub()
  }, [currentYear, isMonthAllowed, monthIndex])

  const activeExpenses = expenses.filter((e) => !e.isReversed && !e.reversed)
  const total = activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-rose-600">{error}</p>
        <Link href="/school/expenses" className="mt-4 inline-block text-brand-600 hover:underline">
          Back to expenses
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/school/expenses" className="text-brand-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Receipt className="h-5 w-5" />
          {monthLabel} {currentYear}
        </h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          {activeExpenses.length} expense(s) · Total ${total.toLocaleString()}
        </p>
      </div>

      <div className="space-y-3">
        {activeExpenses.map((exp) => (
          <div key={exp.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">
                  {exp.description || exp.purpose || "Expense"}
                </p>
                {exp.category && <p className="text-sm text-slate-500">{exp.category}</p>}
              </div>
              <p className="font-semibold text-slate-900">${Number(exp.amount).toLocaleString()}</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {exp.date ? format(new Date(exp.date), "MMM dd, yyyy") : "—"}
            </p>
          </div>
        ))}
        {activeExpenses.length === 0 && (
          <p className="text-sm text-slate-500">No expenses recorded for this month.</p>
        )}
      </div>
    </div>
  )
}
