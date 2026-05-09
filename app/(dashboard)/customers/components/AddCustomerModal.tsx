'use client'

import { useState } from 'react'
import { addCustomer } from '@/app/actions/customers'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddCustomerModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await addCustomer(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Naya Customer Add Karein</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" name="full_name" placeholder="Ahmed Khan" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="03001234567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC</Label>
              <Input id="cnic" name="cnic" placeholder="42101-1234567-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="ahmed@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="House #, Street, City" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credit_balance">Opening Credit Balance (Rs.)</Label>
            <Input id="credit_balance" name="credit_balance" type="number" step="0.01" defaultValue="0" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Customer Add Karein'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
