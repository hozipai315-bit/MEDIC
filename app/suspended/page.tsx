import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SuspendedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('store_name')
    .eq('id', profile?.tenant_id)
    .single()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <Card className="max-w-md w-full shadow-lg rounded-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <p className="text-xl font-bold text-[#1E3A5F]">MedPOS</p>
          <div className="flex justify-center my-6 text-[#DC2626]">
            <ShieldAlert size={64} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Account Suspended
          </CardTitle>
          {tenant?.store_name && (
            <p className="text-slate-500 font-medium mt-1">{tenant.store_name}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-slate-600">
            Your MedPOS account has been suspended. This may be due to a billing issue or a policy violation.
            Please contact support or go to the billing page to resolve this.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              asChild
              className="w-full border-slate-200 text-slate-700"
            >
              <a href="mailto:support@medpos.pk">Contact Support</a>
            </Button>
            <Button
              asChild
              className="w-full bg-[#1E3A5F] hover:bg-[#152a44] text-white"
            >
              <a href="/billing">Go to Billing</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
