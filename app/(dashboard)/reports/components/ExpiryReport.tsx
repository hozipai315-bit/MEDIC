interface ExpiryItem {
  id: string
  batch_number: string | null
  expiry_date: string | null
  stock_qty: number
  sale_price: number
  medicines: { name: string; strength: string | null } | null
}

function getDaysUntilExpiry(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function getExpiryColor(days: number) {
  if (days <= 7) return 'bg-red-100 text-red-700'
  if (days <= 30) return 'bg-orange-100 text-orange-700'
  return 'bg-yellow-100 text-yellow-700'
}

export default function ExpiryReport({ expiringItems }: { expiringItems: ExpiryItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Expiry Report</h3>
        <p className="text-sm text-slate-500 mt-1">Aglay 90 din mein expire honay wali medicines</p>
      </div>
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {expiringItems.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">Koi medicine expire honay wali nahi</p>
        ) : (
          expiringItems.map(item => {
            const days = getDaysUntilExpiry(item.expiry_date!)
            return (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{item.medicines?.name}</p>
                  <p className="text-xs text-slate-400">Batch: {item.batch_number ?? '—'} • Stock: {item.stock_qty}</p>
                  <p className="text-xs text-slate-400">Value at risk: Rs. {(item.stock_qty * item.sale_price).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getExpiryColor(days)}`}>
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
