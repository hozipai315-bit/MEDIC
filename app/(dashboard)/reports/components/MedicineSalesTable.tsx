interface MedicineSale { name: string; qty: number; revenue: number }

export default function MedicineSalesTable({ medicineSalesData }: { medicineSalesData: MedicineSale[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Top Selling Medicines</h3>
        <p className="text-sm text-slate-500 mt-1">Revenue aur quantity ke hisaab se</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-3 text-slate-600 font-medium">#</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Medicine</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Qty Sold</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {medicineSalesData.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-slate-400">Koi sales data nahi</td></tr>
            ) : (
              medicineSalesData.map((item, index) => (
                <tr key={item.name} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-400">{index + 1}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-3 text-slate-600">{item.qty}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">Rs. {item.revenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
