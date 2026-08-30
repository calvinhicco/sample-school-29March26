import { DashboardTotals } from "@/components/school/DashboardTotals"

export default function SchoolDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Overview of your school&apos;s financials synced from the desktop app.
        </p>
      </div>
      <DashboardTotals />
    </div>
  )
}
