'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Plus, Search, Filter, Eye, Edit, Trash2, Building2, MapPin, Star, Clock, Package } from 'lucide-react'
import Link from 'next/link'
import { Supplier } from '@/types'

export default function SuppliersPage() {
  const { suppliers, orders, loadData, deleteSupplier } = useAppStore()
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let filtered = suppliers

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.address.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (specializationFilter !== 'all') {
      filtered = filtered.filter(supplier =>
        supplier.specializations.some(spec =>
          spec.toLowerCase().includes(specializationFilter.toLowerCase())
        )
      )
    }

    if (ratingFilter !== 'all') {
      const rating = parseFloat(ratingFilter)
      filtered = filtered.filter(supplier => supplier.qualityRating >= rating)
    }

    setFilteredSuppliers(filtered.sort((a, b) => a.name.localeCompare(b.name)))
  }, [suppliers, searchTerm, specializationFilter, ratingFilter])

  const handleDeleteSupplier = (supplierId: string) => {
    // Check if supplier has active orders
    const supplierOrders = orders.filter(order =>
      order.supplierId === supplierId &&
      !['completato', 'annullato'].includes(order.status)
    )

    if (supplierOrders.length > 0) {
      alert(`Impossibile eliminare il fornitore: ha ${supplierOrders.length} ordini attivi`)
      return
    }

    if (confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      deleteSupplier(supplierId)
    }
  }

  const getSupplierStats = (supplierId: string) => {
    const supplierOrders = orders.filter(order => order.supplierId === supplierId)
    const totalValue = supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const activeOrders = supplierOrders.filter(order =>
      !['completato', 'annullato'].includes(order.status)
    ).length

    return {
      totalOrders: supplierOrders.length,
      totalValue,
      activeOrders
    }
  }

  const uniqueSpecializations = Array.from(
    new Set(suppliers.flatMap(s => s.specializations))
  ).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gestione Fornitori
          </h1>
          <p className="text-gray-600">
            Visualizza e gestisci tutti i fornitori
          </p>
        </div>
        <Link href="/suppliers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Fornitore
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
                placeholder="Cerca per nome, email, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per specializzazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le specializzazioni</SelectItem>
                {uniqueSpecializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i rating</SelectItem>
                <SelectItem value="4.5">4.5+ stelle</SelectItem>
                <SelectItem value="4">4+ stelle</SelectItem>
                <SelectItem value="3.5">3.5+ stelle</SelectItem>
                <SelectItem value="3">3+ stelle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun fornitore trovato
            </h3>
            <p className="text-gray-500 mb-4">
              {suppliers.length === 0
                ? 'Non ci sono fornitori nel sistema'
                : 'Nessun fornitore corrisponde ai filtri selezionati'
              }
            </p>
            <Link href="/suppliers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Primo Fornitore
              </Button>
            </Link>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => {
            const stats = getSupplierStats(supplier.id)
            return (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <p className="text-sm text-gray-600">{supplier.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{supplier.qualityRating}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {supplier.address.city}, {supplier.address.country}
                  </div>

                  {/* Specializations */}
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {supplier.specializations.slice(0, 3).map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {spec}
                        </span>
                      ))}
                      {supplier.specializations.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{supplier.specializations.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center pt-3 border-t">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{stats.totalOrders}</div>
                      <div className="text-xs text-gray-600">Ordini Totali</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{stats.activeOrders}</div>
                      <div className="text-xs text-gray-600">Attivi</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(stats.totalValue).replace(/[€\s]/g, '')}k
                      </div>
                      <div className="text-xs text-gray-600">Volume</div>
                    </div>
                  </div>

                  {/* Lead Time */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Lead time: {supplier.leadTimesDays} giorni
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex space-x-2">
                      <Link href={`/suppliers/${supplier.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/suppliers/${supplier.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Link href={`/orders/new?supplier=${supplier.id}`}>
                      <Button size="sm" variant="outline">
                        <Package className="h-4 w-4 mr-1" />
                        Ordina
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}