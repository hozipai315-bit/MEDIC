'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Download, Pencil, ArrowUpDown } from 'lucide-react'
import AddMedicineModal from './AddMedicineModal'
import EditMedicineModal from './EditMedicineModal'
import StockAdjustmentModal from './StockAdjustmentModal'
import BulkPriceUpdateModal from './BulkPriceUpdateModal'

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
  barcode: string | null
  medicines: Medicine
}

function getStockStatus(qty: number, reorderLevel: number, expiryDate: string | null) {
  if (qty === 0) return { label: 'Out of Stock', variant: 'destructive' as const }
  if (qty <= reorderLevel) return { label: 'Low Stock', variant: 'secondary' as const }
  if (expiryDate) {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days <= 30) return { label: 'Expiring Soon', variant: 'secondary' as const }
  }
  return { label: 'In Stock', variant: 'default' as const }
}

function downloadCSV(inventory: InventoryItem[]) {
  const headers = ['Medicine', 'Generic', 'Brand', 'Category', 'Form', 'Strength', 'Batch', 'Expiry', 'Stock', 'Purchase Price', 'Sale Price', 'DRAP MRP', 'Margin %', 'Status']
  const rows = inventory.map(item => {
    const margin = item.purchase_price > 0
      ? (((item.sale_price - item.purchase_price) / item.purchase_price) * 100).toFixed(1)
      : '0'
    const status = getStockStatus(item.stock_qty, item.reorder_level, item.expiry_date)
    return [
      item.medicines.name,
      item.medicines.generic_name ?? '',
      item.medicines.brand ?? '',
      item.medicines.category ?? '',
      item.medicines.form ?? '',
      item.medicines.strength ?? '',
      item.batch_number ?? '',
      item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-PK') : '',
      item.stock_qty.toString(),
      item.purchase_price.toFixed(2),
      item.sale_price.toFixed(2),
      item.medicines.drap_mrp?.toFixed(2) ?? '',
      margin + '%',
      status.label,
    ]
  })
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'medpos-inventory.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const ITEMS_PER_PAGE = 50

export type { InventoryItem }

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
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [showBulkPrice, setShowBulkPrice] = useState(false)

  const canEdit = ['owner', 'admin', 'pharmacist'].includes(userRole)

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(inventory.map(i => i.medicines.category).filter(Boolean)))] as string[]

  // Filter
  const filtered = inventory.filter(item => {
    const matchSearch =
      item.medicines.name.toLowerCase().includes(search.toLowerCase()) ||
      item.medicines.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.medicines.brand?.toLowerCase().includes(search.toLowerCase())

    const matchCategory = categoryFilter === 'all' || item.medicines.category === categoryFilter

    const status = getStockStatus(item.stock_qty, item.reorder_level, item.expiry_date)
    const matchStatus = statusFilter === 'all' || status.label === statusFilter

    return matchSearch && matchCategory && matchStatus
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Medicine search karein..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
        >
          <option value="all">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Expiring Soon">Expiring Soon</option>
        </select>

        <Button variant="outline" onClick={() => downloadCSV(inventory)}>
          <Download className="h-4 w-4 mr-2" />
          CSV Export
        </Button>

        {canEdit && (
          <Button variant="outline" onClick={() => setShowBulkPrice(true)}>
            Bulk Price Update
          </Button>
        )}

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
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Margin %</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">DRAP MRP</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
              {canEdit && <th className="text-left px-4 py-3 text-slate-600 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-slate-400">
                  Koi medicine nahi mili.
                </td>
              </tr>
            ) : (
              paginated.map((item) => {
                const status = getStockStatus(item.stock_qty, item.reorder_level, item.expiry_date)
                const margin = item.purchase_price > 0
                  ? (((item.sale_price - item.purchase_price) / item.purchase_price) * 100).toFixed(1)
                  : '0'
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
                    <td className="px-4 py-3">
                      <span className={`font-medium ${parseFloat(margin) >= 20 ? 'text-green-600' : parseFloat(margin) >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {item.medicines.drap_mrp ? `Rs. ${item.medicines.drap_mrp}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(item)}>
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setAdjustItem(item)}>
                            <ArrowUpDown className="h-3 w-3 mr-1" /> Stock
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddMedicineModal tenantId={tenantId} onClose={() => setShowAddModal(false)} />
      )}
      {editItem && (
        <EditMedicineModal item={editItem} onClose={() => setEditItem(null)} />
      )}
      {adjustItem && (
        <StockAdjustmentModal item={adjustItem} onClose={() => setAdjustItem(null)} />
      )}
      {showBulkPrice && (
        <BulkPriceUpdateModal
          categories={categories.filter(c => c !== 'all')}
          tenantId={tenantId}
          onClose={() => setShowBulkPrice(false)}
        />
      )}
    </div>
  )
}
