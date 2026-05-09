'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Phone, Mail } from 'lucide-react'
import AddCustomerModal from './AddCustomerModal'
import CustomerPurchaseHistory from './CustomerPurchaseHistory'

interface Customer {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  address: string | null
  cnic: string | null
  credit_balance: number
  total_spent: number
  created_at: string
}

export default function CustomersTable({
  customers,
  userRole,
}: {
  customers: Customer[]
  userRole: string
}) {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.cnic?.includes(search)
  )

  const canEdit = ['owner', 'admin'].includes(userRole)

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Naam, phone ya CNIC se dhundein..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canEdit && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Customer Add Karein
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Contact</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">CNIC</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Credit Balance</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Total Spent</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Koi customer nahi mila. Pehla customer add karein.
                </td>
              </tr>
            ) : (
              filtered.map(customer => (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{customer.full_name}</p>
                    <p className="text-xs text-slate-400">
                      Since {new Date(customer.created_at).toLocaleDateString('en-PK')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {customer.phone && (
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <Phone className="h-3 w-3" /> {customer.phone}
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-1 text-slate-600 text-xs mt-1">
                        <Mail className="h-3 w-3" /> {customer.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{customer.cnic ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${customer.credit_balance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      Rs. {customer.credit_balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    Rs. {customer.total_spent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer)}>
                      History
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} />}
      {selectedCustomer && (
        <CustomerPurchaseHistory customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  )
}
