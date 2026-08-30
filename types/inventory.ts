export type SaleStatus = "completed" | "reversed"

export interface InventoryItem {
  itemName: string
  quantity: number
  costPrice: number
  sellingPrice: number
  profit?: number
  profitMargin?: number
  createdAt?: string
  defaultPrice?: number
  lowStockThreshold: number
  stockLog?: unknown[]
}

export interface Inventory {
  id?: string
  inventoryName: string
  createdAt?: string
  year?: number
  items: InventoryItem[]
}

export interface SaleRecord {
  id: string
  inventoryName: string
  itemName: string
  quantitySold: number
  costPrice: number
  unitPrice: number
  profit?: number
  profitMargin?: number
  total: number
  soldAt: string
  soldBy?: string
  year?: number
  status?: SaleStatus
  reversedAt?: string | null
  reversedBy?: string | null
  reversalReason?: string | null
  posTransactionId?: string | null
}
