import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import POSScreen from './components/POSScreen'

export default async function POSPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role, full_name')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">POS Billing</h1>
        <p className="text-slate-500 mt-1">Naya sale shuru karein</p>
      </div>
      <POSScreen
        tenantId={profile?.tenant_id ?? ''}
        userId={user.id}
        cashierName={profile?.full_name ?? ''}
      />
    </div>
  )
}
