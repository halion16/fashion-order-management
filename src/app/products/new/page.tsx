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
import { generateId, formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save, Plus, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Product, ProductCategory, Season, ProductVariant } from '@/types'

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
  materials: string[]
  careInstructions: string[]
  targetPrice: number
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
    materials: [],
    careInstructions: [],
    targetPrice: 0
  })
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newMaterial, setNewMaterial] = useState('')
  const [newCareInstruction, setNewCareInstruction] = useState('')
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
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addMaterial = () => {
    if (newMaterial.trim() && !formData.materials.includes(newMaterial.trim())) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()]
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

  const addCareInstruction = () => {
    if (newCareInstruction.trim() && !formData.careInstructions.includes(newCareInstruction.trim())) {
      setFormData(prev => ({
        ...prev,
        careInstructions: [...prev.careInstructions, newCareInstruction.trim()]
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

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: generateId(),
      sku: '',
      color: '',
      size: '',
      material: '',
      price: formData.targetPrice || 0,
      costPrice: 0,
      minimumOrderQuantity: 10
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
      variants: variants,
      materials: formData.materials,
      careInstructions: formData.careInstructions,
      targetPrice: formData.targetPrice,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    addProduct(product)
    router.push('/products')
  }

  const commonMaterials = [
    'Cotone', 'Lino', 'Lana', 'Cashmere', 'Seta', 'Poliestere', 'Viscosa',
    'Elastan', 'Pelle', 'Pelle sintetica', 'Denim', 'Velluto'
  ]

  const commonCareInstructions = [
    'Lavaggio a mano', 'Lavaggio in lavatrice 30°C', 'Lavaggio a secco',
    'Non candeggiare', 'Stirare a bassa temperatura', 'Non stirare',
    'Asciugare all\'ombra', 'Non centrifugare'
  ]

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '46', '48', '50', '52']
  const commonColors = ['Nero', 'Bianco', 'Grigio', 'Blu Navy', 'Rosso', 'Verde', 'Marrone', 'Beige']

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
        {/* Basic Information */}
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

        {/* Materials */}
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
                        <Input
                          value={variant.color}
                          onChange={(e) => updateVariant(index, { color: e.target.value })}
                          placeholder="Es. Blu Navy"
                          className={errors[`variant_${index}_color`] ? 'border-red-500' : ''}
                        />
                        <div className="flex flex-wrap gap-1">
                          {commonColors.slice(0, 4).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => updateVariant(index, { color })}
                              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              {color}
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
                        <div className="text-sm font-medium">
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