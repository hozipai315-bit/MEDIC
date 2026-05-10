import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import {
  LayoutDashboard, ShoppingCart, Package,
  Users, Truck, BarChart2, Settings
} from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, tenant_id')
    .eq('id', user.id)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('store_name, plan, status')
    .eq('id', profile?.tenant_id)
    .single()

  // Low stock badge count — FR-INV-007
  const { count: lowStockCount } = await supabase
    .from('store_medicines')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', profile?.tenant_id)
    .filter('stock_qty', 'lte', 'reorder_level')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">MedPOS</h1>
          <p className="text-sm text-slate-500 mt-1 truncate">{tenant?.store_name}</p>
          <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded capitalize">
            {tenant?.plan}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/pos" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium">
            <ShoppingCart className="h-4 w-4" />
            POS Billing
          </Link>
          <Link href="/inventory" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium">
            <Package className="h-4 w-4" />
            Inventory
            {lowStockCount && lowStockCount > 0 ? (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {lowStockCount}
              </span>
            ) : null}
          </Link>
          <Link href="/customers" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium">
            <Users className="h-4 w-4" />
            Customers
          </Link>
          <Link href="/suppliers" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium">
            <Truck className="h-4 w-4" />
            Suppliers
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium">
            <BarChart2 className="h-4 w-4" />
            Reports
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-1">{profile?.full_name}</p>
          <p className="text-xs text-slate-400 capitalize mb-3">{profile?.role}</p>
          <form action={logout}>
            <button type="submit" className="w-full text-xs text-red-500 hover:text-red-700 text-left">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
