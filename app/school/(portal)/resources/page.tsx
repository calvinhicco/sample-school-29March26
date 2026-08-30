"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Laptop, Loader2, Package, Warehouse } from "lucide-react"
import { getInitial, subscribe, subscribeAppSettings } from "@/lib/realtime"
import { formatMoney } from "@/lib/calculations"
import type { AppSettings } from "@/types/school"
import type { Asset, Consumable, ResourceIssue } from "@/types/resources"

type Tab = "assets" | "consumables" | "issues"

export default function SchoolResourcesPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [consumables, setConsumables] = useState<Consumable[]>([])
  const [issues, setIssues] = useState<ResourceIssue[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [tab, setTab] = useState<Tab>("assets")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [a, c, i] = await Promise.all([
          getInitial<Asset>("assets"),
          getInitial<Consumable>("consumables"),
          getInitial<ResourceIssue>("resourceIssues"),
        ])
        setAssets(a)
        setConsumables(c)
        setIssues(i)
      } catch {
        setError("Failed to load resources data.")
      } finally {
        setLoading(false)
      }
    }

    load()
    const unsubs = [
      subscribe<Asset>("assets", setAssets),
      subscribe<Consumable>("consumables", setConsumables),
      subscribe<ResourceIssue>("resourceIssues", setIssues),
      subscribeAppSettings<AppSettings>(setSettings),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  const stats = useMemo(() => ({
    assets: assets.length,
    available: assets.filter((a) => a.status === "available").length,
    consumables: consumables.length,
    lowStock: consumables.filter((c) => c.quantity <= c.lowStockThreshold).length,
    issues: issues.filter((i) => i.status !== "reversed").length,
  }), [assets, consumables, issues])

  const currency = settings?.currency || "$"

  const statusClass = (status: string) => {
    const map: Record<string, string> = {
      available: "bg-emerald-100 text-emerald-800",
      issued: "bg-blue-100 text-blue-800",
      maintenance: "bg-amber-100 text-amber-800",
      retired: "bg-slate-100 text-slate-600",
      consumed: "bg-orange-100 text-orange-800",
      returned: "bg-teal-100 text-teal-800",
      reversed: "bg-rose-100 text-rose-800",
    }
    return map[status] || "bg-slate-100 text-slate-700"
  }

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
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <Warehouse className="h-5 w-5" />
        Resources & Assets
      </h1>
      <p className="text-sm text-slate-600">School assets, consumables, and issue records synced from the desktop app.</p>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Assets</p>
          <p className="text-2xl font-bold">{stats.assets}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Available</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Consumables</p>
          <p className="text-2xl font-bold">{stats.consumables}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active Issues</p>
          <p className="text-2xl font-bold text-amber-600">{stats.issues}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ["assets", "Assets", Laptop],
          ["consumables", "Consumables", Package],
          ["issues", "Issue Log", Warehouse],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === key ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-brand-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "assets" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Serial</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Assigned</th>
                <th className="px-4 py-2">Cost</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="px-4 py-2 font-medium">{a.name}</td>
                  <td className="px-4 py-2">{a.category}</td>
                  <td className="px-4 py-2">{a.serialNumber || "—"}</td>
                  <td className="px-4 py-2">{a.location || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{a.assignedTo || "—"}</td>
                  <td className="px-4 py-2">{formatMoney(a.cost, currency)}</td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No assets synced yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "consumables" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Low Stock</th>
                <th className="px-4 py-2">Cost/Unit</th>
              </tr>
            </thead>
            <tbody>
              {consumables.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2">{c.category}</td>
                  <td className="px-4 py-2">{c.unit}</td>
                  <td className="px-4 py-2">{c.quantity}</td>
                  <td className="px-4 py-2">{c.lowStockThreshold}</td>
                  <td className="px-4 py-2">{formatMoney(c.costPerUnit, currency)}</td>
                </tr>
              ))}
              {consumables.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No consumables synced yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "issues" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Issued To</th>
                <th className="px-4 py-2">Purpose</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b">
                  <td className="px-4 py-2">{format(new Date(issue.issuedAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-2 capitalize">{issue.resourceType}</td>
                  <td className="px-4 py-2">{issue.resourceName}</td>
                  <td className="px-4 py-2">{issue.quantity}</td>
                  <td className="px-4 py-2">{issue.issuedTo}</td>
                  <td className="px-4 py-2">{issue.purpose || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No issues synced yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
