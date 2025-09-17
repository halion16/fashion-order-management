'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { generateId, formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save, Plus, X, Trash2, Package, Palette, FileText, DollarSign, Leaf, Upload, Camera } from 'lucide-react'
import Link from 'next/link'
import { Product, ProductCategory, Season, ProductVariant, MaterialSpec, CareInstruction, ProductImage, TechnicalSheet, SupplierPriceList, SustainabilityInfo, ProductMeasurements, ProductStatus, FitType, ImageType } from '@/types'

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

interface ProductFormData {
  name: string
  code: string
  category: ProductCategory | ''
  subcategory: string
  description: string
  season: Season | ''
  collection: string
  collectionYear: number
  materials: MaterialSpec[]
  careInstructions: CareInstruction[]
  targetPrice: number
  tags: string[]
  status: ProductStatus
  technicalSheet?: TechnicalSheet
  sustainability: SustainabilityInfo
  measurements: ProductMeasurements
}

export default function NewProductPage() {
  const router = useRouter()
  const { addProduct } = useAppStore()
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    category: '',
    subcategory: '',
    description: '',
    season: '',
    collection: '',
    collectionYear: new Date().getFullYear(),
    materials: [],
    careInstructions: [],
    targetPrice: 0,
    tags: [],
    status: 'bozza',
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
    }
  })
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [supplierPriceLists, setSupplierPriceLists] = useState<SupplierPriceList[]>([])
  const [newMaterial, setNewMaterial] = useState('')
  const [newCareInstruction, setNewCareInstruction] = useState('')
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome prodotto richiesto'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Codice prodotto richiesto'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria richiesta'
    }

    if (!formData.subcategory.trim()) {
      newErrors.subcategory = 'Sottocategoria richiesta'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrizione richiesta'
    }

    if (!formData.season) {
      newErrors.season = 'Stagione richiesta'
    }

    if (!formData.collection.trim()) {
      newErrors.collection = 'Collezione richiesta'
    }

    if (formData.materials.length === 0) {
      newErrors.materials = 'Almeno un materiale richiesto'
    }

    if (formData.collectionYear < 2020 || formData.collectionYear > new Date().getFullYear() + 2) {
      newErrors.collectionYear = 'Anno collezione non valido'
    }

    if (variants.length === 0) {
      newErrors.variants = 'Almeno una variante richiesta'
    }

    // Validate variants
    variants.forEach((variant, index) => {
      if (!variant.sku.trim()) {
        newErrors[`variant_${index}_sku`] = 'SKU richiesto'
      }
      if (!variant.color.trim()) {
        newErrors[`variant_${index}_color`] = 'Colore richiesto'
      }
      if (!variant.size.trim()) {
        newErrors[`variant_${index}_size`] = 'Taglia richiesta'
      }
      if (variant.price <= 0) {
        newErrors[`variant_${index}_price`] = 'Prezzo deve essere maggiore di 0'
      }
      if (variant.costPrice < 0) {
        newErrors[`variant_${index}_costPrice`] = 'Costo non può essere negativo'
      }
      if (variant.minimumOrderQuantity <= 0) {
        newErrors[`variant_${index}_moq`] = 'MOQ deve essere maggiore di 0'
      }
      if (!variant.colorHex && variant.color) {
        // Auto-generate color hex if missing
        const colorMap: Record<string, string> = {
          'Nero': '#000000', 'Bianco': '#FFFFFF', 'Grigio': '#808080',
          'Blu Navy': '#1e3a8a', 'Rosso': '#dc2626', 'Verde': '#16a34a',
          'Marrone': '#a3734b', 'Beige': '#f5f5dc'
        }
        if (colorMap[variant.color]) {
          updateVariant(index, { colorHex: colorMap[variant.color] })
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addMaterial = () => {
    if (newMaterial.trim() && !formData.materials.some(m => m.name === newMaterial.trim())) {
      const newMaterialSpec: MaterialSpec = {
        name: newMaterial.trim(),
        percentage: 100,
        properties: []
      }
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterialSpec]
      }))
      setNewMaterial('')
    }
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  const updateMaterial = (index: number, updates: Partial<MaterialSpec>) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) =>
        i === index ? { ...material, ...updates } : material
      )
    }))
  }

  const addCareInstruction = () => {
    if (newCareInstruction.trim() && !formData.careInstructions.some(c => c.description === newCareInstruction.trim())) {
      const newInstruction: CareInstruction = {
        icon: 'default',
        description: newCareInstruction.trim(),
        warning: false
      }
      setFormData(prev => ({
        ...prev,
        careInstructions: [...prev.careInstructions, newInstruction]
      }))
      setNewCareInstruction('')
    }
  }

  const removeCareInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      careInstructions: prev.careInstructions.filter((_, i) => i !== index)
    }))
  }

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

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: generateId(),
      sku: '',
      color: '',
      colorHex: '',
      size: '',
      material: '',
      price: formData.targetPrice || 0,
      costPrice: 0,
      minimumOrderQuantity: 10,
      stockQuantity: 0,
      weight: 0,
      images: [],
      supplierPrices: []
    }
    setVariants([...variants, newVariant])
  }

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setVariants(variants.map((variant, i) =>
      i === index ? { ...variant, ...updates } : variant
    ))
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const product: Product = {
      id: generateId(),
      name: formData.name,
      code: formData.code,
      category: formData.category as ProductCategory,
      subcategory: formData.subcategory,
      description: formData.description,
      season: formData.season as Season,
      collection: formData.collection,
      collectionYear: formData.collectionYear,
      variants: variants,
      materials: formData.materials,
      careInstructions: formData.careInstructions,
      targetPrice: formData.targetPrice,
      images: productImages,
      technicalSheet: formData.technicalSheet,
      supplierPriceLists: supplierPriceLists,
      sustainability: formData.sustainability,
      measurements: formData.measurements,
      tags: formData.tags,
      status: formData.status,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    addProduct(product)
    router.push('/products')
  }

  const commonMaterials: MaterialSpec[] = [
    { name: 'Cotone', percentage: 100, properties: ['Traspirante', 'Naturale'] },
    { name: 'Lino', percentage: 100, properties: ['Fresco', 'Naturale'] },
    { name: 'Lana', percentage: 100, properties: ['Termico', 'Naturale'] },
    { name: 'Cashmere', percentage: 100, properties: ['Lusso', 'Morbido'] },
    { name: 'Seta', percentage: 100, properties: ['Elegante', 'Naturale'] },
    { name: 'Poliestere', percentage: 100, properties: ['Resistente', 'Sintetico'] },
    { name: 'Viscosa', percentage: 100, properties: ['Morbido', 'Semi-sintetico'] },
    { name: 'Elastan', percentage: 5, properties: ['Elastico', 'Stretch'] }
  ]

  const commonCareInstructions: CareInstruction[] = [
    { icon: 'wash-hand', description: 'Lavaggio a mano', warning: false },
    { icon: 'wash-30', description: 'Lavaggio in lavatrice 30°C', warning: false },
    { icon: 'dry-clean', description: 'Lavaggio a secco', warning: false },
    { icon: 'no-bleach', description: 'Non candeggiare', warning: true },
    { icon: 'iron-low', description: 'Stirare a bassa temperatura', warning: false },
    { icon: 'no-iron', description: 'Non stirare', warning: true },
    { icon: 'dry-shade', description: 'Asciugare all\'ombra', warning: false },
    { icon: 'no-spin', description: 'Non centrifugare', warning: true }
  ]

  const commonTags = [
    'casual', 'formale', 'business', 'sport', 'elegante', 'trendy',
    'sostenibile', 'luxury', 'basic', 'limited-edition'
  ]

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '46', '48', '50', '52']
  const commonColors = [
    { name: 'Nero', hex: '#000000' },
    { name: 'Bianco', hex: '#FFFFFF' },
    { name: 'Grigio', hex: '#808080' },
    { name: 'Blu Navy', hex: '#1e3a8a' },
    { name: 'Rosso', hex: '#dc2626' },
    { name: 'Verde', hex: '#16a34a' },
    { name: 'Marrone', hex: '#a3734b' },
    { name: 'Beige', hex: '#f5f5dc' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Nuovo Prodotto
          </h1>
          <p className="text-gray-600">
            Aggiungi un nuovo prodotto al catalogo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Base</span>
            </TabsTrigger>
            <TabsTrigger value="variants" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Varianti</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Tecnico</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Immagini</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Prezzi</span>
            </TabsTrigger>
            <TabsTrigger value="sustainability" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Sostenibilità</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Generali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Prodotto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es. Giacca Blazer Elegante"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Codice Prodotto *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="Es. GBE001"
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ProductCategory }))}>
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Sottocategoria *</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="Es. Giacche, T-shirt, Cinture"
                      className={errors.subcategory ? 'border-red-500' : ''}
                    />
                    {errors.subcategory && <p className="text-sm text-red-600">{errors.subcategory}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Stagione *</Label>
                    <Select value={formData.season} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value as Season }))}>
                      <SelectTrigger className={errors.season ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleziona stagione" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASONS.map((season) => (
                          <SelectItem key={season.value} value={season.value}>
                            {season.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.season && <p className="text-sm text-red-600">{errors.season}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collection">Collezione *</Label>
                    <Input
                      id="collection"
                      value={formData.collection}
                      onChange={(e) => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                      placeholder="Es. Formal 2024, Casual Spring"
                      className={errors.collection ? 'border-red-500' : ''}
                    />
                    {errors.collection && <p className="text-sm text-red-600">{errors.collection}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collectionYear">Anno Collezione *</Label>
                    <Input
                      id="collectionYear"
                      type="number"
                      min="2020"
                      max={new Date().getFullYear() + 2}
                      value={formData.collectionYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, collectionYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className={errors.collectionYear ? 'border-red-500' : ''}
                    />
                    {errors.collectionYear && <p className="text-sm text-red-600">{errors.collectionYear}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Stato Prodotto</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ProductStatus }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bozza">Bozza</SelectItem>
                        <SelectItem value="attivo">Attivo</SelectItem>
                        <SelectItem value="sospeso">Sospeso</SelectItem>
                        <SelectItem value="discontinuato">Discontinuato</SelectItem>
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
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Prezzo Target</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="Prezzo di vendita suggerito"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tag e Caratteristiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div>
                  <p className="text-sm text-gray-600 mb-2">Tag comuni:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.tags.includes(tag)) {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }))
                          }
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tag selezionati:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(index)} />
                        </Badge>
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
            <CardTitle>Materiali *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                placeholder="Aggiungi materiale..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
              />
              <Button type="button" onClick={addMaterial}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Materiali comuni:</p>
              <div className="flex flex-wrap gap-2">
                {commonMaterials.map((material) => (
                  <button
                    key={material}
                    type="button"
                    onClick={() => {
                      if (!formData.materials.includes(material)) {
                        setFormData(prev => ({
                          ...prev,
                          materials: [...prev.materials, material]
                        }))
                      }
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>

            {formData.materials.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Materiali selezionati:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.materials.map((material, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {errors.materials && <p className="text-sm text-red-600">{errors.materials}</p>}
          </CardContent>
        </Card>

        </Card>

        {/* Care Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Istruzioni di Cura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newCareInstruction}
                onChange={(e) => setNewCareInstruction(e.target.value)}
                placeholder="Aggiungi istruzione..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCareInstruction())}
              />
              <Button type="button" onClick={addCareInstruction}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Istruzioni comuni:</p>
              <div className="flex flex-wrap gap-2">
                {commonCareInstructions.map((instruction) => (
                  <button
                    key={instruction}
                    type="button"
                    onClick={() => {
                      if (!formData.careInstructions.includes(instruction)) {
                        setFormData(prev => ({
                          ...prev,
                          careInstructions: [...prev.careInstructions, instruction]
                        }))
                      }
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {instruction}
                  </button>
                ))}
              </div>
            </div>

            {formData.careInstructions.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Istruzioni selezionate:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.careInstructions.map((instruction, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {instruction}
                      <button
                        type="button"
                        onClick={() => removeCareInstruction(index)}
                        className="ml-2 text-green-600 hover:text-green-800"
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

        </Card>

        {/* Variants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Varianti Prodotto *</CardTitle>
            <Button type="button" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Variante
            </Button>
          </CardHeader>
          <CardContent>
            {variants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nessuna variante aggiunta</p>
                <p className="text-sm">Clicca "Aggiungi Variante" per iniziare</p>
              </div>
            ) : (
              <div className="space-y-6">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Variante {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>SKU *</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, { sku: e.target.value.toUpperCase() })}
                          placeholder="Es. GBE001-BLU-48"
                          className={errors[`variant_${index}_sku`] ? 'border-red-500' : ''}
                        />
                        {errors[`variant_${index}_sku`] && <p className="text-sm text-red-600">{errors[`variant_${index}_sku`]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Colore *</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={variant.color}
                            onChange={(e) => updateVariant(index, { color: e.target.value })}
                            placeholder="Es. Blu Navy"
                            className={`flex-1 ${errors[`variant_${index}_color`] ? 'border-red-500' : ''}`}
                          />
                          <Input
                            type="color"
                            value={variant.colorHex || '#000000'}
                            onChange={(e) => updateVariant(index, { colorHex: e.target.value })}
                            className="w-16"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {commonColors.slice(0, 4).map((color) => (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => updateVariant(index, { color: color.name, colorHex: color.hex })}
                              className="flex items-center text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <div
                                className="w-3 h-3 rounded-full mr-1 border"
                                style={{ backgroundColor: color.hex }}
                              />
                              {color.name}
                            </button>
                          ))}
                        </div>
                        {errors[`variant_${index}_color`] && <p className="text-sm text-red-600">{errors[`variant_${index}_color`]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Taglia *</Label>
                        <Input
                          value={variant.size}
                          onChange={(e) => updateVariant(index, { size: e.target.value })}
                          placeholder="Es. 48, M, L"
                          className={errors[`variant_${index}_size`] ? 'border-red-500' : ''}
                        />
                        <div className="flex flex-wrap gap-1">
                          {commonSizes.slice(0, 6).map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateVariant(index, { size })}
                              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                        {errors[`variant_${index}_size`] && <p className="text-sm text-red-600">{errors[`variant_${index}_size`]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Materiale Specifico</Label>
                        <Input
                          value={variant.material || ''}
                          onChange={(e) => updateVariant(index, { material: e.target.value })}
                          placeholder="Materiale variante (opzionale)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Prezzo Vendita *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, { price: parseFloat(e.target.value) || 0 })}
                          className={errors[`variant_${index}_price`] ? 'border-red-500' : ''}
                        />
                        {errors[`variant_${index}_price`] && <p className="text-sm text-red-600">{errors[`variant_${index}_price`]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Costo Produzione *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.costPrice}
                          onChange={(e) => updateVariant(index, { costPrice: parseFloat(e.target.value) || 0 })}
                          className={errors[`variant_${index}_costPrice`] ? 'border-red-500' : ''}
                        />
                        {errors[`variant_${index}_costPrice`] && <p className="text-sm text-red-600">{errors[`variant_${index}_costPrice`]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>MOQ (Quantità Minima) *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={variant.minimumOrderQuantity}
                          onChange={(e) => updateVariant(index, { minimumOrderQuantity: parseInt(e.target.value) || 1 })}
                          className={errors[`variant_${index}_moq`] ? 'border-red-500' : ''}
                        />
                        {errors[`variant_${index}_moq`] && <p className="text-sm text-red-600">{errors[`variant_${index}_moq`]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Stock Iniziale</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stockQuantity || 0}
                          onChange={(e) => updateVariant(index, { stockQuantity: parseInt(e.target.value) || 0 })}
                          placeholder="Quantità in magazzino"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Peso (g)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.weight || 0}
                          onChange={(e) => updateVariant(index, { weight: parseInt(e.target.value) || 0 })}
                          placeholder="Peso in grammi"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Margine</Label>
                        <div className="text-sm text-gray-600">
                          {variant.price > 0 && variant.costPrice > 0
                            ? `${(((variant.price - variant.costPrice) / variant.price) * 100).toFixed(1)}%`
                            : '-'
                          }
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Prezzo Visualizzato</Label>
                        <div className="text-sm font-medium flex items-center">
                          {variant.colorHex && (
                            <div
                              className="w-4 h-4 rounded-full mr-2 border"
                              style={{ backgroundColor: variant.colorHex }}
                            />
                          )}
                          {formatCurrency(variant.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.variants && <p className="text-sm text-red-600">{errors.variants}</p>}
          </CardContent>
        </Card>

        </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            {/* Materials */}
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Immagini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Funzionalità di upload immagini</p>
                  <p className="text-sm">Sarà implementata nella prossima versione</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prezzi Fornitori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Gestione prezzi fornitori</p>
                  <p className="text-sm">Configurazione prezzi per fornitore</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sostenibilità e Certificazioni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Eco-friendly</Label>
                    <Select
                      value={formData.sustainability.ecoFriendly ? 'true' : 'false'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        sustainability: { ...prev.sustainability, ecoFriendly: value === 'true' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sì</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Riciclabile</Label>
                    <Select
                      value={formData.sustainability.recyclable ? 'true' : 'false'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        sustainability: { ...prev.sustainability, recyclable: value === 'true' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sì</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Produzione Etica</Label>
                    <Select
                      value={formData.sustainability.ethicalProduction ? 'true' : 'false'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        sustainability: { ...prev.sustainability, ethicalProduction: value === 'true' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sì</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Punteggio Sostenibilità (0-10)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.sustainability.sustainabilityScore}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sustainability: { ...prev.sustainability, sustainabilityScore: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>

                {formData.sustainability.carbonFootprint !== undefined && (
                  <div className="space-y-2">
                    <Label>Impronta Carbonica (kg CO2)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.sustainability.carbonFootprint}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sustainability: { ...prev.sustainability, carbonFootprint: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/products">
            <Button type="button" variant="outline">
              Annulla
            </Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Salva Prodotto
          </Button>
        </div>
      </form>
    </div>
  )
}