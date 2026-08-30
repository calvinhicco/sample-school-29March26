"use client"

import { Suspense } from "react"
import { SchoolLoginForm } from "@/components/school/SchoolLoginForm"
import { Loader2 } from "lucide-react"

export default function SchoolLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-50 flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        }
      >
        <SchoolLoginForm />
      </Suspense>
    </main>
  )
}
