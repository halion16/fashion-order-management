'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Edit, Trash2, Package, Tag, Palette, Ruler, TrendingUp, Leaf, FileText, DollarSign, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'
import { ProductCategory, Season } from '@/types'
import { ImageGallery } from '@/components/products/image-gallery'
import { TechnicalSheetSection } from '@/components/products/technical-sheet'
import { SupplierPricingSection } from '@/components/products/supplier-pricing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { products, orders, deleteProduct, loadData } = useAppStore()
  const [product, setProduct] = useState(products.find(p => p.id === params.id))

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const foundProduct = products.find(p => p.id === params.id)
    setProduct(foundProduct)
  }, [products, params.id])

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Prodotto non trovato</h1>
        <p className="text-gray-600 mt-2">Il prodotto richiesto non esiste o è stato eliminato.</p>
        <Link href="/products" className="mt-4 inline-block">
          <Button>Torna ai Prodotti</Button>
        </Link>
      </div>
    )
  }

  const productOrders = orders.filter(order =>
    order.items.some(item => item.productId === product.id)
  )

  const totalQuantityOrdered = productOrders.reduce((sum, order) =>
    sum + order.items
      .filter(item => item.productId === product.id)
      .reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  )

  const totalRevenue = productOrders.reduce((sum, order) =>
    sum + order.items
      .filter(item => item.productId === product.id)
      .reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
  )

  const minPrice = Math.min(...product.variants.map(v => v.price))
  const maxPrice = Math.max(...product.variants.map(v => v.price))
  const avgMargin = product.variants.length > 0
    ? product.variants.reduce((sum, v) =>
        sum + (v.price > 0 ? ((v.price - v.costPrice) / v.price) * 100 : 0), 0
      ) / product.variants.length
    : 0

  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)))
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)))

  const handleDeleteProduct = () => {
    const productInOrders = orders.some(order =>
      order.items.some(item => item.productId === product.id)
    )

    if (productInOrders) {
      alert('Impossibile eliminare il prodotto: è utilizzato in uno o più ordini')
      return
    }

    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      deleteProduct(product.id)
      router.push('/products')
    }
  }

  const categoryInfo = CATEGORIES.find(c => c.value === product.category)
  const seasonInfo = SEASONS.find(s => s.value === product.season)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="font-medium">{product.code}</span>
                <span>•</span>
                <span>{categoryInfo?.label}</span>
                <span>•</span>
                <span>{product.subcategory}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link href={`/products/${product.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDeleteProduct}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Image Gallery - Fixed Left Column */}
        <div className="lg:col-span-1">
          <ImageGallery images={product.images || []} productName={product.name} />

          {/* Key Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Informazioni Chiave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Categoria:</span>
                <span className="font-medium">{categoryInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stagione:</span>
                <span className="font-medium">{seasonInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collezione:</span>
                <span className="font-medium">{product.collection}</span>
              </div>
              {product.targetPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Prezzo Target:</span>
                  <span className="font-medium">{formatCurrency(product.targetPrice)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Varianti:</span>
                <span className="font-medium">{product.variants.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Panoramica</span>
              </TabsTrigger>
              <TabsTrigger value="variants" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Varianti</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Tecnico</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Prezzi</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descrizione Prodotto</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>

              {/* Materials & Care */}
              <Card>
                <CardHeader>
                  <CardTitle>Materiali e Cura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Advanced Materials */}
                  {product.materials && Array.isArray(product.materials) && product.materials.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Composizione Materiali</h4>
                      {typeof product.materials[0] === 'object' ? (
                        <div className="space-y-3">
                          {(product.materials as any[]).map((material: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{material.name}</span>
                                <span className="text-lg font-bold text-blue-600">{material.percentage}%</span>
                              </div>
                              {material.origin && (
                                <p className="text-sm text-gray-600">Origine: {material.origin}</p>
                              )}
                              {material.certification && (
                                <p className="text-sm text-green-600">Certificazione: {material.certification}</p>
                              )}
                              {material.properties && material.properties.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {material.properties.map((prop: string, propIndex: number) => (
                                      <span
                                        key={propIndex}
                                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                      >
                                        {prop}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {product.materials.map((material: any, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {typeof material === 'string' ? material : material.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Care Instructions */}
                  {product.careInstructions && product.careInstructions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Istruzioni di Cura</h4>
                      {typeof product.careInstructions[0] === 'object' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(product.careInstructions as any[]).map((instruction: any, index: number) => (
                            <div key={index} className={`flex items-center p-3 rounded-lg ${instruction.warning ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                              <div className="flex-1">
                                <p className={`font-medium ${instruction.warning ? 'text-red-800' : 'text-green-800'}`}>
                                  {instruction.description}
                                </p>
                                {instruction.temperature && (
                                  <p className="text-sm text-gray-600">Temperatura: {instruction.temperature}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {product.careInstructions.map((instruction: any, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                            >
                              {typeof instruction === 'string' ? instruction : instruction.description}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sustainability */}
                  {product.sustainability && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Leaf className="h-4 w-4 mr-2 text-green-600" />
                        Sostenibilità
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Eco-friendly:</span>
                            <span className={`font-medium ${product.sustainability.ecoFriendly ? 'text-green-600' : 'text-red-600'}`}>
                              {product.sustainability.ecoFriendly ? 'Sì' : 'No'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Riciclabile:</span>
                            <span className={`font-medium ${product.sustainability.recyclable ? 'text-green-600' : 'text-red-600'}`}>
                              {product.sustainability.recyclable ? 'Sì' : 'No'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Produzione Etica:</span>
                            <span className={`font-medium ${product.sustainability.ethicalProduction ? 'text-green-600' : 'text-red-600'}`}>
                              {product.sustainability.ethicalProduction ? 'Sì' : 'No'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Punteggio Sostenibilità:</span>
                            <span className="font-medium text-lg">
                              {product.sustainability.sustainabilityScore}/10
                            </span>
                          </div>
                          {product.sustainability.carbonFootprint && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Impronta CO₂:</span>
                              <span className="font-medium">{product.sustainability.carbonFootprint} kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {product.sustainability.certifications && product.sustainability.certifications.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Certificazioni Sostenibilità:</p>
                          <div className="flex flex-wrap gap-2">
                            {product.sustainability.certifications.map((cert: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              <Card>
            <CardHeader>
              <CardTitle>Varianti Prodotto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900">{variant.sku}</h5>
                        <p className="text-sm text-gray-600">SKU</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: variant.colorHex || '#gray' }}
                        />
                        <div>
                          <h5 className="font-medium text-gray-900">{variant.color}</h5>
                          <p className="text-sm text-gray-600">Colore</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{variant.size}</h5>
                        <p className="text-sm text-gray-600">Taglia</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{formatCurrency(variant.price)}</h5>
                        <p className="text-sm text-gray-600">Prezzo vendita</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {variant.price > 0 && variant.costPrice > 0
                            ? `${(((variant.price - variant.costPrice) / variant.price) * 100).toFixed(1)}%`
                            : '-'
                          }
                        </h5>
                        <p className="text-sm text-gray-600">Margine</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-between text-sm text-gray-600">
                      <span>Costo: {formatCurrency(variant.costPrice)}</span>
                      <span>MOQ: {variant.minimumOrderQuantity}</span>
                      {variant.material && <span>Materiale: {variant.material}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

              {/* Variants Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Colori e Taglie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Colori</h4>
                    <div className="flex flex-wrap gap-1">
                      {uniqueColors.map((color, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Taglie</h4>
                    <div className="flex flex-wrap gap-1">
                      {uniqueSizes.map((size, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6">
              <TechnicalSheetSection
                technicalSheet={product.technicalSheet}
                measurements={product.measurements || { sizeChart: [], grading: [], fit: 'regular' }}
                productName={product.name}
              />
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <SupplierPricingSection
                supplierPriceLists={product.supplierPriceLists || []}
                variantPrices={product.variants?.[0]?.supplierPrices}
                selectedVariantId={product.variants?.[0]?.id}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Statistiche Vendite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{productOrders.length}</div>
                      <div className="text-sm text-blue-600">Ordini</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{totalQuantityOrdered}</div>
                      <div className="text-sm text-green-600">Pezzi Ordinati</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(totalRevenue).replace('€', '').trim()}€
                      </div>
                      <div className="text-sm text-purple-600">Fatturato</div>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{avgMargin.toFixed(1)}%</div>
                      <div className="text-sm text-orange-600">Margine Medio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Prodotto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Varianti Totali</span>
                      <span className="font-medium">{product.variants.length}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Colori Disponibili</span>
                      <span className="font-medium">{uniqueColors.length}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taglie Disponibili</span>
                      <span className="font-medium">{uniqueSizes.length}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Range Prezzi</span>
                      <span className="font-medium">
                        {minPrice === maxPrice
                          ? formatCurrency(minPrice)
                          : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Ordini Recenti</CardTitle>
                  <Link href={`/orders?product=${product.id}`}>
                    <Button variant="ghost" size="sm">
                      Vedi tutti
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {productOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Nessun ordine per questo prodotto</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productOrders.slice(0, 5).map((order) => {
                        const orderItems = order.items.filter(item => item.productId === product.id)
                        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0)
                        const totalValue = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)

                        return (
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
                                {formatDate(order.orderDate)} • {totalQuantity} pezzi
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(totalValue)}</p>
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
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Azioni Rapide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/orders/new?product=${product.id}`} className="block">
                    <Button className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Crea Ordine
                    </Button>
                  </Link>

                  <Link href={`/products/${product.id}/edit`} className="block">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica Prodotto
                    </Button>
                  </Link>

                  <Link href={`/orders?product=${product.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      Vedi Tutti gli Ordini
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}