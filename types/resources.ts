export type AssetStatus = "available" | "issued" | "maintenance" | "retired"
export type ResourceIssueStatus = "issued" | "returned" | "consumed" | "reversed"

export interface Asset {
  id: string
  name: string
  category: string
  serialNumber?: string
  location?: string
  condition: string
  assignedTo?: string
  acquiredDate: string
  cost: number
  status: AssetStatus
  notes?: string
  createdAt?: string
}

export interface Consumable {
  id: string
  name: string
  category: string
  unit: string
  quantity: number
  lowStockThreshold: number
  costPerUnit: number
  notes?: string
  createdAt?: string
}

export interface ResourceIssue {
  id: string
  resourceType: "asset" | "consumable"
  resourceId: string
  resourceName: string
  quantity: number
  issuedTo: string
  issuedBy: string
  purpose: string
  issuedAt: string
  status: ResourceIssueStatus
  returnedAt?: string | null
  reversedAt?: string | null
  reversedBy?: string | null
  reversalReason?: string | null
}
