'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { addCustomMedicine } from '@/app/actions/inventory'
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
  const [tab, setTab] = useState<'search' | 'custom'>('search')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  async function searchMedicines(query: string) {
    setSearchQuery(query)
    if (query.length < 2) { setSearchResults([]); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('medicines')
      .select('id, name, generic_name, brand, strength, form')
      .ilike('name', `%${query}%`)
      .limit(10)
    setSearchResults(data ?? [])
  }

  async function handleGlobalSubmit(formData: FormData) {
    if (!selectedMedicine) { setError('Pehle medicine select karein'); return }
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
    if (error) { setError(error.message); setLoading(false); return }
    router.refresh()
    onClose()
  }

  async function handleCustomSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await addCustomMedicine(formData, tenantId)
    if (result?.error) { setError(result.error); setLoading(false); return }
    router.refresh()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Medicine Add Karein</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTab('search')}
            className={`flex-1 py-2 text-sm rounded-lg font-medium ${tab === 'search' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Global DB Search
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`flex-1 py-2 text-sm rounded-lg font-medium ${tab === 'custom' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Custom Medicine
          </button>
        </div>

        {tab === 'search' ? (
          <form action={handleGlobalSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Medicine Search Karein</Label>
              <input type="hidden" name="dummy" /> {/* Workaround for empty form action if needed, though not strictly required here */}
              <Input placeholder="Medicine ka naam likhein..." value={searchQuery} onChange={(e) => searchMedicines(e.target.value)} />
              {searchResults.length > 0 && (
                <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                  {searchResults.map((med) => (
                    <button key={med.id} type="button"
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
                      onClick={() => { setSelectedMedicine(med); setSearchQuery(med.name); setSearchResults([]) }}>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-xs text-slate-400">{med.generic_name} • {med.strength} • {med.form}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedMedicine && <p className="text-xs text-green-600">✓ Selected: {selectedMedicine.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="batch_number">Batch Number</Label><Input id="batch_number" name="batch_number" /></div>
              <div className="space-y-2"><Label htmlFor="expiry_date">Expiry Date</Label><Input id="expiry_date" name="expiry_date" type="date" /></div>
              <div className="space-y-2"><Label htmlFor="stock_qty">Stock Qty *</Label><Input id="stock_qty" name="stock_qty" type="number" min="0" required /></div>
              <div className="space-y-2"><Label htmlFor="reorder_level">Reorder Level</Label><Input id="reorder_level" name="reorder_level" type="number" defaultValue="10" /></div>
              <div className="space-y-2"><Label htmlFor="purchase_price">Purchase Price *</Label><Input id="purchase_price" name="purchase_price" type="number" step="0.01" required /></div>
              <div className="space-y-2"><Label htmlFor="sale_price">Sale Price *</Label><Input id="sale_price" name="sale_price" type="number" step="0.01" required /></div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Karein'}</Button>
            </div>
          </form>
        ) : (
          <form action={handleCustomSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2"><Label htmlFor="name">Medicine Name *</Label><Input id="name" name="name" placeholder="Panadol" required /></div>
              <div className="space-y-2"><Label htmlFor="generic_name">Generic Name</Label><Input id="generic_name" name="generic_name" placeholder="Paracetamol" /></div>
              <div className="space-y-2"><Label htmlFor="brand">Brand</Label><Input id="brand" name="brand" placeholder="GSK" /></div>
              <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" name="category" placeholder="Analgesic" /></div>
              <div className="space-y-2"><Label htmlFor="form">Form</Label><Input id="form" name="form" placeholder="Tablet" /></div>
              <div className="space-y-2"><Label htmlFor="strength">Strength</Label><Input id="strength" name="strength" placeholder="500mg" /></div>
              <div className="space-y-2"><Label htmlFor="manufacturer">Manufacturer</Label><Input id="manufacturer" name="manufacturer" /></div>
              <div className="space-y-2"><Label htmlFor="stock_qty">Stock Qty *</Label><Input id="stock_qty" name="stock_qty" type="number" min="0" required /></div>
              <div className="space-y-2"><Label htmlFor="reorder_level">Reorder Level</Label><Input id="reorder_level" name="reorder_level" type="number" defaultValue="10" /></div>
              <div className="space-y-2"><Label htmlFor="purchase_price">Purchase Price *</Label><Input id="purchase_price" name="purchase_price" type="number" step="0.01" required /></div>
              <div className="space-y-2"><Label htmlFor="sale_price">Sale Price *</Label><Input id="sale_price" name="sale_price" type="number" step="0.01" required /></div>
              <div className="space-y-2"><Label htmlFor="batch_number">Batch Number</Label><Input id="batch_number" name="batch_number" /></div>
              <div className="space-y-2"><Label htmlFor="expiry_date">Expiry Date</Label><Input id="expiry_date" name="expiry_date" type="date" /></div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Custom Medicine Add Karein'}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
