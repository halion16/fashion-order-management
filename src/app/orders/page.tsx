'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, getOrderStatusColor } from '@/lib/utils'
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Order, OrderStatus } from '@/types'

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

export default function OrdersPage() {
  const { orders, suppliers, loadData, deleteOrder } = useAppStore()
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [supplierFilter, setSupplierFilter] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suppliers.find(s => s.id === order.supplierId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (supplierFilter !== 'all') {
      filtered = filtered.filter(order => order.supplierId === supplierFilter)
    }

    setFilteredOrders(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [orders, searchTerm, statusFilter, supplierFilter, suppliers])

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      deleteOrder(orderId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gestione Ordini
          </h1>
          <p className="text-gray-600">
            Visualizza e gestisci tutti gli ordini ai fornitori
          </p>
        </div>
        <Link href="/orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Ordine
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca per numero ordine o fornitore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per fornitore" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i fornitori</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Ordini ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto mb-4 text-gray-400">
                📋
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun ordine trovato
              </h3>
              <p className="text-gray-500 mb-4">
                {orders.length === 0
                  ? 'Non ci sono ordini nel sistema'
                  : 'Nessun ordine corrisponde ai filtri selezionati'
                }
              </p>
              <Link href="/orders/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Primo Ordine
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Numero Ordine
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Fornitore
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Data Ordine
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Consegna Prevista
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Importo
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Stato
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const supplier = suppliers.find(s => s.id === order.supplierId)
                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-blue-600">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">
                            {supplier?.name || 'Fornitore sconosciuto'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supplier?.email}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {formatDate(order.expectedDeliveryDate)}
                        </td>
                        <td className="py-4 px-4 font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                            {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/orders/${order.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}