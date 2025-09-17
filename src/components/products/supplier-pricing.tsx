'use client'

import { SupplierPriceList, VariantSupplierPrice } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, Clock, Package, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

interface SupplierPricingProps {
  supplierPriceLists: SupplierPriceList[]
  variantPrices?: VariantSupplierPrice[]
  selectedVariantId?: string
}

export function SupplierPricingSection({ supplierPriceLists, variantPrices, selectedVariantId }: SupplierPricingProps) {
  const activePriceLists = supplierPriceLists.filter(pl => pl.isActive)
  const expiredPriceLists = supplierPriceLists.filter(pl => !pl.isActive)

  if (supplierPriceLists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Listini Fornitori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Nessun listino fornitori disponibile</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getBestPrice = () => {
    const prices = activePriceLists.map(pl => pl.basePrice)
    return prices.length > 0 ? Math.min(...prices) : 0
  }

  const getWorstPrice = () => {
    const prices = activePriceLists.map(pl => pl.basePrice)
    return prices.length > 0 ? Math.max(...prices) : 0
  }

  const getAverageLeadTime = () => {
    if (activePriceLists.length === 0) return 0
    const totalLeadTime = activePriceLists.reduce((sum, pl) => sum + pl.leadTimeDays, 0)
    return Math.round(totalLeadTime / activePriceLists.length)
  }

  return (
    <div className="space-y-6">
      {/* Pricing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Panoramica Prezzi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(getBestPrice())}</div>
              <div className="text-sm text-green-600">Prezzo Migliore</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(getWorstPrice())}</div>
              <div className="text-sm text-red-600">Prezzo Massimo</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activePriceLists.length}</div>
              <div className="text-sm text-blue-600">Fornitori Attivi</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{getAverageLeadTime()}</div>
              <div className="text-sm text-yellow-600">Lead Time Medio (gg)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Price Lists */}
      {activePriceLists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              Listini Attivi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePriceLists.map((priceList) => (
              <div key={priceList.supplierId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-lg">{priceList.supplierName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{formatCurrency(priceList.basePrice)} {priceList.currency}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{priceList.leadTimeDays} giorni</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        <span>Min. {priceList.minimumOrderQuantity} pz</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(priceList.basePrice)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Valido fino: {priceList.validTo ? formatDate(priceList.validTo) : 'Illimitato'}
                    </div>
                  </div>
                </div>

                {/* Discount Tiers */}
                {priceList.discountTiers.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Sconti per Volume</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {priceList.discountTiers.map((tier, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded text-center">
                          <div className="text-sm text-blue-800 font-medium">
                            {tier.minimumQuantity}+ pz
                          </div>
                          <div className="text-xs text-blue-600">
                            -{tier.discountPercentage}%
                          </div>
                          <div className="text-sm font-bold text-blue-900">
                            {formatCurrency(tier.unitPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validity Period */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Periodo validità:</span> {formatDate(priceList.validFrom)}
                    {priceList.validTo && ` - ${formatDate(priceList.validTo)}`}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Variant-Specific Pricing */}
      {variantPrices && variantPrices.length > 0 && selectedVariantId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Prezzi Specifici Variante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variantPrices.map((variantPrice, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">Fornitore #{variantPrice.supplierId}</h5>
                      <div className="text-sm text-gray-600 mt-1">
                        Min. {variantPrice.minimumQuantity} pz • {variantPrice.leadTime} giorni
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(variantPrice.price)} {variantPrice.currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired Price Lists */}
      {expiredPriceLists.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Listini Scaduti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiredPriceLists.map((priceList) => (
                <div key={priceList.supplierId} className="flex items-center justify-between p-3 bg-white rounded border border-orange-200">
                  <div>
                    <span className="font-medium">{priceList.supplierName}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      Scaduto il {priceList.validTo ? formatDate(priceList.validTo) : 'Data sconosciuta'}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {formatCurrency(priceList.basePrice)} {priceList.currency}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}