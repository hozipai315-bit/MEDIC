'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CartItem {
  inventoryId: string
  medicineName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface CreateSaleParams {
  tenantId: string
  userId: string
  customerId?: string
  cartItems: CartItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'easypaisa' | 'jazzcash'
  notes?: string
}

export async function createSale(params: CreateSaleParams) {
  const supabase = await createClient()

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}`

  // Create sale record
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      tenant_id: params.tenantId,
      customer_id: params.customerId || null,
      sold_by: params.userId,
      invoice_number: invoiceNumber,
      subtotal: params.subtotal,
      discount: params.discount,
      tax: params.tax,
      total: params.total,
      payment_method: params.paymentMethod,
      status: 'completed',
      notes: params.notes || null,
    })
    .select()
    .single()

  if (saleError) return { error: saleError.message }

  // Insert sale items
  const saleItems = params.cartItems.map(item => ({
    sale_id: sale.id,
    store_medicine_id: item.inventoryId,
    medicine_name: item.medicineName,
    qty: item.quantity,
    unit_price: item.unitPrice,
    discount: 0,
    subtotal: item.totalPrice,
  }))

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) return { error: itemsError.message }

  // Auto-update customer total_spent
  if (params.customerId) {
    const { data: customer } = await supabase
      .from('customers')
      .select('total_spent')
      .eq('id', params.customerId)
      .single()

    if (customer) {
      await supabase
        .from('customers')
        .update({
          total_spent: customer.total_spent + params.total,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.customerId)
    }
  }

  // Deduct stock for each item
  for (const item of params.cartItems) {
    const { data: current } = await supabase
      .from('store_medicines')
      .select('stock_qty')
      .eq('id', item.inventoryId)
      .single()

    if (current) {
      await supabase
        .from('store_medicines')
        .update({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stock_qty: (current as any).stock_qty - item.quantity
        })
        .eq('id', item.inventoryId)
    }
  }

  revalidatePath('/inventory')
  revalidatePath('/pos')

  return { success: true, invoiceNumber, saleId: sale.id }
}
