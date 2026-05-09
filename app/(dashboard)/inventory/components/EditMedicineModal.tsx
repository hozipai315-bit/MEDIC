'use client'

import { useState } from 'react'
import { editMedicine } from '@/app/actions/inventory'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface InventoryItem {
  id: string
  sale_price: number
  purchase_price: number
  expiry_date: string | null
  reorder_level: number
  batch_number: string | null
  barcode: string | null
  medicines: { name: string; strength: string | null }
}

export default function EditMedicineModal({
  item,
  onClose,
}: {
  item: InventoryItem
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-calculate profit margin
  const [salePrice, setSalePrice] = useState(item.sale_price)
  const [purchasePrice, setPurchasePrice] = useState(item.purchase_price)
  const margin = purchasePrice > 0
    ? (((salePrice - purchasePrice) / purchasePrice) * 100).toFixed(1)
    : '0'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await editMedicine(item.id, formData)
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit — {item.medicines.name} {item.medicines.strength}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (Rs.) *</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                defaultValue={item.purchase_price}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price (Rs.) *</Label>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                step="0.01"
                defaultValue={item.sale_price}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Profit Margin Display — FR-INV-013 */}
          <div className={`text-sm px-3 py-2 rounded-lg ${
            parseFloat(margin) >= 20 ? 'bg-green-50 text-green-700' :
            parseFloat(margin) >= 10 ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            Profit Margin: <strong>{margin}%</strong>
            {parseFloat(margin) < 10 && ' — ⚠️ Margin bohat kam hai!'}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input id="batch_number" name="batch_number" defaultValue={item.batch_number ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                defaultValue={item.expiry_date?.split('T')[0] ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                name="reorder_level"
                type="number"
                min="0"
                defaultValue={item.reorder_level}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                name="barcode"
                defaultValue={item.barcode ?? ''}
                placeholder="Scan ya type karein"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Changes Save Karein'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
