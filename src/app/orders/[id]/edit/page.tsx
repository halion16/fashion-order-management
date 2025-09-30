'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import { Order, OrderItem, OrderStatus } from '@/types'

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'bozza', label: 'Bozza' },
  { value: 'inviato', label: 'Inviato' },
  { value: 'confermato', label: 'Confermato' },
  { value: 'in-produzione', label: 'In Produzione' },
  { value: 'controllo-qualita', label: 'Controllo Qualità' },
  { value: 'spedito', label: 'Spedito' },
  { value: 'consegnato', label: 'Consegnato' },
  { value: 'completato', label: 'Completato' },
  { value: 'annullato', label: 'Annullato' },
]

interface OrderFormData {
  supplierId: string
  status: OrderStatus
  expectedDeliveryDate: string
  actualDeliveryDate: string
  notes: string
  items: OrderItem[]
}

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { orders, suppliers, products, updateOrder, loadData } = useAppStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<OrderFormData>({
    supplierId: '',
    status: 'bozza',
    expectedDeliveryDate: '',
    actualDeliveryDate: '',
    notes: '',
    items: []
  })

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === params.id)
    if (foundOrder) {
      setOrder(foundOrder)
      setFormData({
        supplierId: foundOrder.supplierId,
        status: foundOrder.status,
        expectedDeliveryDate: foundOrder.expectedDeliveryDate.toISOString().split('T')[0],
        actualDeliveryDate: foundOrder.actualDeliveryDate
          ? foundOrder.actualDeliveryDate.toISOString().split('T')[0]
          : '',
        notes: foundOrder.notes || '',
        items: [...foundOrder.items]
      })
    }
  }, [orders, params.id])

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Ordine non trovato</h1>
        <p className="text-gray-600 mt-2">L'ordine richiesto non esiste o è stato eliminato.</p>
        <Link href="/orders" className="mt-4 inline-block">
          <Button>Torna agli Ordini</Button>
        </Link>
      </div>
    )
  }

  const updateOrderItem = (itemId: string, updates: Partial<OrderItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, ...updates }
          // Auto-calculate total price
          if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const removeOrderItem = (itemId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto dall\'ordine?')) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }))
    }
  }

  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.supplierId || !formData.expectedDeliveryDate || formData.items.length === 0) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    const updatedOrder: Order = {
      ...order,
      supplierId: formData.supplierId,
      status: formData.status,
      expectedDeliveryDate: new Date(formData.expectedDeliveryDate),
      actualDeliveryDate: formData.actualDeliveryDate
        ? new Date(formData.actualDeliveryDate)
        : undefined,
      notes: formData.notes,
      items: formData.items,
      totalAmount: calculateTotalAmount(),
      updatedAt: new Date()
    }

    updateOrder(updatedOrder)
    router.push(`/orders/${order.id}`)
  }

  const supplier = suppliers.find(s => s.id === formData.supplierId)

  const filteredItems = formData.items.filter(item => {
    if (!searchTerm) return true
    const product = products.find(p => p.id === item.productId)
    const variant = product?.variants.find(v => v.id === item.variantId)
    const searchLower = searchTerm.toLowerCase()
    return (
      product?.name.toLowerCase().includes(searchLower) ||
      product?.code.toLowerCase().includes(searchLower) ||
      variant?.color.toLowerCase().includes(searchLower) ||
      variant?.size.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/orders/${order.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Modifica Ordine
          </h1>
          <p className="text-gray-600">
            Modifica l'ordine {order.orderNumber}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Dettagli Ordine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Numero Ordine</Label>
                <Input
                  id="orderNumber"
                  value={order.orderNumber}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Data Ordine</Label>
                <Input
                  id="orderDate"
                  value={formatDate(order.orderDate)}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Fornitore</Label>
                <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona fornitore" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Stato</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as OrderStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Data Consegna Prevista</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualDeliveryDate">Data Consegna Effettiva</Label>
                <Input
                  id="actualDeliveryDate"
                  type="date"
                  value={formData.actualDeliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualDeliveryDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note</Label>
              <Input
                id="notes"
                placeholder="Note aggiuntive per l'ordine..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prodotti Ordinati ({filteredItems.length}/{formData.items.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca prodotto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-4 mb-4">
              {filteredItems.map((item) => {
                const product = products.find(p => p.id === item.productId)
                const variant = product?.variants.find(v => v.id === item.variantId)

                return (
                  <div key={item.id} className="border rounded-lg p-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrderItem(item.id)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end pr-10">
                      <div className="md:col-span-2">
                        <Label>Prodotto</Label>
                        <p className="font-medium">{product?.name || 'Prodotto sconosciuto'}</p>
                        <p className="text-sm text-gray-600">
                          {product?.code} - {variant?.color} - {variant?.size}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Quantità</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Prezzo Unitario</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateOrderItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Qtà Ricevuta</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.receivedQuantity || ''}
                          onChange={(e) => updateOrderItem(item.id, { receivedQuantity: parseInt(e.target.value) || undefined })}
                          placeholder="Non ricevuto"
                        />
                      </div>

                      <div className="text-right">
                        <Label>Totale</Label>
                        <p className="font-medium text-lg">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    </div>

                    {/* Quality info for completed orders */}
                    {(formData.status === 'completato' || formData.status === 'consegnato') && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Qualità</Label>
                          <Select
                            value={item.qualityGrade || ''}
                            onValueChange={(value) => updateOrderItem(item.id, { qualityGrade: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona qualità" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A - Eccellente</SelectItem>
                              <SelectItem value="B">B - Buona</SelectItem>
                              <SelectItem value="C">C - Accettabile</SelectItem>
                              <SelectItem value="scarto">Scarto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Pezzi Difettosi</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.defectiveQuantity || ''}
                            onChange={(e) => updateOrderItem(item.id, { defectiveQuantity: parseInt(e.target.value) || undefined })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4 bg-white">
              <div className="flex justify-end">
                <div className="text-xl font-semibold">
                  Totale Ordine: {formatCurrency(calculateTotalAmount())}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href={`/orders/${order.id}`}>
            <Button type="button" variant="outline">
              Annulla
            </Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Salva Modifiche
          </Button>
        </div>
      </form>
    </div>
  )
}