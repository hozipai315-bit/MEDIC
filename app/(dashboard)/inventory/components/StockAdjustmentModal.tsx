'use client'

import { useState } from 'react'
import { adjustStock } from '@/app/actions/inventory'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface InventoryItem {
  id: string
  stock_qty: number
  medicines: { name: string; strength: string | null }
}

const REASONS = [
  'Received Stock',
  'Damaged / Expired Removed',
  'Physical Count Correction',
  'Returned to Supplier',
  'Other',
]

export default function StockAdjustmentModal({
  item,
  onClose,
}: {
  item: InventoryItem
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adjustment, setAdjustment] = useState(0)
  const [selectedReason, setSelectedReason] = useState(REASONS[0])

  const newQty = Math.max(0, item.stock_qty + adjustment)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set('reason', selectedReason)
    formData.set('adjustment', adjustment.toString())
    const result = await adjustStock(item.id, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-md">
        <DialogHeader>
          <DialogTitle>Stock Adjust Karein — {item.medicines.name}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <p className="text-slate-500">Current Stock</p>
            <p className="text-2xl font-bold text-slate-900">{item.stock_qty} units</p>
          </div>

          <div className="space-y-2">
            <Label>Adjustment</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustment(adj => adj - 1)}
              >-</Button>
              <Input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                className="text-center w-24"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustment(adj => adj + 1)}
              >+</Button>
            </div>
            <p className="text-sm text-slate-500">
              New Stock: <strong className="text-slate-900">{newQty} units</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Reason *</Label>
            <div className="space-y-2">
              {REASONS.map(reason => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${
                    selectedReason === reason
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || adjustment === 0}>
              {loading ? 'Saving...' : 'Stock Update Karein'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
