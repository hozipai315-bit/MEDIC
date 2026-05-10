'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CartItemProps {
  id: string
  medicineName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
  onRemove: (id: string) => void
  onPriceOverride: (id: string, newPrice: number) => void
  canOverridePrice: boolean
}

export default function CartItem({
  id,
  medicineName,
  quantity,
  unitPrice,
  totalPrice,
  onIncrease,
  onDecrease,
  onRemove,
  onPriceOverride,
  canOverridePrice,
}: CartItemProps) {
  const [editingPrice, setEditingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState(unitPrice)

  function handlePriceConfirm() {
    if (newPrice > 0) {
      onPriceOverride(id, newPrice)
    }
    setEditingPrice(false)
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{medicineName}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {editingPrice ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="h-6 w-20 text-xs"
                autoFocus
              />
              <button onClick={handlePriceConfirm} className="text-green-600">
                <Check className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-xs text-slate-400">Rs. {unitPrice} per unit</p>
              {canOverridePrice && (
                <button
                  onClick={() => setEditingPrice(true)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onDecrease(id)}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onIncrease(id)}>
          <Plus className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => onRemove(id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium text-slate-900 w-20 text-right">
          Rs. {totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
