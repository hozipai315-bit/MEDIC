import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('store_name, plan, status, trial_ends_at')
    .eq('id', (await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()).data?.tenant_id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Welcome to {tenant?.store_name ?? 'your store'} 👋
      </h1>
      <p className="text-slate-500 mb-8">
        Here is your store overview for today.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Today&apos;s Sales</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rs. 0</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Medicines</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Expiring Soon</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </div>
      </div>

      {/* Subscription Status */}
      {tenant?.status === 'trial' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          ⏳ You are on a free trial. Trial ends on{' '}
          <strong>{new Date(tenant.trial_ends_at!).toLocaleDateString()}</strong>.{' '}
          <a href="/billing" className="underline font-medium">Upgrade now</a>
        </div>
      )}
    </div>
  )
}
