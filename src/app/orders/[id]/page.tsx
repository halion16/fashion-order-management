'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatDateTime, getOrderStatusColor } from '@/lib/utils'
import { ArrowLeft, Edit, Trash2, Package, CheckCircle, Clock, AlertTriangle, Calendar, DollarSign, Truck, Award, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { OrderStatus, MilestoneStatus } from '@/types'

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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { orders, suppliers, products, updateOrder, deleteOrder, loadData } = useAppStore()
  const [order, setOrder] = useState(orders.find(o => o.id === params.id))

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === params.id)
    setOrder(foundOrder)
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

  const supplier = suppliers.find(s => s.id === order.supplierId)

  const handleStatusChange = (newStatus: OrderStatus) => {
    const updatedOrder = { ...order, status: newStatus, updatedAt: new Date() }
    updateOrder(updatedOrder)
    setOrder(updatedOrder)
  }

  const handleDeleteOrder = () => {
    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      deleteOrder(order.id)
      router.push('/orders')
    }
  }

  const getMilestoneIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completato':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in-corso':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'ritardato':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getMilestoneColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completato':
        return 'bg-green-100 border-green-200'
      case 'in-corso':
        return 'bg-blue-100 border-blue-200'
      case 'ritardato':
        return 'bg-red-100 border-red-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Dettagli dell'ordine
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link href={`/orders/${order.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDeleteOrder}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Generali</span>
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Collezione</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Prodotti</span>
          </TabsTrigger>
          <TabsTrigger value="commercial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Commerciale</span>
          </TabsTrigger>
          <TabsTrigger value="logistics" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Logistica</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Qualità</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documenti</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Info Generali */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Ordine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Fornitore</h4>
                  <p className="text-gray-600">{supplier?.name || 'Fornitore sconosciuto'}</p>
                  <p className="text-sm text-gray-500">{supplier?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Stato Ordine</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Select value={order.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-48">
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
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Data Ordine</h4>
                  <p className="text-gray-600">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Consegna Prevista</h4>
                  <p className="text-gray-600">{formatDate(order.expectedDeliveryDate)}</p>
                </div>
                {order.actualDeliveryDate && (
                  <div>
                    <h4 className="font-medium text-gray-900">Consegna Effettiva</h4>
                    <p className="text-gray-600">{formatDate(order.actualDeliveryDate)}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">Importo Totale</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                </div>
                {order.notes && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900">Note</h4>
                    <p className="text-gray-600">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prodotti:</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quantità totale:</span>
                  <span className="font-medium">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Creato:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aggiornato:</span>
                  <span className="font-medium">{formatDate(order.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Collezione & Stagione */}
        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Collezione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900">Stagione</h4>
                  <p className="text-gray-600">{order.season || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Anno Collezione</h4>
                  <p className="text-gray-600">{order.collectionYear || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Nome Collezione</h4>
                  <p className="text-gray-600">{order.collectionName || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Linea/Brand</h4>
                  <p className="text-gray-600">{order.brandLine || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tipo Produzione</h4>
                  <Badge variant={order.productionType === 'sample' ? 'secondary' : 'default'}>
                    {order.productionType || '-'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Priorità</h4>
                  <Badge className={
                    order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    order.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {order.priority || 'normal'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Prodotti */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Prodotti Ordinati ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto space-y-2">
                {order.items.map((item) => {
                  const product = products.find(p => p.id === item.productId)
                  const variant = product?.variants.find(v => v.id === item.variantId)

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {product?.name || 'Prodotto sconosciuto'}
                          </h4>
                          {item.qualityGrade && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              item.qualityGrade === 'A'
                                ? 'bg-green-100 text-green-800'
                                : item.qualityGrade === 'B'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.qualityGrade === 'C'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.qualityGrade}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {product?.code} • {variant?.color} • {variant?.size}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                          {item.receivedQuantity !== undefined && (
                            <span className="ml-2 text-blue-600">• Ricevuti: {item.receivedQuantity}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Condizioni Commerciali */}
        <TabsContent value="commercial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Condizioni Commerciali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900">Metodo di Pagamento</h4>
                  <p className="text-gray-600">{order.paymentMethod || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Termini di Pagamento</h4>
                  <p className="text-gray-600">{order.paymentTerms || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Valuta</h4>
                  <p className="text-gray-600">{order.currency || 'EUR'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Incoterms</h4>
                  <Badge>{order.incoterms || '-'}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Sconto Applicato</h4>
                  <p className="text-gray-600">{order.discount ? `${order.discount}%` : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Logistica */}
        <TabsContent value="logistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Logistiche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900">Metodo di Spedizione</h4>
                  <Badge>{order.shippingMethod || '-'}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Porto di Destinazione</h4>
                  <p className="text-gray-600">{order.portOfDestination || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tracking Number</h4>
                  <p className="text-gray-600">{order.trackingNumber || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Riferimento Fornitore</h4>
                  <p className="text-gray-600">{order.supplierReference || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Qualità & Packaging */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controllo Qualità e Packaging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900">Standard Qualità</h4>
                  <p className="text-gray-600">{order.qualityStandard || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tipo di Ispezione</h4>
                  <p className="text-gray-600">{order.inspectionType || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900">Tipo di Packaging</h4>
                  <p className="text-gray-600">{order.packagingType || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900">Istruzioni Etichettatura</h4>
                  <p className="text-gray-600">{order.labelingInstructions || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900">Note Packaging</h4>
                  <p className="text-gray-600">{order.packagingNotes || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Documentazione */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentazione Ordine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900">Numero Proforma Invoice</h4>
                  <p className="text-gray-600">{order.proformaInvoiceNumber || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Numero Purchase Order</h4>
                  <p className="text-gray-600">{order.purchaseOrderNumber || '-'}</p>
                </div>
                {order.attachments && order.attachments.length > 0 && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Allegati</h4>
                    <div className="space-y-2">
                      {order.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{attachment.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(attachment.uploadedAt)} {attachment.uploadedBy && `• ${attachment.uploadedBy}`}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: Timeline Produzione */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Produzione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.productionMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`relative p-4 rounded-lg border-2 ${getMilestoneColor(milestone.status)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getMilestoneIcon(milestone.status)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {milestone.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {milestone.description}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Previsto: {formatDate(milestone.expectedDate)}</p>
                          {milestone.actualDate && (
                            <p>Completato: {formatDate(milestone.actualDate)}</p>
                          )}
                        </div>
                        {milestone.notes && (
                          <p className="mt-2 text-xs text-gray-600 italic">
                            {milestone.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < order.productionMilestones.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}