'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Customer {
  id: string
  full_name: string
  phone: string | null
  total_spent: number
  credit_balance: number
  created_at: string
}

function downloadCSV(customers: Customer[]) {
  const headers = ['Name', 'Phone', 'Total Spent (Rs.)', 'Credit Balance (Rs.)', 'Customer Since']
  const rows = customers.map(c => [
    c.full_name,
    c.phone ?? '',
    c.total_spent.toFixed(2),
    c.credit_balance.toFixed(2),
    new Date(c.created_at).toLocaleDateString('en-PK'),
  ])
  const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'medpos-customers.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function TopCustomersReport({ customers }: { customers: Customer[] }) {
  const top10 = [...customers]
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 10)

  return (
    <div className="bg-white rounded-xl border border-slate-200 mt-8">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Top Customers</h3>
          <p className="text-sm text-slate-500 mt-1">Total spend ke hisaab se top 10</p>
        </div>
        <Button variant="outline" onClick={() => downloadCSV(customers)}>
          <Download className="h-4 w-4 mr-2" />
          CSV Export
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-3 text-slate-600 font-medium">#</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Customer</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Phone</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Total Spent</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Credit Balance</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Customer Since</th>
            </tr>
          </thead>
          <tbody>
            {top10.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  Koi customer data nahi
                </td>
              </tr>
            ) : (
              top10.map((customer, index) => (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900">{customer.full_name}</td>
                  <td className="px-6 py-3 text-slate-600">{customer.phone ?? '—'}</td>
                  <td className="px-6 py-3 font-bold text-slate-900">
                    Rs. {customer.total_spent.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={customer.credit_balance > 0 ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                      Rs. {customer.credit_balance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {new Date(customer.created_at).toLocaleDateString('en-PK')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
