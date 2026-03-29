"use client"
import { Receipt, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExpensesPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Receipt className="w-5 h-5" /> Expenses
        </h1>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Info className="w-5 h-5" />
            Desktop App Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-green-700">
            Expense records are managed through the <strong>My Students Track</strong> desktop application.
          </p>
          <p className="text-sm text-green-600">
            Please open the Electron app to view and manage expenses. 
            Data is synced to Firebase from the desktop app only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
