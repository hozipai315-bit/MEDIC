'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSale } from '@/app/actions/sales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Search, ShoppingCart } from 'lucide-react'
import CartItem from './CartItem'
import InvoiceModal from './InvoiceModal'

interface Medicine {
  id: string
  medicine_id: string
  sale_price: number
  stock_qty: number
  medicines: {
    name: string
    strength: string | null
    form: string | null
  }
}

interface Cart {
  inventoryId: string
  medicineName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  maxStock: number
}

export default function POSScreen({
  tenantId,
  userId,
  cashierName,
}: {
  tenantId: string
  userId: string
  cashierName: string
}) {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Medicine[]>([])
  const [cart, setCart] = useState<Cart[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'easypaisa' | 'jazzcash'>('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat')
  const [showInvoice, setShowInvoice] = useState(false)
  const [lastInvoiceData, setLastInvoiceData] = useState<{
    invoiceNumber: string
    cartItems: typeof cart
    subtotal: number
    discount: number
    total: number
    paymentMethod: string
  } | null>(null)
  const [cashReceived, setCashReceived] = useState(0)

  const searchMedicines = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from('store_medicines')
      .select(`
        id,
        medicine_id,
        sale_price,
        stock_qty,
        medicines (name, strength, form)
      `)
      .eq('tenant_id', tenantId)
      .ilike('medicines.name', `%${query}%`)
      .limit(8)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSearchResults((data as any) ?? [])
  }, [tenantId])

  useEffect(() => {
    const timer = setTimeout(() => searchMedicines(search), 300)
    return () => clearTimeout(timer)
  }, [search, searchMedicines])

  function addToCart(medicine: Medicine) {
    if (medicine.stock_qty === 0) {
      const override = window.confirm(
        `${medicine.medicines.name} out of stock hai. Kya phir bhi add karna chahte hain?`
      )
      if (!override) return
    }
    const existing = cart.find(item => item.inventoryId === medicine.id)
    if (existing) {
      setCart(cart.map(item =>
        item.inventoryId === medicine.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ))
    } else {
      setCart([...cart, {
        inventoryId: medicine.id,
        medicineName: `${medicine.medicines.name} ${medicine.medicines.strength ?? ''}`.trim(),
        quantity: 1,
        unitPrice: medicine.sale_price,
        totalPrice: medicine.sale_price,
        maxStock: medicine.stock_qty,
      }])
    }
    setSearch('')
    setSearchResults([])
  }

  function increaseQty(id: string) {
    setCart(cart.map(item =>
      item.inventoryId === id
        ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
        : item
    ))
  }

  function decreaseQty(id: string) {
    setCart(cart.map(item =>
      item.inventoryId === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1, totalPrice: (item.quantity - 1) * item.unitPrice }
        : item
    ))
  }

  function removeFromCart(id: string) {
    setCart(cart.filter(item => item.inventoryId !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const discountAmount = discountType === 'percentage'
    ? (subtotal * discount) / 100
    : discount
  const total = Math.max(0, subtotal - discountAmount)
  const changeAmount = Math.max(0, cashReceived - total)

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    setError(null)
    const result = await createSale({
      tenantId,
      userId,
      cartItems: cart,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
    })
    if (result.error) {
      setError(result.error)
    } else {
      setLastInvoiceData({
        invoiceNumber: result.invoiceNumber!,
        cartItems: [...cart],
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod,
      })
      setShowInvoice(true)
      setCart([])
      setDiscount(0)
      setCashReceived(0)
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left — Medicine Search */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Medicine Dhundein</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Medicine ka naam likhein... (F2)"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        {searchResults.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {searchResults.map((med) => (
              <button
                key={med.id}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                onClick={() => addToCart(med)}
              >
                <div>
                  <p className="font-medium text-slate-900">{med.medicines.name}</p>
                  <p className="text-xs text-slate-400">{med.medicines.strength} • {med.medicines.form}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">Rs. {med.sale_price}</p>
                  <p className="text-xs text-slate-400">Stock: {med.stock_qty}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {search.length >= 2 && searchResults.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">Koi medicine nahi mili</p>
        )}
      </div>

      {/* Right — Cart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Cart</h2>
          <span className="ml-auto text-sm text-slate-400">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto min-h-32">
          {cart.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Cart khali hai</p>
          ) : (
            cart.map(item => (
              <CartItem
                key={item.inventoryId}
                id={item.inventoryId}
                medicineName={item.medicineName}
                quantity={item.quantity}
                unitPrice={item.unitPrice}
                totalPrice={item.totalPrice}
                onIncrease={increaseQty}
                onDecrease={decreaseQty}
                onRemove={removeFromCart}
              />
            ))
          )}
        </div>

        <Separator className="my-4" />

        {/* Totals */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Discount</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDiscountType(discountType === 'flat' ? 'percentage' : 'flat')}
                className="text-xs bg-slate-100 px-2 py-1 rounded"
              >
                {discountType === 'flat' ? 'Rs.' : '%'}
              </button>
              <Input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-20 h-7 text-right text-sm"
              />
            </div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 text-sm">
              <span>Discount Amount</span>
              <span>- Rs. {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 text-base">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['cash', 'card', 'easypaisa', 'jazzcash'] as const).map(method => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border capitalize ${
                paymentMethod === method
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {method}
            </button>
          ))}
        </div>

        {paymentMethod === 'cash' && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-600 text-sm">
              <span>Cash Received</span>
              <Input
                type="number"
                min="0"
                value={cashReceived || ''}
                onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                className="w-24 h-7 text-right text-sm"
                placeholder="0"
              />
            </div>
            {cashReceived >= total && total > 0 && (
              <div className="flex justify-between font-medium text-green-600 text-sm">
                <span>Change</span>
                <span>Rs. {changeAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

        <Button
          className="w-full mt-4"
          disabled={cart.length === 0 || loading}
          onClick={handleCheckout}
        >
          {loading ? 'Processing...' : `Checkout — Rs. ${total.toFixed(2)}`}
        </Button>

        <p className="text-xs text-slate-400 text-center mt-2">Cashier: {cashierName}</p>

        {showInvoice && lastInvoiceData && (
          <InvoiceModal
            invoiceNumber={lastInvoiceData.invoiceNumber}
            cartItems={lastInvoiceData.cartItems}
            subtotal={lastInvoiceData.subtotal}
            discount={lastInvoiceData.discount}
            total={lastInvoiceData.total}
            paymentMethod={lastInvoiceData.paymentMethod}
            cashierName={cashierName}
            storeName="MedPOS Store"
            onClose={() => setShowInvoice(false)}
          />
        )}
      </div>
    </div>
  )
}
