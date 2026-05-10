'use client'

import { useState } from 'react'
import { markAsDisposed } from '@/app/actions/inventory'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ExpiringItem {
  id: string
  batch_number: string | null
  expiry_date: string
  stock_qty: number
  medicines: { name: string; strength: string | null } | null
}

function getDaysUntilExpiry(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function getExpiryColor(days: number) {
  if (days <= 7) return 'bg-red-100 text-red-700 border-red-200'
  if (days <= 30) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (days <= 60) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-yellow-100 text-yellow-700 border-yellow-200'
}

const FILTERS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 },
]

export default function ExpiryWidget({ items }: { items: ExpiringItem[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState(90)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const filtered = items.filter(item => {
    const days = getDaysUntilExpiry(item.expiry_date)
    return days <= filter
  })

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function selectAll() {
    setSelected(filtered.map(i => i.id))
  }

  async function handleMarkDisposed() {
    if (selected.length === 0) return
    const confirm = window.confirm(
      `${selected.length} medicine(s) ko disposed mark karna chahte hain? Stock 0 ho jayega.`
    )
    if (!confirm) return
    setLoading(true)
    await markAsDisposed(selected)
    setSelected([])
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 mb-8">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Expiry Tracking</h3>
          <p className="text-sm text-slate-500 mt-1">Expire honay wali medicines</p>
        </div>
        {selected.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleMarkDisposed}
            disabled={loading}
          >
            {loading ? 'Marking...' : `Mark ${selected.length} as Disposed`}
          </Button>
        )}
      </div>

      {/* Filter Tabs — 7/30/60/90 days */}
      <div className="px-6 pt-4 flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.days}
            onClick={() => { setFilter(f.days); setSelected([]) }}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              filter === f.days
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        {filtered.length > 0 && (
          <button
            onClick={selectAll}
            className="ml-auto text-xs text-slate-500 hover:text-slate-900 underline"
          >
            Select All ({filtered.length})
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-3">
        {filtered.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">
            Is period mein koi expiring medicine nahi ✅
          </p>
        ) : (
          filtered.map(item => {
            const days = getDaysUntilExpiry(item.expiry_date)
            return (
              <div
                key={item.id}
                className={`px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 ${
                  selected.includes(item.id) ? 'bg-slate-50' : ''
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="h-4 w-4 rounded border-slate-300"
                  onClick={e => e.stopPropagation()}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {item.medicines?.name} {item.medicines?.strength}
                  </p>
                  <p className="text-xs text-slate-400">
                    Batch: {item.batch_number ?? '—'} • Stock: {item.stock_qty}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getExpiryColor(days)}`}>
                  {days <= 0 ? 'Expired!' : `${days} days`}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
