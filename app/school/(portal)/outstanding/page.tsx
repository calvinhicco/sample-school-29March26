"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { getInitial, subscribe, subscribeAppSettings } from "@/lib/realtime"
import { formatMoney } from "@/lib/calculations"
import type { AppSettings, OutstandingStudent } from "@/types/school"

export default function SchoolOutstandingPage() {
  const [outstandingStudents, setOutstandingStudents] = useState<OutstandingStudent[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInitial<OutstandingStudent>("outstandingStudents")
        setOutstandingStudents(data)
      } catch {
        setError("Failed to load outstanding students.")
      } finally {
        setLoading(false)
      }
    }
    load()

    const unsubs = [
      subscribe<OutstandingStudent>("outstandingStudents", setOutstandingStudents),
      subscribeAppSettings<AppSettings>(setSettings),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  const currency = settings?.currency || "$"
  const totalOutstanding = outstandingStudents.reduce(
    (sum, s) => sum + (Number(s.outstandingAmount) || 0),
    0,
  )

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
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Outstanding Balances
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pre-calculated by the desktop app · Total {formatMoney(totalOutstanding, currency)}
        </p>
      </div>

      <div className="space-y-3">
        {outstandingStudents.map((s) => (
          <div key={s.id} className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{s.fullName}</p>
                <p className="text-sm text-slate-500">
                  {s.className || s.classGroup} · {s.parentContact}
                </p>
              </div>
              <p className="text-lg font-semibold text-amber-700">
                {formatMoney(Number(s.outstandingAmount) || 0, currency)}
              </p>
            </div>
          </div>
        ))}
        {outstandingStudents.length === 0 && (
          <p className="text-sm text-slate-500">No outstanding balances recorded.</p>
        )}
      </div>
    </div>
  )
}
