import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomersTable from './components/CustomersTable'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('total_spent', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-500 mt-1">Apne customers manage karein</p>
      </div>
      <CustomersTable
        customers={customers ?? []}
        userRole={profile?.role ?? 'cashier'}
      />
    </div>
  )
}
