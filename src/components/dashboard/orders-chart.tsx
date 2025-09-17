'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardKPI } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface OrdersChartProps {
  kpi: DashboardKPI
}

const STATUS_COLORS = {
  'bozza': '#6B7280',
  'inviato': '#3B82F6',
  'confermato': '#10B981',
  'in-produzione': '#F59E0B',
  'controllo-qualita': '#8B5CF6',
  'spedito': '#6366F1',
  'consegnato': '#059669',
  'completato': '#047857',
  'annullato': '#EF4444',
}

const STATUS_LABELS = {
  'bozza': 'Bozza',
  'inviato': 'Inviato',
  'confermato': 'Confermato',
  'in-produzione': 'In Produzione',
  'controllo-qualita': 'Controllo Qualità',
  'spedito': 'Spedito',
  'consegnato': 'Consegnato',
  'completato': 'Completato',
  'annullato': 'Annullato',
}

export function OrdersChart({ kpi }: OrdersChartProps) {
  const data = kpi.productionStatus.map(item => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#6B7280'
  }))

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show label for very small slices

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Ordini per Stato</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, 'Ordini']}
                labelStyle={{ color: '#374151' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}