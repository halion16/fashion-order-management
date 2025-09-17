'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { validateEmail, validatePhone } from '@/lib/utils'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { Supplier } from '@/types'

interface SupplierFormData {
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    country: string
    zipCode: string
  }
  specializations: string[]
  leadTimesDays: number
  qualityRating: number
  paymentTerms: string
  notes: string
}

export default function EditSupplierPage() {
  const params = useParams()
  const router = useRouter()
  const { suppliers, updateSupplier, loadData } = useAppStore()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      country: 'Italia',
      zipCode: ''
    },
    specializations: [],
    leadTimesDays: 30,
    qualityRating: 4.0,
    paymentTerms: '30 giorni fine mese',
    notes: ''
  })
  const [newSpecialization, setNewSpecialization] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const foundSupplier = suppliers.find(s => s.id === params.id)
    if (foundSupplier) {
      setSupplier(foundSupplier)
      setFormData({
        name: foundSupplier.name,
        email: foundSupplier.email,
        phone: foundSupplier.phone,
        address: foundSupplier.address,
        specializations: [...foundSupplier.specializations],
        leadTimesDays: foundSupplier.leadTimesDays,
        qualityRating: foundSupplier.qualityRating,
        paymentTerms: foundSupplier.paymentTerms,
        notes: foundSupplier.notes || ''
      })
    }
  }, [suppliers, params.id])

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Fornitore non trovato</h1>
        <p className="text-gray-600 mt-2">Il fornitore richiesto non esiste o è stato eliminato.</p>
        <Link href="/suppliers" className="mt-4 inline-block">
          <Button>Torna ai Fornitori</Button>
        </Link>
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome fornitore richiesto'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email richiesta'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email non valida'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefono richiesto'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido'
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Indirizzo richiesto'
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'Città richiesta'
    }

    if (!formData.address.zipCode.trim()) {
      newErrors.zipCode = 'CAP richiesto'
    }

    if (formData.specializations.length === 0) {
      newErrors.specializations = 'Almeno una specializzazione richiesta'
    }

    if (formData.leadTimesDays < 1 || formData.leadTimesDays > 365) {
      newErrors.leadTimesDays = 'Lead time deve essere tra 1 e 365 giorni'
    }

    if (formData.qualityRating < 1 || formData.qualityRating > 5) {
      newErrors.qualityRating = 'Rating deve essere tra 1 e 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }))
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const updatedSupplier: Supplier = {
      ...supplier,
      ...formData,
      updatedAt: new Date()
    }

    updateSupplier(updatedSupplier)
    router.push(`/suppliers/${supplier.id}`)
  }

  const commonSpecializations = [
    'Abbigliamento uomo',
    'Abbigliamento donna',
    'Accessori',
    'Calzature',
    'Borse',
    'Cinture',
    'Giacche',
    'Pantaloni',
    'Camicie',
    'T-shirt',
    'Maglieria',
    'Intimo',
    'Costumi da bagno'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/suppliers/${supplier.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Modifica Fornitore
          </h1>
          <p className="text-gray-600">
            Modifica i dati di {supplier.name}
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
                <Label htmlFor="name">Nome Fornitore *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Es. Tessuti Milano S.r.l."
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ordini@fornitore.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+39 02 1234567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Condizioni Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  placeholder="30 giorni fine mese"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Indirizzo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street">Via/Indirizzo *</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  placeholder="Via della Moda 15"
                  className={errors.street ? 'border-red-500' : ''}
                />
                {errors.street && <p className="text-sm text-red-600">{errors.street}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Città *</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  placeholder="Milano"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">CAP *</Label>
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  placeholder="20121"
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && <p className="text-sm text-red-600">{errors.zipCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Paese</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  placeholder="Italia"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle>Specializzazioni *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Aggiungi specializzazione..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <Button type="button" onClick={addSpecialization}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Specializations */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Specializzazioni comuni:</p>
              <div className="flex flex-wrap gap-2">
                {commonSpecializations.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      if (!formData.specializations.includes(spec)) {
                        setFormData(prev => ({
                          ...prev,
                          specializations: [...prev.specializations, spec]
                        }))
                      }
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Specializations */}
            {formData.specializations.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Specializzazioni selezionate:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {errors.specializations && <p className="text-sm text-red-600">{errors.specializations}</p>}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Metriche Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadTimesDays">Lead Time (giorni) *</Label>
                <Input
                  id="leadTimesDays"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.leadTimesDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadTimesDays: parseInt(e.target.value) || 30 }))}
                  className={errors.leadTimesDays ? 'border-red-500' : ''}
                />
                {errors.leadTimesDays && <p className="text-sm text-red-600">{errors.leadTimesDays}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityRating">Rating Qualità (1-5) *</Label>
                <Input
                  id="qualityRating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.qualityRating}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualityRating: parseFloat(e.target.value) || 4.0 }))}
                  className={errors.qualityRating ? 'border-red-500' : ''}
                />
                {errors.qualityRating && <p className="text-sm text-red-600">{errors.qualityRating}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive sul fornitore..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href={`/suppliers/${supplier.id}`}>
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