'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardKPI } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  ShoppingCart,
  Euro,
  Clock,
  CheckCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react'

interface KPICardsProps {
  kpi: DashboardKPI
}

export function KPICards({ kpi }: KPICardsProps) {
  const cards = [
    {
      title: 'Ordini in Corso',
      value: kpi.ordersInProgress,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Valore Totale Ordini',
      value: formatCurrency(kpi.totalOrderValue),
      icon: Euro,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Lead Time Medio',
      value: `${Math.round(kpi.averageLeadTime)} giorni`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Tasso Qualità',
      value: `${kpi.qualityRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Consegne Puntuali',
      value: `${kpi.onTimeDeliveryRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Tasso Resi',
      value: `${kpi.returnRate.toFixed(1)}%`,
      icon: RotateCcw,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}