"use client"

import Link from "next/link"
import { Scale } from "lucide-react"

export default function BalanceSheetIndexPage() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthIndex = now.getMonth()
  const months = Array.from({ length: currentMonthIndex + 1 }, (_, idx) => idx)

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <Scale className="h-5 w-5" />
        Balance Sheet
        <span className="text-sm font-normal text-slate-500">({currentYear})</span>
      </h1>
      <p className="text-sm text-slate-600">
        Monthly income vs expenses synced from the desktop app — tuition, transport, inventory sales, extra billing, and expenses.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-medium text-slate-900">Select a month</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {months.map((monthIdx) => {
            const monthNumber = String(monthIdx + 1).padStart(2, "0")
            const label = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
              new Date(currentYear, monthIdx, 1),
            )
            const isCurrent = monthIdx === currentMonthIndex
            return (
              <Link
                key={monthNumber}
                href={`/school/balancesheet/${monthNumber}`}
                className={`rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition ${
                  isCurrent
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
