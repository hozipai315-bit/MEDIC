'use client'

import { useState } from 'react'
import { bulkPriceUpdate } from '@/app/actions/inventory'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function BulkPriceUpdateModal({
  categories,
  tenantId,
  onClose,
}: {
  categories: string[]
  tenantId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [category, setCategory] = useState(categories[0] ?? '')
  const [updateType, setUpdateType] = useState<'percentage' | 'flat'>('percentage')
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handlePreview() {
    if (value <= 0) { setError('Value 0 se zyada honi chahiye'); return }
    setError(null)
    if (updateType === 'percentage') {
      setPreview(`${category} category ki saari medicines ki price ${value}% increase hogi`)
    } else {
      setPreview(`${category} category ki saari medicines ki price Rs. ${value} increase hogi`)
    }
  }

  async function handleConfirm() {
    if (value <= 0) { setError('Value 0 se zyada honi chahiye'); return }
    setLoading(true)
    setError(null)
    const result = await bulkPriceUpdate(tenantId, category, updateType, value)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setPreview(null)
    router.refresh()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Price Update</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Category Select */}
          <div className="space-y-2">
            <Label>Category Select Karein</Label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPreview(null) }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Update Type */}
          <div className="space-y-2">
            <Label>Update Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setUpdateType('percentage'); setPreview(null) }}
                className={`py-2 rounded-lg text-sm font-medium border ${
                  updateType === 'percentage'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                % Percentage
              </button>
              <button
                type="button"
                onClick={() => { setUpdateType('flat'); setPreview(null) }}
                className={`py-2 rounded-lg text-sm font-medium border ${
                  updateType === 'flat'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Rs. Flat
              </button>
            </div>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label>
              {updateType === 'percentage' ? 'Percentage (%)' : 'Amount (Rs.)'}
            </Label>
            <Input
              type="number"
              min="0"
              step={updateType === 'percentage' ? '1' : '0.01'}
              value={value}
              onChange={(e) => { setValue(parseFloat(e.target.value) || 0); setPreview(null) }}
              placeholder={updateType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              ⚠️ {preview}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            {!preview ? (
              <Button type="button" onClick={handlePreview}>
                Preview
              </Button>
            ) : (
              <Button type="button" onClick={handleConfirm} disabled={loading}>
                {loading ? 'Updating...' : 'Confirm Update'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
