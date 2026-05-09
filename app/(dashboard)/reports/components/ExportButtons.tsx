'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface Sale {
  id: string
  total: number
  discount: number
  payment_method: string
  created_at: string
  status: string
}

interface MedicineSale { name: string; qty: number; revenue: number }

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportButtons({
  sales,
  medicineSalesData,
}: {
  sales: Sale[]
  medicineSalesData: MedicineSale[]
}) {
  function exportSalesCSV() {
    const headers = ['Invoice Date', 'Total (Rs.)', 'Discount (Rs.)', 'Payment Method', 'Status']
    const rows = sales.map(s => [
      new Date(s.created_at).toLocaleDateString('en-PK'),
      s.total.toFixed(2),
      s.discount.toFixed(2),
      s.payment_method,
      s.status,
    ])
    downloadCSV('medpos-sales-report.csv', rows, headers)
  }

  function exportMedicineCSV() {
    const headers = ['Medicine Name', 'Qty Sold', 'Revenue (Rs.)']
    const rows = medicineSalesData.map(m => [
      m.name,
      m.qty.toString(),
      m.revenue.toFixed(2),
    ])
    downloadCSV('medpos-medicine-sales.csv', rows, headers)
  }

  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={exportSalesCSV}>
        <Download className="h-4 w-4 mr-2" />
        Sales CSV
      </Button>
      <Button variant="outline" onClick={exportMedicineCSV}>
        <Download className="h-4 w-4 mr-2" />
        Medicine CSV
      </Button>
    </div>
  )
}
