'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import AddMedicineModal from './AddMedicineModal'

interface Medicine {
  name: string
  generic_name: string | null
  brand: string | null
  category: string | null
  form: string | null
  strength: string | null
  manufacturer: string | null
  drap_mrp: number | null
}

interface InventoryItem {
  id: string
  medicine_id: string
  batch_number: string | null
  expiry_date: string | null
  stock_qty: number
  purchase_price: number
  sale_price: number
  reorder_level: number
  medicines: Medicine
}

function getStockStatus(qty: number, reorderLevel: number, expiryDate: string | null) {
  if (qty === 0) return { label: 'Out of Stock', variant: 'destructive' as const }
  if (qty <= reorderLevel) return { label: 'Low Stock', variant: 'secondary' as const }
  if (expiryDate) {
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry <= 30) return { label: 'Expiring Soon', variant: 'secondary' as const }
  }
  return { label: 'In Stock', variant: 'default' as const }
}

export default function InventoryTable({
  inventory,
  tenantId,
  userRole,
}: {
  inventory: InventoryItem[]
  tenantId: string
  userRole: string
}) {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = inventory.filter(item =>
    item.medicines.name.toLowerCase().includes(search.toLowerCase()) ||
    item.medicines.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.medicines.brand?.toLowerCase().includes(search.toLowerCase())
  )

  const canEdit = ['owner', 'admin', 'pharmacist'].includes(userRole)

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Medicine search karein..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canEdit && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Medicine Add Karein
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Medicine</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Batch</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Expiry</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Stock</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Sale Price</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">DRAP MRP</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  Koi medicine nahi mili. Pehli medicine add karein.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const status = getStockStatus(item.stock_qty, item.reorder_level, item.expiry_date)
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.medicines.name}</p>
                      <p className="text-xs text-slate-400">{item.medicines.generic_name} • {item.medicines.strength}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.medicines.category ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{item.batch_number ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-PK') : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.stock_qty}</td>
                    <td className="px-4 py-3 text-slate-900">Rs. {item.sale_price}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {item.medicines.drap_mrp ? `Rs. ${item.medicines.drap_mrp}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <AddMedicineModal
          tenantId={tenantId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
