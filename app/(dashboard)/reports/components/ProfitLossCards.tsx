interface ProfitLossProps {
  revenue: number
  cogs: number
  grossProfit: number
  netProfit: number
  grossMargin: number
}

export default function ProfitLossCards({
  revenue,
  cogs,
  grossProfit,
  netProfit,
  grossMargin,
}: ProfitLossProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Profit & Loss</h3>
      <p className="text-sm text-slate-500 mb-6">Last 30 days — revenue vs cost breakdown</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600">Total Revenue</p>
          <p className="text-xl font-bold text-blue-900 mt-1">
            Rs. {revenue.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-600">COGS</p>
          <p className="text-xl font-bold text-red-900 mt-1">
            Rs. {cogs.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-red-400 mt-1">Cost of goods sold</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600">Gross Profit</p>
          <p className="text-xl font-bold text-green-900 mt-1">
            Rs. {grossProfit.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-green-400 mt-1">Margin: {grossMargin.toFixed(1)}%</p>
        </div>
        <div className={`rounded-xl p-4 ${netProfit >= 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
          <p className={`text-sm ${netProfit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>Net Profit</p>
          <p className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
            Rs. {netProfit.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  )
}
