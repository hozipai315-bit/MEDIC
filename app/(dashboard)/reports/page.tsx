import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SalesChart from './components/SalesChart'
import SalesSummary from './components/SalesSummary'
import MedicineSalesTable from './components/MedicineSalesTable'
import ExpiryReport from './components/ExpiryReport'
import LowStockReport from './components/LowStockReport'
import ExportButtons from './components/ExportButtons'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.tenant_id

  // Last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Sales data
  const { data: sales } = await supabase
    .from('sales')
    .select('id, total, discount, tax, created_at, payment_method, status')
    .eq('tenant_id', tenantId)
    .eq('status', 'completed')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Sale items for medicine sales report
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('medicine_name, qty, unit_price, subtotal, sale_id')
    .in('sale_id', (sales ?? []).map(s => s.id))

  // Expiry report — expiring in 90 days
  const ninetyDaysFromNow = new Date()
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)

  const { data: expiringItems } = await supabase
    .from('store_medicines')
    .select('id, batch_number, expiry_date, stock_qty, sale_price, medicines(name, strength)')
    .eq('tenant_id', tenantId)
    .lte('expiry_date', ninetyDaysFromNow.toISOString())
    .gt('stock_qty', 0)
    .order('expiry_date', { ascending: true })

  // Low stock report
  const { data: lowStockItems } = await supabase
    .from('store_medicines')
    .select('id, stock_qty, reorder_level, sale_price, medicines(name, strength, manufacturer)')
    .eq('tenant_id', tenantId)
    .filter('stock_qty', 'lte', 'reorder_level')
    .order('stock_qty', { ascending: true })

  // Today stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySales = (sales ?? []).filter(s => new Date(s.created_at) >= today)
  const totalRevenue = (sales ?? []).reduce((sum, s) => sum + s.total, 0)
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const totalTransactions = (sales ?? []).length
  const todayTransactions = todaySales.length
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  // Group by date for chart
  const salesByDate = (sales ?? []).reduce((acc: Record<string, number>, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
    acc[date] = (acc[date] ?? 0) + sale.total
    return acc
  }, {})
  const chartData = Object.entries(salesByDate).map(([date, revenue]) => ({
    date,
    revenue: parseFloat(revenue.toFixed(2))
  }))

  // Payment breakdown
  const paymentBreakdown = (sales ?? []).reduce((acc: Record<string, number>, sale) => {
    acc[sale.payment_method] = (acc[sale.payment_method] ?? 0) + sale.total
    return acc
  }, {})

  // Medicine sales — group by medicine name
  const medicineSales = (saleItems ?? []).reduce((acc: Record<string, { qty: number, revenue: number }>, item) => {
    if (!acc[item.medicine_name]) acc[item.medicine_name] = { qty: 0, revenue: 0 }
    acc[item.medicine_name].qty += item.qty
    acc[item.medicine_name].revenue += item.subtotal
    return acc
  }, {})
  const medicineSalesData = Object.entries(medicineSales)
    .map(([name, data]) => ({ name, qty: data.qty, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-500 mt-1">Pichhle 30 din ki complete analysis</p>
        </div>
        <ExportButtons sales={sales ?? []} medicineSalesData={medicineSalesData} />
      </div>

      <SalesSummary
        totalRevenue={totalRevenue}
        todayRevenue={todayRevenue}
        totalTransactions={totalTransactions}
        todayTransactions={todayTransactions}
        avgOrderValue={avgOrderValue}
        paymentBreakdown={paymentBreakdown}
      />

      <div className="mt-8">
        <SalesChart chartData={chartData} />
      </div>

      <div className="mt-8">
        <MedicineSalesTable medicineSalesData={medicineSalesData} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ExpiryReport expiringItems={(expiringItems as any) ?? []} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LowStockReport lowStockItems={(lowStockItems as any) ?? []} />
      </div>
    </div>
  )
}
