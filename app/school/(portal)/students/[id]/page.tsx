"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { subscribeOne, subscribeAppSettings } from "@/lib/realtime"
import { calculateOutstandingFromEnrollment, formatMoney } from "@/lib/calculations"
import {
  formatBillingStartSummary,
  getEffectiveBillingPeriodStart,
} from "@/lib/billingStart"
import type { AppSettings, Student } from "@/types/school"

export default function SchoolStudentDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    if (!id) return
    const unsubStudent = subscribeOne<Student>("students", id, setStudent)
    const unsubSettings = subscribeAppSettings<AppSettings>(setSettings)
    return () => {
      unsubStudent()
      unsubSettings()
    }
  }, [id])

  const outstanding = useMemo(() => {
    if (!student || !settings) return student?.totalOwed ?? 0
    return calculateOutstandingFromEnrollment(student, settings)
  }, [student, settings])

  const effectiveBillingStart = useMemo(() => {
    if (!student || !settings) return null
    return getEffectiveBillingPeriodStart(student, settings)
  }, [student, settings])

  if (!id) return null

  const currency = settings?.currency || "$"

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/school/students" className="text-brand-600 hover:underline">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <User className="h-5 w-5" />
          Student Details
        </h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{student?.fullName ?? "—"}</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-slate-500">Class:</span> {student?.className ?? "—"}
          </div>
          <div>
            <span className="text-slate-500">Group:</span> {student?.classGroup ?? "—"}
          </div>
          <div>
            <span className="text-slate-500">Contact:</span> {student?.parentContact ?? "—"}
          </div>
          <div>
            <span className="text-slate-500">Address:</span> {student?.address ?? "—"}
          </div>
          <div>
            <span className="text-slate-500">Admission:</span>{" "}
            {student?.admissionDate
              ? new Date(student.admissionDate).toLocaleDateString()
              : "—"}
          </div>
          <div>
            <span className="text-slate-500">Billing starts:</span>{" "}
            {effectiveBillingStart ? effectiveBillingStart.toLocaleDateString() : "—"}
          </div>
          <div>
            <span className="text-slate-500">Total Paid:</span>{" "}
            {formatMoney(student?.totalPaid ?? 0, currency)}
          </div>
          <div>
            <span className="text-slate-500">Outstanding:</span>{" "}
            {formatMoney(outstanding, currency)}
          </div>
        </div>
        {settings && (
          <p className="mt-4 text-xs text-slate-500">{formatBillingStartSummary(settings)}</p>
        )}
      </div>
    </div>
  )
}
