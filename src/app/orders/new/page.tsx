'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateId, formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { Order, OrderItem, ProductionMilestone } from '@/types'

interface OrderFormData {
  supplierId: string
  expectedDeliveryDate: string
  notes: string
  items: OrderItem[]
}

export default function NewOrderPage() {
  const router = useRouter()
  const { suppliers, products, addOrder, loadData } = useAppStore()
  const [formData, setFormData] = useState<OrderFormData>({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
    items: []
  })

  useEffect(() => {
    loadData()
  }, [loadData])

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: generateId(),
      productId: '',
      variantId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeOrderItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
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

  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const generateOrderNumber = () => {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD-${year}-${month}-${random}`
  }

  const createDefaultMilestones = (deliveryDate: Date): ProductionMilestone[] => {
    const orderDate = new Date()
    const diffDays = Math.ceil((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

    return [
      {
        id: generateId(),
        name: 'Conferma Ordine',
        description: 'Conferma ordine dal fornitore',
        expectedDate: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'programmato'
      },
      {
        id: generateId(),
        name: 'Inizio Produzione',
        description: 'Avvio della produzione',
        expectedDate: new Date(orderDate.getTime() + Math.floor(diffDays * 0.2) * 24 * 60 * 60 * 1000),
        status: 'programmato'
      },
      {
        id: generateId(),
        name: 'Controllo Qualità',
        description: 'Controllo qualità intermedio',
        expectedDate: new Date(orderDate.getTime() + Math.floor(diffDays * 0.7) * 24 * 60 * 60 * 1000),
        status: 'programmato'
      },
      {
        id: generateId(),
        name: 'Spedizione',
        description: 'Spedizione del prodotto finito',
        expectedDate: deliveryDate,
        status: 'programmato'
      }
    ]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.supplierId || !formData.expectedDeliveryDate || formData.items.length === 0) {
      alert('Compila tutti i campi obbligatori e aggiungi almeno un prodotto')
      return
    }

    const order: Order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      supplierId: formData.supplierId,
      status: 'bozza',
      items: formData.items,
      totalAmount: calculateTotalAmount(),
      orderDate: new Date(),
      expectedDeliveryDate: new Date(formData.expectedDeliveryDate),
      notes: formData.notes,
      productionMilestones: createDefaultMilestones(new Date(formData.expectedDeliveryDate)),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    addOrder(order)
    router.push('/orders')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Nuovo Ordine
          </h1>
          <p className="text-gray-600">
            Crea un nuovo ordine per un fornitore
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
                <Label htmlFor="supplier">Fornitore *</Label>
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
                <Label htmlFor="deliveryDate">Data Consegna Prevista *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Prodotti Ordinati</CardTitle>
            <Button type="button" onClick={addOrderItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prodotto
            </Button>
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nessun prodotto aggiunto</p>
                <p className="text-sm">Clicca "Aggiungi Prodotto" per iniziare</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item) => {
                  const product = products.find(p => p.id === item.productId)
                  const variant = product?.variants.find(v => v.id === item.variantId)

                  return (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Prodotto</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => {
                              updateOrderItem(item.id, {
                                productId: value,
                                variantId: '',
                                unitPrice: 0
                              })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona prodotto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Variante</Label>
                          <Select
                            value={item.variantId}
                            onValueChange={(value) => {
                              const selectedVariant = product?.variants.find(v => v.id === value)
                              updateOrderItem(item.id, {
                                variantId: value,
                                unitPrice: selectedVariant?.costPrice || 0
                              })
                            }}
                            disabled={!item.productId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona variante" />
                            </SelectTrigger>
                            <SelectContent>
                              {product?.variants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.color} - {variant.size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-gray-600">Totale: </span>
                            <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="text-lg font-semibold">
                      Totale Ordine: {formatCurrency(calculateTotalAmount())}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/orders">
            <Button type="button" variant="outline">
              Annulla
            </Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Crea Ordine
          </Button>
        </div>
      </form>
    </div>
  )
}