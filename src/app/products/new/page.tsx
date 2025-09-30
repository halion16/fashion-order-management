'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import Link from 'next/link'
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

const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '46', '48', '50', '52']

const commonColors = [
  { name: 'Nero', hex: '#000000' },
  { name: 'Bianco', hex: '#FFFFFF' },
  { name: 'Blu Navy', hex: '#000080' },
  { name: 'Grigio', hex: '#808080' },
  { name: 'Marrone', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Rosso', hex: '#FF0000' },
  { name: 'Verde', hex: '#008000' }
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
  const { addProduct, suppliers, loadData } = useAppStore()

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])
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
  const [newVariant, setNewVariant] = useState<Omit<ProductVariant, 'id' | 'supplierPrices'>>({
    sku: '',
    color: '',
    colorHex: '',
    size: '',
    material: '',
    price: 0,
    costPrice: 0,
    minimumOrderQuantity: 1,
    weight: 0,
    images: []
  })
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [supplierPriceLists, setSupplierPriceLists] = useState<SupplierPriceList[]>([])
  const [newMaterial, setNewMaterial] = useState('')
  const [newCareInstruction, setNewCareInstruction] = useState('')
  const [newTag, setNewTag] = useState('')
  const [customSizes, setCustomSizes] = useState<string[]>([])
  const [newCustomSize, setNewCustomSize] = useState('')
  const [showCustomSizeInput, setShowCustomSizeInput] = useState<Record<number, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newSupplierPriceList, setNewSupplierPriceList] = useState({
    supplierName: '',
    basePrice: 0,
    currency: 'EUR',
    minimumOrderQuantity: 1,
    leadTimeDays: 30,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: ''
  })
  const [customSizes, setCustomSizes] = useState<string[]>([])
  const [newCustomSize, setNewCustomSize] = useState('')
  const [showCustomSizeInput, setShowCustomSizeInput] = useState<Record<number, boolean>>({})

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
    if (newVariant.sku.trim() && newVariant.color.trim() && newVariant.size && newVariant.price > 0) {
      const variant: ProductVariant = {
        id: generateId(),
        ...newVariant,
        supplierPrices: []
      }
      setVariants([...variants, variant])
      setNewVariant({
        sku: '',
        color: '',
        colorHex: '',
        size: '',
        material: '',
        price: 0,
        costPrice: 0,
        minimumOrderQuantity: 1,
        weight: 0,
        images: []
      })
    }
  }

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

  const toggleCustomSizeInput = (variantIndex: number) => {
    setShowCustomSizeInput(prev => ({
      ...prev,
      [variantIndex]: !prev[variantIndex]
    }))
  }

  const addCustomSizeForVariant = (variantIndex: number, newSize: string) => {
    if (newSize.trim() && !customSizes.includes(newSize.trim()) && !commonSizes.includes(newSize.trim())) {
      setCustomSizes([...customSizes, newSize.trim()])
      updateVariant(variantIndex, { size: newSize.trim() })
      setShowCustomSizeInput(prev => ({
        ...prev,
        [variantIndex]: false
      }))
    }
  }

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setVariants(variants.map((variant, i) =>
      i === index ? { ...variant, ...updates } : variant
    ))
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

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

  const updateSupplierPriceList = (index: number, updates: Partial<SupplierPriceList>) => {
    setSupplierPriceLists(supplierPriceLists.map((priceList, i) =>
      i === index ? { ...priceList, ...updates } : priceList
    ))
  }

  const addDiscountTier = (priceListIndex: number) => {
    const updatedPriceLists = [...supplierPriceLists]
    const newTier = {
      minimumQuantity: 10,
      discountPercentage: 5,
      unitPrice: updatedPriceLists[priceListIndex].basePrice * 0.95
    }
    updatedPriceLists[priceListIndex].discountTiers.push(newTier)
    setSupplierPriceLists(updatedPriceLists)
  }

  const removeDiscountTier = (priceListIndex: number, tierIndex: number) => {
    const updatedPriceLists = [...supplierPriceLists]
    updatedPriceLists[priceListIndex].discountTiers = updatedPriceLists[priceListIndex].discountTiers.filter((_, i) => i !== tierIndex)
    setSupplierPriceLists(updatedPriceLists)
  }

  const updateDiscountTier = (priceListIndex: number, tierIndex: number, updates: Partial<{ minimumQuantity: number; discountPercentage: number; unitPrice: number }>) => {
    const updatedPriceLists = [...supplierPriceLists]
    const tier = updatedPriceLists[priceListIndex].discountTiers[tierIndex]

    if (updates.minimumQuantity !== undefined) {
      tier.minimumQuantity = updates.minimumQuantity
    }
    if (updates.discountPercentage !== undefined) {
      tier.discountPercentage = updates.discountPercentage
      tier.unitPrice = updatedPriceLists[priceListIndex].basePrice * (1 - updates.discountPercentage / 100)
    }
    if (updates.unitPrice !== undefined) {
      tier.unitPrice = updates.unitPrice
      tier.discountPercentage = ((updatedPriceLists[priceListIndex].basePrice - updates.unitPrice) / updatedPriceLists[priceListIndex].basePrice) * 100
    }

    setSupplierPriceLists(updatedPriceLists)
  }

  const addCustomSize = () => {
    if (newCustomSize.trim() && !customSizes.includes(newCustomSize.trim()) && !commonSizes.includes(newCustomSize.trim())) {
      setCustomSizes([...customSizes, newCustomSize.trim()])
      setNewCustomSize('')
    }
  }

  const removeCustomSize = (size: string) => {
    setCustomSizes(customSizes.filter(s => s !== size))
    // Remove this size from any variants that are using it
    setVariants(variants.map(variant =>
      variant.size === size ? { ...variant, size: '' } : variant
    ))
  }

  const toggleCustomSizeInput = (variantIndex: number) => {
    setShowCustomSizeInput(prev => ({
      ...prev,
      [variantIndex]: !prev[variantIndex]
    }))
  }

  const addCustomSizeForVariant = (variantIndex: number, customSize: string) => {
    if (customSize.trim()) {
      const trimmedSize = customSize.trim()

      // Add to custom sizes if not already present
      if (!customSizes.includes(trimmedSize) && !commonSizes.includes(trimmedSize)) {
        setCustomSizes([...customSizes, trimmedSize])
      }

      // Set the size for this variant
      updateVariant(variantIndex, { size: trimmedSize })

      // Hide the input
      setShowCustomSizeInput(prev => ({
        ...prev,
        [variantIndex]: false
      }))
    }
  }

  const getAllAvailableSizes = () => {
    return [...commonSizes, ...customSizes].sort()
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

    // Debug: Log supplier price lists before saving
    console.log('Salvando prodotto con listini fornitori:', {
      productName: product.name,
      supplierPriceListsCount: supplierPriceLists.length,
      supplierPriceLists: supplierPriceLists.map(pl => ({
        supplier: pl.supplierName,
        basePrice: pl.basePrice,
        currency: pl.currency,
        discountTiersCount: pl.discountTiers.length
      }))
    })

    try {
      addProduct(product)

      // Success notification
      console.log(`✅ Prodotto "${product.name}" salvato con successo!`, {
        listiniFornitori: supplierPriceLists.length,
        varianti: variants.length,
        tagliePersonalizzate: customSizes.length
      })

      router.push('/products')
    } catch (error) {
      console.error('❌ Errore durante il salvataggio del prodotto:', error)
      // You could add a toast notification here
    }
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

                <div>
                  <p className="text-sm text-gray-600 mb-2">Taglie standard:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSizes.map((size) => (
                      <Badge key={size} variant="outline" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                {customSizes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Taglie personalizzate:</p>
                    <div className="flex flex-wrap gap-2">
                      {customSizes.map((size) => (
                        <Badge key={size} variant="secondary" className="flex items-center gap-1">
                          {size}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeCustomSize(size)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p>💡 Le taglie personalizzate saranno disponibili per tutte le varianti di questo prodotto.</p>
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
                        {[...commonSizes, ...customSizes].map((size) => (
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
                </CardContent>
              </Card>
            )}

            {errors.variants && <p className="text-sm text-red-600">{errors.variants}</p>}
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
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
                  />
                  <Button type="button" onClick={() => {}}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Funzionalità materiali in sviluppo</p>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Listini Fornitori</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form for new supplier price list */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-4">Nuovo Listino Fornitore</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <Label>Prezzo Base *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newSupplierPriceList.basePrice}
                        onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
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
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button type="button" onClick={addSupplierPriceList}>
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi Listino
                    </Button>
                  </div>
                </div>

                {/* Display existing supplier price lists */}
                {supplierPriceLists.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Listini Creati ({supplierPriceLists.length})</h4>
                    {supplierPriceLists.map((priceList, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{priceList.supplierName}</p>
                          <p className="text-sm text-gray-600">
                            {priceList.basePrice.toFixed(2)} {priceList.currency}
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
                )}
              </CardContent>
            </Card>
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
          <Link href="/products">
            <Button type="button" variant="outline">
                                  {color.name}
                                </button>
                              ))}
                            </div>
                            {errors[`variant_${index}_color`] && <p className="text-sm text-red-600">{errors[`variant_${index}_color`]}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label>Taglia *</Label>
                            <div className="flex space-x-2">
                              <Input
                                value={variant.size}
                                onChange={(e) => updateVariant(index, { size: e.target.value })}
                                placeholder="Es. 48, M, L"
                                className={`flex-1 ${errors[`variant_${index}_size`] ? 'border-red-500' : ''}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleCustomSizeInput(index)}
                                className="whitespace-nowrap"
                              >
                                {showCustomSizeInput[index] ? 'Annulla' : 'Taglia Custom'}
                              </Button>
                            </div>

                            {showCustomSizeInput[index] && (
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Inserisci taglia personalizzata..."
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      addCustomSizeForVariant(index, e.currentTarget.value)
                                      e.currentTarget.value = ''
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = e.currentTarget.parentElement?.querySelector('input')
                                    if (input?.value) {
                                      addCustomSizeForVariant(index, input.value)
                                      input.value = ''
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Taglie standard:</p>
                                <div className="flex flex-wrap gap-1">
                                  {commonSizes.slice(0, 8).map((size) => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => updateVariant(index, { size })}
                                      className={`text-xs px-2 py-1 rounded transition-colors ${
                                        variant.size === size
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-gray-100 hover:bg-gray-200'
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                  {commonSizes.length > 8 && (
                                    <span className="text-xs text-gray-400 px-1">...</span>
                                  )}
                                </div>
                              </div>

                              {customSizes.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Taglie personalizzate:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {customSizes.map((size) => (
                                      <button
                                        key={size}
                                        type="button"
                                        onClick={() => updateVariant(index, { size })}
                                        className={`text-xs px-2 py-1 rounded transition-colors ${
                                          variant.size === size
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                                        }`}
                                      >
                                        {size}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
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
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
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
                      <Button
                        key={material.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.materials.some(m => m.name === material.name)) {
                            setFormData(prev => ({
                              ...prev,
                              materials: [...prev.materials, { ...material }]
                            }))
                          }
                        }}
                      >
                        {material.name} ({material.percentage}%)
                      </Button>
                    ))}
                  </div>
                </div>

                {formData.materials.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Materiali selezionati:</p>
                    <div className="space-y-2">
                      {formData.materials.map((material, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Input
                              value={material.name}
                              onChange={(e) => updateMaterial(index, { name: e.target.value })}
                              placeholder="Nome materiale"
                            />
                            <Input
                              type="number"
                              value={material.percentage}
                              onChange={(e) => updateMaterial(index, { percentage: parseInt(e.target.value) || 0 })}
                              placeholder="%"
                              min="0"
                              max="100"
                            />
                            <Input
                              value={material.origin || ''}
                              onChange={(e) => updateMaterial(index, { origin: e.target.value })}
                              placeholder="Origine (opzionale)"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterial(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.materials && <p className="text-sm text-red-600">{errors.materials}</p>}
              </CardContent>
            </Card>

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
                      <Button
                        key={instruction.description}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.careInstructions.some(c => c.description === instruction.description)) {
                            setFormData(prev => ({
                              ...prev,
                              careInstructions: [...prev.careInstructions, { ...instruction }]
                            }))
                          }
                        }}
                        className={instruction.warning ? 'border-orange-300 text-orange-700' : ''}
                      >
                        {instruction.description}
                      </Button>
                    ))}
                  </div>
                </div>

                {formData.careInstructions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Istruzioni selezionate:</p>
                    <div className="space-y-2">
                      {formData.careInstructions.map((instruction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm px-2 py-1 rounded ${
                              instruction.warning
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {instruction.icon}
                            </span>
                            <span className="font-medium">{instruction.description}</span>
                            {instruction.temperature && (
                              <Badge variant="secondary">{instruction.temperature}</Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCareInstruction(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Listini Fornitori</CardTitle>
                <Button
                  type="button"
                  onClick={addSupplierPriceList}
                  disabled={!newSupplierPriceList.supplierName.trim() || newSupplierPriceList.basePrice <= 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Listino
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form for new supplier price list */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-4">Nuovo Listino Fornitore</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <Label>Prezzo Base *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newSupplierPriceList.basePrice}
                        onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valuta</Label>
                      <Select value={newSupplierPriceList.currency} onValueChange={(value) => setNewSupplierPriceList(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>MOQ (Quantità Minima)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newSupplierPriceList.minimumOrderQuantity}
                        onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, minimumOrderQuantity: parseInt(e.target.value) || 1 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lead Time (giorni)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newSupplierPriceList.leadTimeDays}
                        onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, leadTimeDays: parseInt(e.target.value) || 30 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Inizio Validità</Label>
                      <Input
                        type="date"
                        value={newSupplierPriceList.validFrom}
                        onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, validFrom: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Fine Validità (opzionale)</Label>
                      <Input
                        type="date"
                        value={newSupplierPriceList.validTo}
                        onChange={(e) => setNewSupplierPriceList(prev => ({ ...prev, validTo: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Existing supplier price lists */}
                {supplierPriceLists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun listino fornitore aggiunto</p>
                    <p className="text-sm">Compila il form sopra per aggiungere il primo listino</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {supplierPriceLists.map((priceList, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-medium text-lg">{priceList.supplierName}</h4>
                            <p className="text-sm text-gray-600">
                              Prezzo base: {formatCurrency(priceList.basePrice)} {priceList.currency} |
                              MOQ: {priceList.minimumOrderQuantity} |
                              Lead time: {priceList.leadTimeDays} giorni
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={priceList.isActive ? 'default' : 'secondary'}>
                              {priceList.isActive ? 'Attivo' : 'Inattivo'}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSupplierPriceList(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Stato</Label>
                            <Select
                              value={priceList.isActive ? 'true' : 'false'}
                              onValueChange={(value) => updateSupplierPriceList(index, { isActive: value === 'true' })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Attivo</SelectItem>
                                <SelectItem value="false">Inattivo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Validità</Label>
                            <p className="text-sm text-gray-600">
                              Dal {priceList.validFrom.toLocaleDateString()}
                              {priceList.validTo && ` al ${priceList.validTo.toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>

                        {/* Discount Tiers */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">Scaglioni di Sconto</h5>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => addDiscountTier(index)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Aggiungi Scaglione
                            </Button>
                          </div>

                          {priceList.discountTiers.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4">Nessuno scaglione di sconto configurato</p>
                          ) : (
                            <div className="space-y-2">
                              {priceList.discountTiers.map((tier, tierIndex) => (
                                <div key={tierIndex} className="flex items-center space-x-2 p-3 border rounded bg-gray-50">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <div>
                                      <Label className="text-xs">Quantità Min.</Label>
                                      <Input
                                        type="number"
                                        size="sm"
                                        value={tier.minimumQuantity}
                                        onChange={(e) => updateDiscountTier(index, tierIndex, { minimumQuantity: parseInt(e.target.value) || 0 })}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Sconto %</Label>
                                      <Input
                                        type="number"
                                        size="sm"
                                        step="0.1"
                                        value={tier.discountPercentage.toFixed(1)}
                                        onChange={(e) => updateDiscountTier(index, tierIndex, { discountPercentage: parseFloat(e.target.value) || 0 })}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Prezzo Unitario</Label>
                                      <Input
                                        type="number"
                                        size="sm"
                                        step="0.01"
                                        value={tier.unitPrice.toFixed(2)}
                                        onChange={(e) => updateDiscountTier(index, tierIndex, { unitPrice: parseFloat(e.target.value) || 0 })}
                                      />
                                    </div>
                                    <div className="flex items-end">
                                      <span className="text-sm text-gray-600">
                                        {formatCurrency(tier.unitPrice)} {priceList.currency}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDiscountTier(index, tierIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary Section */}
                {supplierPriceLists.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Riepilogo Listini</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700 font-medium">Totale Listini</p>
                        <p className="text-2xl font-bold text-blue-900">{supplierPriceLists.length}</p>
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium">Fornitori Attivi</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {supplierPriceLists.filter(pl => pl.isActive).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium">Totale Scaglioni</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {supplierPriceLists.reduce((total, pl) => total + pl.discountTiers.length, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-blue-700">
                      💡 I listini verranno salvati insieme al prodotto quando clicchi "Salva Prodotto"
                    </div>
                  </div>
                )}
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>📋 {variants.length} varianti</span>
            <span>💰 {supplierPriceLists.length} listini fornitori</span>
            <span>🏷️ {customSizes.length} taglie personalizzate</span>
          </div>
          <div className="flex space-x-4">
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
        </div>
      </form>
    </div>
  )
}