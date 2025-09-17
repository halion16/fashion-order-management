'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Edit, Trash2, Building2, MapPin, Star, Clock, Package, Mail, Phone, TrendingUp, AlertTriangle, Award, FileText, BarChart3, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { ContractsSection } from '@/components/suppliers/contracts-section'
import { LocationSection } from '@/components/suppliers/location-section'
import { RatingSection } from '@/components/suppliers/rating-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { suppliers, orders, deleteSupplier, loadData } = useAppStore()
  const [supplier, setSupplier] = useState(suppliers.find(s => s.id === params.id))

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const foundSupplier = suppliers.find(s => s.id === params.id)
    setSupplier(foundSupplier)
  }, [suppliers, params.id])

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Fornitore non trovato</h1>
        <p className="text-gray-600 mt-2">Il fornitore richiesto non esiste o è stato eliminato.</p>
        <Link href="/suppliers" className="mt-4 inline-block">
          <Button>Torna ai Fornitori</Button>
        </Link>
      </div>
    )
  }

  const supplierOrders = orders.filter(order => order.supplierId === supplier.id)
  const activeOrders = supplierOrders.filter(order =>
    !['completato', 'annullato'].includes(order.status)
  )
  const completedOrders = supplierOrders.filter(order => order.status === 'completato')
  const totalValue = supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  // Calculate performance metrics
  const onTimeDeliveries = completedOrders.filter(order =>
    order.actualDeliveryDate && order.actualDeliveryDate <= order.expectedDeliveryDate
  ).length
  const onTimeRate = completedOrders.length > 0 ? (onTimeDeliveries / completedOrders.length) * 100 : 0

  const averageLeadTime = completedOrders.length > 0
    ? completedOrders.reduce((sum, order) => {
        if (order.actualDeliveryDate) {
          const leadTime = Math.ceil(
            (order.actualDeliveryDate.getTime() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          return sum + leadTime
        }
        return sum
      }, 0) / completedOrders.length
    : 0

  const qualityRate = completedOrders.length > 0
    ? (completedOrders.filter(order =>
        order.items.every(item => item.qualityGrade === 'A' || item.qualityGrade === 'B')
      ).length / completedOrders.length) * 100
    : 0

  const handleDeleteSupplier = () => {
    if (activeOrders.length > 0) {
      alert(`Impossibile eliminare il fornitore: ha ${activeOrders.length} ordini attivi`)
      return
    }

    if (confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      deleteSupplier(supplier.id)
      router.push('/suppliers')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/suppliers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {supplier.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-medium">{supplier.qualityRating}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{supplier.leadTimesDays} giorni lead time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link href={`/suppliers/${supplier.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDeleteSupplier}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Supplier Info - Fixed Left Column */}
        <div className="lg:col-span-1">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informazioni Chiave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <div>
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium ml-2">{supplier.qualityRating}/5</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-600">Lead Time:</span>
                  <span className="font-medium ml-2">{supplier.leadTimesDays} giorni</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-600">Ordini:</span>
                  <span className="font-medium ml-2">{supplierOrders.length}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium ml-2">{formatCurrency(totalValue)}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Pagamento:</span>
                <p className="font-medium">{supplier.paymentTerms}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/orders/new?supplier=${supplier.id}`} className="block">
                <Button className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Nuovo Ordine
                </Button>
              </Link>

              <Link href={`/orders?supplier=${supplier.id}`} className="block">
                <Button variant="outline" className="w-full">
                  Vedi Tutti gli Ordini
                </Button>
              </Link>

              <Link href={`/suppliers/${supplier.id}/edit`} className="block">
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica Dati
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Alerts */}
          {activeOrders.length > 0 && (
            <Card className="mt-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Avvisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  Questo fornitore ha {activeOrders.length} ordini attivi in corso.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content with Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Panoramica</span>
              </TabsTrigger>
              <TabsTrigger value="contracts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Contratti</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Ubicazioni</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Qualità</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni di Contatto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{supplier.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Telefono</p>
                          <p className="font-medium">{supplier.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Indirizzo</p>
                          <div className="font-medium">
                            <p>{supplier.address.street}</p>
                            <p>{supplier.address.zipCode} {supplier.address.city}</p>
                            <p>{supplier.address.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Condizioni di Pagamento</p>
                        <p className="font-medium">{supplier.paymentTerms}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Membro dal</p>
                        <p className="font-medium">{formatDate(supplier.createdAt)}</p>
                      </div>
                    </div>

                    {supplier.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Note</p>
                        <p className="font-medium mt-1">{supplier.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Specializations & Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specializzazioni e Certificazioni</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Specializzazioni</h4>
                    <div className="flex flex-wrap gap-2">
                      {supplier.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {supplier.certifications && supplier.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Certificazioni
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {supplier.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-6">
              <ContractsSection contracts={supplier.contracts || []} />
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-6">
              <LocationSection supplier={supplier} />
            </TabsContent>

            {/* Quality Tab */}
            <TabsContent value="quality" className="space-y-6">
              <RatingSection
                ratingHistory={supplier.ratingHistory || []}
                overallRating={supplier.qualityRating}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Statistiche Chiave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{supplierOrders.length}</div>
                      <div className="text-sm text-blue-600">Ordini Totali</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue).replace('€', '').trim()}€</div>
                      <div className="text-sm text-green-600">Volume Totale</div>
                    </div>

                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{activeOrders.length}</div>
                      <div className="text-sm text-yellow-600">Ordini Attivi</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{completedOrders.length}</div>
                      <div className="text-sm text-purple-600">Ordini Completati</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Metriche Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Puntualità Consegne</span>
                      <span className="font-medium">{onTimeRate.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lead Time Medio</span>
                      <span className="font-medium">{Math.round(averageLeadTime)} giorni</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tasso Qualità</span>
                      <span className="font-medium">{qualityRate.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating Qualità</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{supplier.qualityRating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Ordini Recenti</CardTitle>
                  <Link href={`/orders/new?supplier=${supplier.id}`}>
                    <Button size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Nuovo Ordine
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {supplierOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Nessun ordine presente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {supplierOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <Link
                              href={`/orders/${order.id}`}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              {order.orderNumber}
                            </Link>
                            <p className="text-sm text-gray-600">
                              {formatDate(order.orderDate)} • {order.items.length} prodotti
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completato'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'in-produzione'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {supplierOrders.length > 5 && (
                        <Link href={`/orders?supplier=${supplier.id}`} className="block text-center">
                          <Button variant="ghost" size="sm">
                            Vedi tutti ({supplierOrders.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  )
}