'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCustomer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('customers').insert({
    tenant_id: profile?.tenant_id,
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    address: formData.get('address') as string || null,
    cnic: formData.get('cnic') as string || null,
    credit_balance: parseFloat(formData.get('credit_balance') as string) || 0,
  })

  if (error) return { error: error.message }
  revalidatePath('/customers')
  return { success: true }
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('customers').update({
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    address: formData.get('address') as string || null,
    cnic: formData.get('cnic') as string || null,
    credit_balance: parseFloat(formData.get('credit_balance') as string) || 0,
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/customers')
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/customers')
  return { success: true }
}
