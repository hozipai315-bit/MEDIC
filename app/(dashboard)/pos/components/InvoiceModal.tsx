'use client'

import { useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'

interface CartItem {
  inventoryId: string
  medicineName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface InvoiceModalProps {
  invoiceNumber: string
  cartItems: CartItem[]
  subtotal: number
  discount: number
  tax?: number
  gstRate?: number
  total: number
  paymentMethod: string
  cashierName: string
  storeName: string
  onClose: () => void
}

export default function InvoiceModal({
  invoiceNumber,
  cartItems,
  subtotal,
  discount,
  tax,
  gstRate,
  total,
  paymentMethod,
  cashierName,
  storeName,
  onClose,
}: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const content = printRef.current?.innerHTML
    const win = window.open('', '_blank')
    if (!win || !content) return
    win.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 4px 8px; }
            th { border-bottom: 1px solid #000; }
            .total { font-weight: bold; font-size: 14px; }
            .center { text-align: center; }
            .right { text-align: right; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  function handleDownload() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const blob = new Blob([`
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 4px 8px; }
            th { border-bottom: 1px solid #000; }
            .total { font-weight: bold; }
            .center { text-align: center; }
            .right { text-align: right; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoiceNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invoice — {invoiceNumber}</DialogTitle>
        </DialogHeader>

        {/* Invoice Content */}
        <div ref={printRef} className="text-sm space-y-4">
          <div className="text-center">
            <p className="font-bold text-lg">{storeName}</p>
            <p className="text-slate-500">Invoice Receipt</p>
            <p className="text-slate-500">{new Date().toLocaleString('en-PK')}</p>
            <p className="font-medium mt-1">Invoice #: {invoiceNumber}</p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2">Medicine</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.inventoryId} className="border-b border-slate-100">
                  <td className="py-2">{item.medicineName}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">Rs.{item.unitPrice}</td>
                  <td className="text-right py-2">Rs.{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 border-t border-slate-200 pt-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            {tax !== undefined && tax > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>GST ({gstRate}%)</span>
                <span>+ Rs. {tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-1">
              <span>Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Payment</span>
              <span className="capitalize">{paymentMethod}</span>
            </div>
          </div>

          <div className="text-center text-slate-400 text-xs border-t border-slate-200 pt-2">
            <p>Cashier: {cashierName}</p>
            <p>Thank you for your purchase!</p>
            <p>Powered by MedPOS</p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
