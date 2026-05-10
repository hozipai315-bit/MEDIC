import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createCheckoutSession, createBillingPortalSession } from '@/app/actions/stripe'

const plans = [
  {
    name: 'Starter',
    price: 'Rs. 1,499',
    period: '/month',
    plan: 'starter' as const,
    features: ['1 User', 'POS Billing', 'Basic Inventory', 'Daily Reports', '100 Customers'],
  },
  {
    name: 'Professional',
    price: 'Rs. 2,999',
    period: '/month',
    plan: 'professional' as const,
    features: ['5 Users', 'Full Inventory', 'Supplier Management', 'Full Reports + CSV', 'Unlimited Customers'],
    highlighted: true,
  },
  {
    name: 'Business',
    price: 'Rs. 5,499',
    period: '/month',
    plan: 'business' as const,
    features: ['15 Users', 'All Pro Features', 'Shift Management', 'Priority Support', 'Custom Branding'],
  },
]

export default async function BillingPage() {
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
    .select('plan, status, trial_ends_at, subscription_ends_at, stripe_customer_id')
    .eq('id', profile?.tenant_id)
    .single()

  const isExpired = tenant?.status === 'expired'
  const isTrial = tenant?.status === 'trial'
  const isActive = tenant?.status === 'active'
  const hasStripe = !!tenant?.stripe_customer_id

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-500 mt-1">Apna plan manage karein</p>
      </div>

      {/* Current Status Banner */}
      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <p className="text-red-800 font-medium">⚠️ Aapki subscription expire ho gayi hai.</p>
          <p className="text-red-600 text-sm mt-1">Dashboard access ke liye neeche se plan select karein.</p>
        </div>
      )}
      {isTrial && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 font-medium">
            ⏳ Free trial — {new Date(tenant.trial_ends_at!).toLocaleDateString('en-PK')} tak
          </p>
          <p className="text-amber-600 text-sm mt-1">Trial khatam hone se pehle upgrade karein.</p>
        </div>
      )}
      {isActive && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
          <p className="text-green-800 font-medium">
            ✅ Active — {tenant.plan} plan
          </p>
          <p className="text-green-600 text-sm mt-1">
            Next billing: {tenant.subscription_ends_at
              ? new Date(tenant.subscription_ends_at).toLocaleDateString('en-PK')
              : '—'}
          </p>
        </div>
      )}

      {/* Manage Existing Subscription */}
      {isActive && hasStripe && (
        <div className="mb-8">
          <form action={createBillingPortalSession}>
            <button
              type="submit"
              className="bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-slate-700"
            >
              Manage Subscription →
            </button>
          </form>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 flex flex-col ${
              plan.highlighted
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-slate-200 bg-white'
            } ${tenant?.plan === plan.plan && isActive ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.highlighted && (
              <span className="text-xs font-medium bg-blue-600 text-white px-3 py-1 rounded-full self-start mb-3">
                Most Popular
              </span>
            )}
            {tenant?.plan === plan.plan && isActive && (
              <span className="text-xs font-medium bg-green-500 text-white px-3 py-1 rounded-full self-start mb-3">
                Current Plan
              </span>
            )}
            <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
            <div className="flex items-baseline gap-1 my-3">
              <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
              <span className="text-slate-500 text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            {!(tenant?.plan === plan.plan && isActive) && (
              <form action={createCheckoutSession.bind(null, plan.plan)}>
                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-700'
                  }`}
                >
                  {isExpired ? 'Renew' : 'Upgrade'} to {plan.name}
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
