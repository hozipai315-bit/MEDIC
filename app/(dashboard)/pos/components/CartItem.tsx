'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CartItemProps {
  id: string
  medicineName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
  onRemove: (id: string) => void
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
}: CartItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{medicineName}</p>
        <p className="text-xs text-slate-400">Rs. {unitPrice} per unit</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onDecrease(id)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onIncrease(id)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:text-red-700"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium text-slate-900 w-20 text-right">
          Rs. {totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
