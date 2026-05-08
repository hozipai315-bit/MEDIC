'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddMedicineModal({
  tenantId,
  onClose,
}: {
  tenantId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  async function searchMedicines(query: string) {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from('medicines')
      .select('id, name, generic_name, brand, strength, form')
      .ilike('name', `%${query}%`)
      .limit(10)
    setSearchResults(data ?? [])
  }

  async function handleSubmit(formData: FormData) {
    if (!selectedMedicine) {
      setError('Pehle medicine select karein')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from('store_medicines').insert({
      tenant_id: tenantId,
      medicine_id: selectedMedicine.id,
      batch_number: formData.get('batch_number') as string || null,
      expiry_date: formData.get('expiry_date') as string || null,
      stock_qty: parseInt(formData.get('stock_qty') as string),
      purchase_price: parseFloat(formData.get('purchase_price') as string),
      sale_price: parseFloat(formData.get('sale_price') as string),
      reorder_level: parseInt(formData.get('reorder_level') as string) || 10,
    })
    if (error) {
      setError(error.message)
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
          <DialogTitle>Medicine Add Karein</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {/* Medicine Search */}
          <div className="space-y-2">
            <Label>Medicine Search Karein</Label>
            <Input
              placeholder="Medicine ka naam likhein..."
              value={searchQuery}
              onChange={(e) => searchMedicines(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
                    onClick={() => {
                      setSelectedMedicine(med)
                      setSearchQuery(med.name)
                      setSearchResults([])
                    }}
                  >
                    <p className="font-medium">{med.name}</p>
                    <p className="text-xs text-slate-400">{med.generic_name} • {med.strength} • {med.form}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedMedicine && (
              <p className="text-xs text-green-600">✓ Selected: {selectedMedicine.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input id="batch_number" name="batch_number" placeholder="B-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input id="expiry_date" name="expiry_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_qty">Stock Quantity *</Label>
              <Input id="stock_qty" name="stock_qty" type="number" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input id="reorder_level" name="reorder_level" type="number" min="0" defaultValue="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (Rs.) *</Label>
              <Input id="purchase_price" name="purchase_price" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price (Rs.) *</Label>
              <Input id="sale_price" name="sale_price" type="number" step="0.01" min="0" required />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Medicine Add Karein'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
