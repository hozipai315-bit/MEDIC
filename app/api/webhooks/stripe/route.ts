import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2024-06-20' as any,
})

// Helper to get supabase client only when needed
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan as 'starter' | 'professional' | 'business'

      if (!userId || !plan) break

      // Get customer email from Stripe
      const customer = await stripe.customers.retrieve(session.customer as string)
      const email = (customer as Stripe.Customer).email ?? ''

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, full_name')
        .eq('id', userId)
        .single()

      if (profile?.tenant_id) {
        // Update existing tenant
        await supabase
          .from('tenants')
          .update({
            plan,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_starts_at: new Date().toISOString(),
            subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.tenant_id)
      } else {
        // Get user info from Supabase Auth
        const { data: authUser } = await supabase.auth.admin.getUserById(userId)
        const fullName = authUser?.user?.user_metadata?.full_name ?? ''
        const storeName = authUser?.user?.user_metadata?.store_name ?? ''
        const phone = authUser?.user?.user_metadata?.phone ?? ''

        // Create new tenant
        const { data: newTenant } = await supabase
          .from('tenants')
          .insert({
            store_name: storeName,
            owner_name: fullName,
            email,
            phone,
            plan,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_starts_at: new Date().toISOString(),
            subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single()

        if (newTenant) {
          // Link profile to tenant
          await supabase
            .from('profiles')
            .update({ tenant_id: newTenant.id, role: 'owner' })
            .eq('id', userId)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('tenants')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status === 'active' ? 'active' : 'expired'
      await supabase
        .from('tenants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
