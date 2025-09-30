'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { initializeSampleData } from '@/lib/sample-data'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { OrdersChart } from '@/components/dashboard/orders-chart'
import { TopSuppliers } from '@/components/dashboard/top-suppliers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Download, Upload, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { storage } from '@/lib/storage'

export default function Dashboard() {
  const { loadData, getDashboardKPI, orders, suppliers, products } = useAppStore()

  const handleResetData = () => {
    if (confirm('Sei sicuro di voler resettare tutti i dati e ricaricare gli esempi? Questa azione non può essere annullata.')) {
      storage.clearAll()
      window.location.reload()
    }
  }

  useEffect(() => {
    initializeSampleData()
    loadData()
  }, [loadData])

  const kpi = getDashboardKPI()

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Panoramica della gestione ordini moda
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleResetData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Dati
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta Dati
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importa Dati
          </Button>
          <Link href="/orders/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Ordine
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpi={kpi} />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart kpi={kpi} />
        <TopSuppliers kpi={kpi} />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ordini Recenti</CardTitle>
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              Vedi tutti
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun ordine presente</p>
              <p className="text-sm">Crea il tuo primo ordine per iniziare</p>
              <Link href="/orders/new" className="mt-4 inline-block">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Primo Ordine
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const supplier = suppliers.find(s => s.id === order.supplierId)
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {supplier?.name || 'Fornitore sconosciuto'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{order.totalAmount.toLocaleString()}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Totale Prodotti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-gray-600">Prodotti nel catalogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Fornitori Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-gray-600">Fornitori registrati</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Ordini Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-gray-600">Ordini processati</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
