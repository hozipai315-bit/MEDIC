'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2024-06-20' as any,
})

export async function createCheckoutSession(plan: 'starter' | 'professional' | 'business') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const priceIds = {
    starter: process.env.STRIPE_STARTER_PRICE_ID!,
    professional: process.env.STRIPE_PRO_PRICE_ID!,
    business: process.env.STRIPE_BUSINESS_PRICE_ID!,
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price: priceIds[plan],
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      plan,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
  })

  redirect(session.url!)
}

export async function createBillingPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('stripe_customer_id')
    .eq('id', (await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()).data?.tenant_id)
    .single()

  if (!tenant?.stripe_customer_id) redirect('/pricing')

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  redirect(session.url)
}
