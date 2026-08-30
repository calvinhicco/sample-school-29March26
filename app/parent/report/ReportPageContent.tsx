"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ReportView } from "@/components/ReportView"
import {
  clearSession,
  fetchReportsForSession,
  loadSession,
  saveSession,
} from "@/lib/academicPortal"
import type { PortalSession, ReportBundle } from "@/types/academic"

export default function ReportPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bundles, setBundles] = useState<ReportBundle[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      let active = loadSession()
      const studentId = searchParams.get("studentId")
      if (!active && studentId) {
        active = {
          studentId,
          studentName: "",
          firstName: "",
          lastName: "",
        }
      }
      if (!active) {
        router.replace("/parent")
        return
      }
      try {
        const data = await fetchReportsForSession(active)
        setBundles(data)
        const preferred = searchParams.get("reportId") || data[0]?.report.id || ""
        setSelectedId(preferred)
        if (active.studentName) saveSession(active)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results.")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [router, searchParams])

  const logout = () => {
    clearSession()
    router.replace("/parent")
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </main>
    )
  }

  if (error || bundles.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-rose-800">{error || "No results available."}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 text-sm font-medium text-brand-600 hover:underline"
          >
            Back to login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      <ReportView
        bundles={bundles}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onLogout={logout}
      />
    </main>
  )
}
