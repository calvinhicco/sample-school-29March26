"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users } from "lucide-react"
import { getInitial, subscribe, subscribeAppSettings } from "@/lib/realtime"
import { calculateOutstandingFromEnrollment, formatMoney } from "@/lib/calculations"
import type { AppSettings, Student } from "@/types/school"

export default function SchoolStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    getInitial<Student>("students").then(setStudents)
    const unsubSettings = subscribeAppSettings<AppSettings>(setSettings)
    const unsub = subscribe<Student>("students", setStudents)
    return () => {
      unsub()
      unsubSettings()
    }
  }, [])

  const currency = settings?.currency || "$"

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <Users className="h-5 w-5" />
        Students
      </h1>

      <div className="grid gap-3">
        {students.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Link
              href={`/school/students/${s.id}`}
              className="text-base font-medium text-brand-700 hover:underline"
            >
              {s.fullName}
            </Link>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>Class: {s.className}</span>
              <span>Group: {s.classGroup}</span>
              <span>Total Paid: {s.totalPaid ?? 0}</span>
              <span>
                Outstanding:{" "}
                {settings
                  ? formatMoney(calculateOutstandingFromEnrollment(s, settings), currency)
                  : formatMoney(s.totalOwed ?? 0, currency)}
              </span>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-sm text-slate-500">
            No students yet. Data syncs from the desktop app when Firebase sync is enabled.
          </p>
        )}
      </div>
    </div>
  )
}
