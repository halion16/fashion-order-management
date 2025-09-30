'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateId } from '@/lib/utils'
import { ArrowLeft, Save, Plus, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Product, ProductFormData, MaterialSpec, CareInstruction, ProductVariant, SupplierPriceList, PriceDiscountTier } from '@/types'

const careInstructionIcons = [
  'wash-30', 'wash-40', 'wash-60', 'wash-cold', 'hand-wash',
  'bleach', 'no-bleach', 'tumble-dry', 'no-tumble-dry',
  'iron-low', 'iron-medium', 'iron-high', 'no-iron',
  'dry-clean', 'no-dry-clean', 'hang-dry'
]

const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '46', '48', '50', '52']

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { products, updateProduct, suppliers, loadData } = useAppStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    category: 'abbigliamento',
    subcategory: '',
    description: '',
    season: 'primavera-estate',
    collection: '',
    collectionYear: new Date().getFullYear(),
    materials: [],
    careInstructions: [],
    targetPrice: 0,
    sustainability: {
      ecoFriendly: false,
      certifications: [],
      recyclable: false,
      ethicalProduction: false,
      sustainabilityScore: 0
    },
    measurements: {
      sizeChart: [],
      grading: [],
      fit: 'regular'
    },
    tags: [],
    status: 'bozza'
  })

  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [supplierPriceLists, setSupplierPriceLists] = useState<SupplierPriceList[]>([])
  const [customSizes, setCustomSizes] = useState<string[]>([])
  const [newCustomSize, setNewCustomSize] = useState('')

  // Material form
  const [newMaterial, setNewMaterial] = useState<MaterialSpec>({
    name: '',
    percentage: 0,
    properties: []
  })

  // Care instruction form
  const [newCareInstruction, setNewCareInstruction] = useState<CareInstruction>({
    icon: '',
    description: '',
    warning: false
  })

  // Variant form
  const [newVariant, setNewVariant] = useState<Omit<ProductVariant, 'id' | 'supplierPrices'>>({
    sku: '',
    color: '',
    colorHex: '',
    size: '',
    price: 0,
    costPrice: 0,
    minimumOrderQuantity: 1,
    weight: 0,
    images: []
  })

  // Supplier price list form
  const [newSupplierPriceList, setNewSupplierPriceList] = useState({
    supplierName: '',
    basePrice: 0,
    currency: 'EUR',
    minimumOrderQuantity: 1,
    leadTimeDays: 30,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: ''
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Load product data
  useEffect(() => {
    if (params.id && products.length > 0) {
      const foundProduct = products.find(p => p.id === params.id)
      if (foundProduct) {
        setProduct(foundProduct)

        // Populate form with existing data
        setFormData({
          name: foundProduct.name,
          code: foundProduct.code,
          category: foundProduct.category,
          subcategory: foundProduct.subcategory,
          description: foundProduct.description,
          season: foundProduct.season,
          collection: foundProduct.collection,
          collectionYear: foundProduct.collectionYear,
          materials: foundProduct.materials || [],
          careInstructions: foundProduct.careInstructions || [],
          targetPrice: foundProduct.targetPrice,
          sustainability: foundProduct.sustainability || {
            ecoFriendly: false,
            certifications: [],
            recyclable: false,
            ethicalProduction: false,
            sustainabilityScore: 0
          },
          measurements: foundProduct.measurements || {
            sizeChart: [],
            grading: [],
            fit: 'regular'
          },
          tags: foundProduct.tags || [],
          status: foundProduct.status
        })

        setVariants(foundProduct.variants || [])
        setSupplierPriceLists(foundProduct.supplierPriceLists || [])

        // Extract custom sizes from variants
        const existingCustomSizes = foundProduct.variants
          ?.map(v => v.size)
          .filter(size => !commonSizes.includes(size))
          .filter((size, index, self) => self.indexOf(size) === index) || []
        setCustomSizes(existingCustomSizes)
      }
      setLoading(false)
    }
  }, [params.id, products])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome prodotto richiesto'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Codice prodotto richiesto'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrizione richiesta'
    }

    if (formData.targetPrice <= 0) {
      newErrors.targetPrice = 'Prezzo target deve essere maggiore di 0'
    }

    if (variants.length === 0) {
      newErrors.variants = 'Almeno una variante richiesta'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !product) {
      return
    }

    const updatedProduct: Product = {
      ...product,
      ...formData,
      variants,
      supplierPriceLists,
      updatedAt: new Date()
    }

    updateProduct(updatedProduct)
    router.push(`/products/${product.id}`)
  }

  // Material functions
  const addMaterial = () => {
    if (newMaterial.name.trim() && newMaterial.percentage > 0) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, { ...newMaterial }]
      }))
      setNewMaterial({ name: '', percentage: 0, properties: [] })
    }
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  // Care instruction functions
  const addCareInstruction = () => {
    if (newCareInstruction.icon && newCareInstruction.description.trim()) {
      setFormData(prev => ({
        ...prev,
        careInstructions: [...prev.careInstructions, { ...newCareInstruction }]
      }))
      setNewCareInstruction({ icon: '', description: '', warning: false })
    }
  }

  const removeCareInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      careInstructions: prev.careInstructions.filter((_, i) => i !== index)
    }))
  }

  // Variant functions
  const addVariant = () => {
    if (newVariant.sku.trim() && newVariant.color.trim() && newVariant.size && newVariant.price > 0) {
      const variant: ProductVariant = {
        id: generateId(),
        ...newVariant,
        images: [],
        supplierPrices: []
      }
      setVariants([...variants, variant])
      setNewVariant({
        sku: '',
        color: '',
        colorHex: '',
        size: '',
        price: 0,
        costPrice: 0,
        minimumOrderQuantity: 1,
        weight: 0,
        images: []
      })
    }
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // Custom size functions
  const addCustomSize = () => {
    if (newCustomSize.trim() && !customSizes.includes(newCustomSize.trim()) && !commonSizes.includes(newCustomSize.trim())) {
      setCustomSizes([...customSizes, newCustomSize.trim()])
      setNewCustomSize('')
    }
  }

  const removeCustomSize = (index: number) => {
    const sizeToRemove = customSizes[index]
    setCustomSizes(customSizes.filter((_, i) => i !== index))

    // Also remove this size from any variants that use it
    setVariants(variants.filter(variant => variant.size !== sizeToRemove))
  }

  // Supplier price list functions
  const addSupplierPriceList = () => {
    if (!newSupplierPriceList.supplierName.trim() || newSupplierPriceList.basePrice <= 0) {
      return
    }

    const priceList: SupplierPriceList = {
      supplierId: generateId(),
      supplierName: newSupplierPriceList.supplierName.trim(),
      basePrice: newSupplierPriceList.basePrice,
      currency: newSupplierPriceList.currency,
      minimumOrderQuantity: newSupplierPriceList.minimumOrderQuantity,
      leadTimeDays: newSupplierPriceList.leadTimeDays,
      discountTiers: [],
      validFrom: new Date(newSupplierPriceList.validFrom),
      validTo: newSupplierPriceList.validTo ? new Date(newSupplierPriceList.validTo) : undefined,
      isActive: true
    }

    setSupplierPriceLists([...supplierPriceLists, priceList])
    setNewSupplierPriceList({
      supplierName: '',
      basePrice: 0,
      currency: 'EUR',
      minimumOrderQuantity: 1,
      leadTimeDays: 30,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: ''
    })
  }

  const removeSupplierPriceList = (index: number) => {
    setSupplierPriceLists(supplierPriceLists.filter((_, i) => i !== index))
  }

  // Tag functions
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Caricamento...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Prodotto non trovato</div>
      </div>
    )
  }

  const allAvailableSizes = [...commonSizes, ...customSizes]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/products/${product.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Modifica Prodotto
          </h1>
          <p className="text-gray-600">
            Modifica i dettagli del prodotto: {product.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="base" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="variants">Varianti ({variants.length})</TabsTrigger>
            <TabsTrigger value="technical">Tecnico</TabsTrigger>
            <TabsTrigger value="images">Immagini</TabsTrigger>
            <TabsTrigger value="pricing">Prezzi ({supplierPriceLists.length})</TabsTrigger>
            <TabsTrigger value="sustainability">Sostenibilità</TabsTrigger>
          </TabsList>

          {/* Base Information Tab */}
          <TabsContent value="base" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Prodotto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es. Camicia in cotone"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Codice Prodotto *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Es. CAM001"
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abbigliamento">Abbigliamento</SelectItem>
                        <SelectItem value="accessori">Accessori</SelectItem>
                        <SelectItem value="calzature">Calzature</SelectItem>
                        <SelectItem value="intimo">Intimo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Sottocategoria</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="Es. Camicie"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stagione</Label>
                    <Select value={formData.season} onValueChange={(value: any) => setFormData(prev => ({ ...prev, season: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primavera-estate">Primavera/Estate</SelectItem>
                        <SelectItem value="autunno-inverno">Autunno/Inverno</SelectItem>
                        <SelectItem value="cruise">Cruise</SelectItem>
                        <SelectItem value="pre-fall">Pre-Fall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collection">Collezione</Label>
                    <Input
                      id="collection"
                      value={formData.collection}
                      onChange={(e) => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                      placeholder="Es. Urban Chic"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collectionYear">Anno Collezione</Label>
                    <Input
                      id="collectionYear"
                      type="number"
                      value={formData.collectionYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, collectionYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetPrice">Prezzo Target (€) *</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.targetPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                      className={errors.targetPrice ? 'border-red-500' : ''}
                    />
                    {errors.targetPrice && <p className="text-sm text-red-600">{errors.targetPrice}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bozza">Bozza</SelectItem>
                        <SelectItem value="attivo">Attivo</SelectItem>
                        <SelectItem value="sospeso">Sospeso</SelectItem>
                        <SelectItem value="discontinuato">Discontinuato</SelectItem>
                        <SelectItem value="esaurito">Esaurito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrizione *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrizione dettagliata del prodotto..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Aggiungi tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            {/* Custom Sizes Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gestione Taglie Personalizzate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newCustomSize}
                    onChange={(e) => setNewCustomSize(e.target.value)}
                    placeholder="Aggiungi taglia personalizzata..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                  />
                  <Button type="button" onClick={addCustomSize}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {customSizes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Taglie personalizzate:</p>
                    <div className="flex flex-wrap gap-2">
                      {customSizes.map((size, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => removeCustomSize(index)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Variant */}
            <Card>
              <CardHeader>
                <CardTitle>Nuova Variante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variantSku">SKU *</Label>
                    <Input
                      id="variantSku"
                      value={newVariant.sku}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Es. CAM001-BLU-M"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variantColor">Colore *</Label>
                    <Input
                      id="variantColor"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Es. Blu Navy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variantColorHex">Codice Colore (Hex)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="variantColorHex"
                        value={newVariant.colorHex}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, colorHex: e.target.value }))}
                        placeholder="#000080"
                      />
                      {newVariant.colorHex && (
                        <div
                          className="w-10 h-10 rounded border border-gray-300"
                          style={{ backgroundColor: newVariant.colorHex }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Taglia *</Label>
                    <Select value={newVariant.size} onValueChange={(value) => setNewVariant(prev => ({ ...prev, size: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona taglia" />
                      </SelectTrigger>
                      <SelectContent>
                        {allAvailableSizes.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variantPrice">Prezzo (€) *</Label>
                    <Input
                      id="variantPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newVariant.price}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variantCostPrice">Prezzo Costo (€)</Label>
                    <Input
                      id="variantCostPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newVariant.costPrice}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variantMinQty">Quantità Minima</Label>
                    <Input
                      id="variantMinQty"
                      type="number"
                      min="1"
                      value={newVariant.minimumOrderQuantity}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, minimumOrderQuantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variantWeight">Peso (g)</Label>
                    <Input
                      id="variantWeight"
                      type="number"
                      min="0"
                      value={newVariant.weight}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Variante
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Variants */}
            {variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Varianti Prodotto ({variants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {variant.colorHex && (
                            <div
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: variant.colorHex }}
                            />
                          )}
                          <div>
                            <p className="font-medium">{variant.sku}</p>
                            <p className="text-sm text-gray-600">{variant.color} - {variant.size}</p>
                            <p className="text-sm text-gray-600">€{variant.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {errors.variants && <p className="text-sm text-red-600 mt-2">{errors.variants}</p>}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            {/* Materials */}
            <Card>
              <CardHeader>
                <CardTitle>Materiali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="materialName">Nome Materiale</Label>
                    <Input
                      id="materialName"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es. Cotone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="materialPercentage">Percentuale (%)</Label>
                    <Input
                      id="materialPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newMaterial.percentage}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addMaterial}>
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi
                    </Button>
                  </div>
                </div>

                {formData.materials.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Composizione:</h4>
                    {formData.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{material.name} - {material.percentage}%</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterial(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Care Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Istruzioni di Cura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Icona Cura</Label>
                    <Select value={newCareInstruction.icon} onValueChange={(value) => setNewCareInstruction(prev => ({ ...prev, icon: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona icona" />
                      </SelectTrigger>
                      <SelectContent>
                        {careInstructionIcons.map((icon) => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="careDescription">Descrizione</Label>
                    <Input
                      id="careDescription"
                      value={newCareInstruction.description}
                      onChange={(e) => setNewCareInstruction(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Es. Lavare a 30°C"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addCareInstruction}>
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi
                    </Button>
                  </div>
                </div>

                {formData.careInstructions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Istruzioni:</h4>
                    {formData.careInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{instruction.icon} - {instruction.description}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCareInstruction(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader>
                <CardTitle>Misure e Vestibilità</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vestibilità</Label>
                  <Select
                    value={formData.measurements.fit}
                    onValueChange={(value: any) => setFormData(prev => ({
                      ...prev,
                      measurements: { ...prev.measurements, fit: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="loose">Loose</SelectItem>
                      <SelectItem value="oversize">Oversize</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurementNotes">Note Misure</Label>
                  <Textarea
                    id="measurementNotes"
                    value={formData.measurements.notes || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      measurements: { ...prev.measurements, notes: e.target.value }
                    }))}
                    placeholder="Note aggiuntive sulle misure..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Immagini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p>Funzionalità di upload immagini in sviluppo</p>
                  <p className="text-sm">Questa sezione permetterà di caricare e gestire le immagini del prodotto</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            {/* Add New Supplier Price List */}
            <Card>
              <CardHeader>
                <CardTitle>Nuovo Listino Fornitore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Fornitore *</Label>
                    <div className="flex space-x-2">
                      <Select
                        value={newSupplierPriceList.supplierName}
                        onValueChange={(value) => {
                          if (value === 'CREATE_NEW') {
                            router.push('/suppliers/new')
                          } else {
                            setNewSupplierPriceList(prev => ({ ...prev, supplierName: value }))
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleziona fornitore" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="CREATE_NEW" className="border-t mt-2 pt-2">
                            <div className="flex items-center space-x-2">
                              <Plus className="h-4 w-4" />
                              <span>Crea nuovo fornitore</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Link href="/suppliers/new">
                        <Button type="button" variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Prezzo Base (€) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newSupplierPriceList.basePrice}
                      onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valuta</Label>
                    <Select value={newSupplierPriceList.currency} onValueChange={(value) => setNewSupplierPriceList(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minOrderQty">Quantità Minima</Label>
                    <Input
                      id="minOrderQty"
                      type="number"
                      min="1"
                      value={newSupplierPriceList.minimumOrderQuantity}
                      onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, minimumOrderQuantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadTime">Lead Time (giorni)</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      min="1"
                      value={newSupplierPriceList.leadTimeDays}
                      onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, leadTimeDays: parseInt(e.target.value) || 30 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valido Dal</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={newSupplierPriceList.validFrom}
                      onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, validFrom: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validTo">Valido Fino (opzionale)</Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={newSupplierPriceList.validTo}
                      onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, validTo: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={addSupplierPriceList}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Listino
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Supplier Price Lists */}
            {supplierPriceLists.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Listini Fornitori ({supplierPriceLists.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supplierPriceLists.map((priceList, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{priceList.supplierName}</p>
                          <p className="text-sm text-gray-600">
                            {priceList.basePrice.toFixed(2)} {priceList.currency} - Min: {priceList.minimumOrderQuantity} pz
                          </p>
                          <p className="text-sm text-gray-600">
                            Lead time: {priceList.leadTimeDays} giorni
                          </p>
                          <p className="text-sm text-gray-600">
                            Valido dal: {priceList.validFrom.toLocaleDateString()}
                            {priceList.validTo && ` al ${priceList.validTo.toLocaleDateString()}`}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSupplierPriceList(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Sostenibilità</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sustainabilityScore">Punteggio Sostenibilità (0-100)</Label>
                    <Input
                      id="sustainabilityScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.sustainability.sustainabilityScore}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sustainability: {
                          ...prev.sustainability,
                          sustainabilityScore: parseInt(e.target.value) || 0
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carbonFootprint">Impronta Carbonica (kg CO2)</Label>
                    <Input
                      id="carbonFootprint"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sustainability.carbonFootprint || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sustainability: {
                          ...prev.sustainability,
                          carbonFootprint: parseFloat(e.target.value) || undefined
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="ecoFriendly"
                      type="checkbox"
                      checked={formData.sustainability.ecoFriendly}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sustainability: {
                          ...prev.sustainability,
                          ecoFriendly: e.target.checked
                        }
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="ecoFriendly">Eco-Friendly</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="recyclable"
                      type="checkbox"
                      checked={formData.sustainability.recyclable}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sustainability: {
                          ...prev.sustainability,
                          recyclable: e.target.checked
                        }
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="recyclable">Riciclabile</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="ethicalProduction"
                      type="checkbox"
                      checked={formData.sustainability.ethicalProduction}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sustainability: {
                          ...prev.sustainability,
                          ethicalProduction: e.target.checked
                        }
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="ethicalProduction">Produzione Etica</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href={`/products/${product.id}`}>
            <Button type="button" variant="outline">
              Annulla
            </Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Salva Modifiche
          </Button>
        </div>
      </form>
    </div>
  )
}