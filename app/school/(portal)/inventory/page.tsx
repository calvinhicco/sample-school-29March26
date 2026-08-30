"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Boxes, Loader2, ShoppingCart } from "lucide-react"
import { getInitial, subscribe, subscribeAppSettings } from "@/lib/realtime"
import { formatMoney } from "@/lib/calculations"
import type { AppSettings } from "@/types/school"
import type { Inventory, SaleRecord } from "@/types/inventory"

export default function SchoolInventoryPage() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [inv, sa] = await Promise.all([
          getInitial<Inventory>("inventories"),
          getInitial<SaleRecord>("sales"),
        ])
        setInventories(inv)
        setSales(sa)
      } catch {
        setError("Failed to load inventory data.")
      } finally {
        setLoading(false)
      }
    }

    load()
    const unsubs = [
      subscribe<Inventory>("inventories", setInventories),
      subscribe<SaleRecord>("sales", setSales),
      subscribeAppSettings<AppSettings>(setSettings),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  const stats = useMemo(() => {
    const totalItems = inventories.reduce((sum, inv) => sum + (inv.items?.length || 0), 0)
    const totalStock = inventories.reduce(
      (sum, inv) => sum + (inv.items || []).reduce((s, item) => s + (item.quantity || 0), 0),
      0,
    )
    const completedSales = sales.filter((s) => !s.status || s.status === "completed")
    const salesTotal = completedSales.reduce((sum, s) => sum + (s.total || 0), 0)
    const lowStock = inventories.flatMap((inv) =>
      (inv.items || []).filter((item) => item.quantity <= (item.lowStockThreshold || 5)),
    ).length
    return { totalItems, totalStock, salesTotal, lowStock, completedSales }
  }, [inventories, sales])

  const currency = settings?.currency || "$"

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
        <Boxes className="h-5 w-5" />
        Inventory
      </h1>
      <p className="text-sm text-slate-600">Stock and sales synced from the desktop app in real time.</p>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Inventories</p>
          <p className="text-2xl font-bold">{inventories.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Stock</p>
          <p className="text-2xl font-bold">{stats.totalStock}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Sales Total</p>
          <p className="text-2xl font-bold text-emerald-600">{formatMoney(stats.salesTotal, currency)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
        </div>
      </div>

      {inventories.map((inv) => (
        <div key={inv.id || inv.inventoryName} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">{inv.inventoryName}</h2>
            <p className="text-sm text-slate-500">{inv.items?.length || 0} item types</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-600">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Cost</th>
                  <th className="px-4 py-2">Sell Price</th>
                  <th className="px-4 py-2">Low Stock</th>
                </tr>
              </thead>
              <tbody>
                {(inv.items || []).map((item) => (
                  <tr key={item.itemName} className="border-b">
                    <td className="px-4 py-2 font-medium">{item.itemName}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">{formatMoney(item.costPrice || 0, currency)}</td>
                    <td className="px-4 py-2">{formatMoney(item.sellingPrice || 0, currency)}</td>
                    <td className="px-4 py-2">{item.lowStockThreshold ?? 5}</td>
                  </tr>
                ))}
                {(inv.items || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {inventories.length === 0 && (
        <p className="text-sm text-slate-500">No inventories synced yet.</p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <ShoppingCart className="h-4 w-4 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Inventory</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.completedSales.slice(0, 50).map((sale) => (
                <tr key={sale.id} className="border-b">
                  <td className="px-4 py-2">{format(new Date(sale.soldAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-2">{sale.inventoryName}</td>
                  <td className="px-4 py-2">{sale.itemName}</td>
                  <td className="px-4 py-2">{sale.quantitySold}</td>
                  <td className="px-4 py-2">{formatMoney(sale.total, currency)}</td>
                  <td className="px-4 py-2 capitalize">{sale.status || "completed"}</td>
                </tr>
              ))}
              {stats.completedSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No sales synced yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
