'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface WeeklyData {
  day: string
  revenue: number
  avgSaleValue: number
}

export default function WeeklySalesChart({ data }: { data: WeeklyData[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Weekly Sales</h3>
      <p className="text-sm text-slate-500 mb-6">Last 7 days — day by day revenue trend</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `Rs. ${Number(value).toLocaleString()}`,
                name === 'revenue' ? 'Revenue' : 'Avg Sale Value'
              ]}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="revenue" />
            <Line type="monotone" dataKey="avgSaleValue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="avgSaleValue" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
