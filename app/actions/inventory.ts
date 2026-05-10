'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function editMedicine(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('store_medicines')
    .update({
      sale_price: parseFloat(formData.get('sale_price') as string),
      purchase_price: parseFloat(formData.get('purchase_price') as string),
      expiry_date: formData.get('expiry_date') as string || null,
      reorder_level: parseInt(formData.get('reorder_level') as string) || 10,
      batch_number: formData.get('batch_number') as string || null,
      barcode: formData.get('barcode') as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true }
}

export async function bulkPriceUpdate(
  tenantId: string,
  category: string,
  updateType: 'percentage' | 'flat',
  value: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get all medicines in category for this tenant
  const { data: items } = await supabase
    .from('store_medicines')
    .select('id, sale_price, medicines!inner(category)')
    .eq('tenant_id', tenantId)
    .eq('medicines.category', category)

  if (!items || items.length === 0) return { error: 'Is category mein koi medicine nahi' }

  // Update each item
  for (const item of items) {
    const newPrice = updateType === 'percentage'
      ? item.sale_price * (1 + value / 100)
      : item.sale_price + value

    await supabase
      .from('store_medicines')
      .update({
        sale_price: parseFloat(Math.max(0, newPrice).toFixed(2)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)
  }

  revalidatePath('/inventory')
  return { success: true, updatedCount: items.length }
}

export async function adjustStock(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const adjustment = parseInt(formData.get('adjustment') as string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reason = formData.get('reason') as string

  // Get current stock
  const { data: current } = await supabase
    .from('store_medicines')
    .select('stock_qty')
    .eq('id', id)
    .single()

  if (!current) return { error: 'Medicine not found' }

  const newQty = Math.max(0, current.stock_qty + adjustment)

  const { error } = await supabase
    .from('store_medicines')
    .update({
      stock_qty: newQty,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true, newQty }
}

export async function addCustomMedicine(formData: FormData, tenantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // First create medicine in medicines table as private
  const { data: medicine, error: medError } = await supabase
    .from('medicines')
    .insert({
      name: formData.get('name') as string,
      generic_name: formData.get('generic_name') as string || null,
      brand: formData.get('brand') as string || null,
      category: formData.get('category') as string || null,
      form: formData.get('form') as string || null,
      strength: formData.get('strength') as string || null,
      manufacturer: formData.get('manufacturer') as string || null,
      scope: 'private',
      tenant_id: tenantId,
      submitted_by: user.id,
    })
    .select()
    .single()

  if (medError) return { error: medError.message }

  // Then add to store inventory
  const { error: invError } = await supabase
    .from('store_medicines')
    .insert({
      tenant_id: tenantId,
      medicine_id: medicine.id,
      batch_number: formData.get('batch_number') as string || null,
      expiry_date: formData.get('expiry_date') as string || null,
      stock_qty: parseInt(formData.get('stock_qty') as string) || 0,
      purchase_price: parseFloat(formData.get('purchase_price') as string),
      sale_price: parseFloat(formData.get('sale_price') as string),
      reorder_level: parseInt(formData.get('reorder_level') as string) || 10,
    })

  if (invError) return { error: invError.message }
  revalidatePath('/inventory')
  return { success: true }
}

export async function exportInventoryCSV(tenantId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('store_medicines')
    .select(`
      *,
      medicines (name, generic_name, brand, category, form, strength, manufacturer, drap_mrp)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return { data: data ?? [] }
}

export async function markAsDisposed(ids: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('store_medicines')
    .update({
      stock_qty: 0,
      updated_at: new Date().toISOString(),
    })
    .in('id', ids)

  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return { success: true }
}
