interface SalesSummaryProps {
  totalRevenue: number
  todayRevenue: number
  totalTransactions: number
  todayTransactions: number
  avgOrderValue: number
  paymentBreakdown: Record<string, number>
}

export default function SalesSummary({
  totalRevenue, todayRevenue, totalTransactions,
  todayTransactions, avgOrderValue, paymentBreakdown,
}: SalesSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Revenue (30 days)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rs. {totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Aaj ki Sales</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rs. {todayRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400 mt-1">{todayTransactions} transactions</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalTransactions}</p>
          <p className="text-xs text-slate-400 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Average Order Value</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rs. {avgOrderValue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['cash', 'card', 'easypaisa', 'jazzcash'].map(method => (
            <div key={method} className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 capitalize">{method}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Rs. {(paymentBreakdown[method] ?? 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
