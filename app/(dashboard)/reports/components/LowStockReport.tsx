interface LowStockItem {
  id: string
  stock_qty: number
  reorder_level: number
  sale_price: number
  medicines: { name: string; strength: string | null; manufacturer: string | null } | null
}

export default function LowStockReport({ lowStockItems }: { lowStockItems: LowStockItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Low Stock Report</h3>
        <p className="text-sm text-slate-500 mt-1">Reorder level se kam stock wali medicines</p>
      </div>
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {lowStockItems.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">Sab medicines ka stock theek hai</p>
        ) : (
          lowStockItems.map(item => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 text-sm">{item.medicines?.name}</p>
                <p className="text-xs text-slate-400">{item.medicines?.manufacturer ?? '—'}</p>
                <p className="text-xs text-slate-400">Reorder at: {item.reorder_level} units</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-red-600">{item.stock_qty} left</span>
                <p className="text-xs text-slate-400 mt-1">Order: {item.reorder_level - item.stock_qty} units</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
