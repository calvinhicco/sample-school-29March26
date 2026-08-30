"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { LoginForm } from "@/components/LoginForm"
import type { PortalSession } from "@/types/academic"

export default function ParentLoginPage() {
  const router = useRouter()

  const handleSuccess = (session: PortalSession) => {
    router.push(`/parent/report?studentId=${encodeURIComponent(session.studentId)}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div>
        <p className="mb-4 text-center text-sm text-slate-500">
          <Link href="/" className="text-brand-600 hover:underline">
            ← All portals
          </Link>
        </p>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </main>
  )
}
