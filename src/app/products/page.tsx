'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, Tag, Palette } from 'lucide-react'
import Link from 'next/link'
import { Product, ProductCategory, Season } from '@/types'

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'abbigliamento', label: 'Abbigliamento' },
  { value: 'accessori', label: 'Accessori' },
  { value: 'calzature', label: 'Calzature' },
  { value: 'intimo', label: 'Intimo' },
]

const SEASONS: { value: Season; label: string }[] = [
  { value: 'primavera-estate', label: 'Primavera-Estate' },
  { value: 'autunno-inverno', label: 'Autunno-Inverno' },
  { value: 'cruise', label: 'Cruise' },
  { value: 'pre-fall', label: 'Pre-Fall' },
]

export default function ProductsPage() {
  const { products, orders, loadData, deleteProduct } = useAppStore()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [seasonFilter, setSeasonFilter] = useState<string>('all')
  const [collectionFilter, setCollectionFilter] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter)
    }

    if (seasonFilter !== 'all') {
      filtered = filtered.filter(product => product.season === seasonFilter)
    }

    if (collectionFilter !== 'all') {
      filtered = filtered.filter(product => product.collection === collectionFilter)
    }

    setFilteredProducts(filtered.sort((a, b) => a.name.localeCompare(b.name)))
  }, [products, searchTerm, categoryFilter, seasonFilter, collectionFilter])

  const handleDeleteProduct = (productId: string) => {
    // Check if product is used in orders
    const productInOrders = orders.some(order =>
      order.items.some(item => item.productId === productId)
    )

    if (productInOrders) {
      alert('Impossibile eliminare il prodotto: è utilizzato in uno o più ordini')
      return
    }

    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      deleteProduct(productId)
    }
  }

  const getProductStats = (productId: string) => {
    const productOrders = orders.filter(order =>
      order.items.some(item => item.productId === productId)
    )
    const totalQuantity = productOrders.reduce((sum, order) =>
      sum + order.items.filter(item => item.productId === productId)
        .reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const totalValue = productOrders.reduce((sum, order) =>
      sum + order.items.filter(item => item.productId === productId)
        .reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
    )

    return {
      ordersCount: productOrders.length,
      totalQuantity,
      totalValue
    }
  }

  const uniqueCollections = Array.from(new Set(products.map(p => p.collection))).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Catalogo Prodotti
          </h1>
          <p className="text-gray-600">
            Gestisci il catalogo prodotti e le varianti
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Prodotto
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca per nome, codice, descrizione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per stagione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le stagioni</SelectItem>
                {SEASONS.map((season) => (
                  <SelectItem key={season.value} value={season.value}>
                    {season.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={collectionFilter} onValueChange={setCollectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per collezione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le collezioni</SelectItem>
                {uniqueCollections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun prodotto trovato
            </h3>
            <p className="text-gray-500 mb-4">
              {products.length === 0
                ? 'Non ci sono prodotti nel catalogo'
                : 'Nessun prodotto corrisponde ai filtri selezionati'
              }
            </p>
            <Link href="/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Primo Prodotto
              </Button>
            </Link>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stats = getProductStats(product.id)
            const minPrice = Math.min(...product.variants.map(v => v.price))
            const maxPrice = Math.max(...product.variants.map(v => v.price))
            const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)))
            const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)))

            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <p className="text-sm text-gray-600">{product.code}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.category === 'abbigliamento'
                        ? 'bg-blue-100 text-blue-800'
                        : product.category === 'accessori'
                        ? 'bg-green-100 text-green-800'
                        : product.category === 'calzature'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {CATEGORIES.find(c => c.value === product.category)?.label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Collection & Season */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Tag className="h-4 w-4 mr-1" />
                      {product.collection}
                    </div>
                    <span className="text-gray-600">
                      {SEASONS.find(s => s.value === product.season)?.label}
                    </span>
                  </div>

                  {/* Price Range */}
                  <div className="text-center py-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {minPrice === maxPrice
                        ? formatCurrency(minPrice)
                        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
                      }
                    </div>
                    <div className="text-xs text-gray-600">Prezzo di vendita</div>
                  </div>

                  {/* Variants Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Varianti:</span>
                      <span className="font-medium">{product.variants.length}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Palette className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-600">{uniqueColors.length} colori</span>
                      </div>
                      <div className="text-gray-600">{uniqueSizes.length} taglie</div>
                    </div>

                    {uniqueColors.length <= 4 && (
                      <div className="flex space-x-1">
                        {uniqueColors.slice(0, 4).map((color, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {stats.ordersCount > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-center pt-3 border-t">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{stats.ordersCount}</div>
                        <div className="text-xs text-gray-600">Ordini</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{stats.totalQuantity}</div>
                        <div className="text-xs text-gray-600">Pezzi ordinati</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex space-x-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-600">{product.subcategory}</span>
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