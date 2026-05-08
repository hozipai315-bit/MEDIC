import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InventoryTable from './components/InventoryTable'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const { data: inventory } = await supabase
    .from('store_medicines')
    .select(`
      *,
      medicines (
        name,
        generic_name,
        brand,
        category,
        form,
        strength,
        manufacturer,
        drap_mrp
      )
    `)
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 mt-1">Apni store ki medicines manage karein</p>
        </div>
      </div>
      <InventoryTable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inventory={(inventory as any) ?? []}
        tenantId={profile?.tenant_id ?? ''}
        userRole={profile?.role ?? 'cashier'}
      />
    </div>
  )
}
