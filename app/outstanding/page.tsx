"use client"
import { AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OutstandingPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Outstanding Students
        </h1>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Info className="w-5 h-5" />
            Desktop App Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-amber-700">
            Outstanding payment data is managed through the <strong>My Students Track</strong> desktop application.
          </p>
          <p className="text-sm text-amber-600">
            Please open the Electron app to view students with outstanding payments. 
            Data is synced to Firebase from the desktop app only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
