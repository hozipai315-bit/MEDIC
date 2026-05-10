'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface MonthlyData {
  week: string
  revenue: number
  growth: number
}

export default function MonthlySalesChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Monthly Sales</h3>
      <p className="text-sm text-slate-500 mb-6">Week by week comparison this month</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                name === 'growth' ? `${Number(value).toFixed(1)}%` : `Rs. ${Number(value).toLocaleString()}`,
                name === 'revenue' ? 'Revenue' : 'Growth %'
              ]}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="revenue" />
            <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="growth" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
