'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardKPI } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Building2, Package, Euro } from 'lucide-react'

interface TopSuppliersProps {
  kpi: DashboardKPI
}

export function TopSuppliers({ kpi }: TopSuppliersProps) {
  if (kpi.topSuppliers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Fornitori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nessun fornitore presente</p>
            <p className="text-sm">Aggiungi fornitori per vedere le statistiche</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Fornitori</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kpi.topSuppliers.map((supplier, index) => (
            <div
              key={supplier.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {supplier.name}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Package className="h-3 w-3 mr-1" />
                      {supplier.ordersCount} ordini
                    </div>
                    <div className="flex items-center">
                      <Euro className="h-3 w-3 mr-1" />
                      {formatCurrency(supplier.totalValue)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  #{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}