'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Sale {
  id: string
  invoice_number: string
  total: number
  payment_method: string
  created_at: string
}

interface Customer {
  id: string
  full_name: string
  total_spent: number
  credit_balance: number
}

export default function CustomerPurchaseHistory({
  customer,
  onClose,
}: {
  customer: Customer
  onClose: () => void
}) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const supabase = createClient()
      const { data } = await supabase
        .from('sales')
        .select('id, invoice_number, total, payment_method, created_at')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setSales(data ?? [])
      setLoading(false)
    }
    fetchHistory()
  }, [customer.id])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer.full_name} — Purchase History</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm text-slate-600 mb-4">
          <p>Total Spent: <strong className="text-slate-900">Rs. {customer.total_spent.toLocaleString()}</strong></p>
          <p>Credit Balance: <strong className={customer.credit_balance > 0 ? 'text-amber-600' : 'text-slate-900'}>
            Rs. {customer.credit_balance.toLocaleString()}
          </strong></p>
        </div>
        {loading ? (
          <p className="text-center text-slate-400 py-8">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Koi purchase history nahi</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {sales.map(sale => (
              <div key={sale.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">{sale.invoice_number}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(sale.created_at).toLocaleDateString('en-PK')} • {sale.payment_method}
                  </p>
                </div>
                <p className="font-medium text-slate-900">Rs. {sale.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
