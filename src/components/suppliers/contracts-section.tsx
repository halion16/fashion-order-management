'use client'

import { SupplierContract } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'

interface ContractsSectionProps {
  contracts: SupplierContract[]
}

const getContractTypeLabel = (type: string) => {
  const labels = {
    'standard': 'Standard',
    'preferenziale': 'Preferenziale',
    'esclusivo': 'Esclusivo',
    'temporaneo': 'Temporaneo',
    'volume': 'Volume'
  }
  return labels[type as keyof typeof labels] || type
}

const getContractTypeColor = (type: string) => {
  const colors = {
    'standard': 'bg-gray-100 text-gray-800',
    'preferenziale': 'bg-blue-100 text-blue-800',
    'esclusivo': 'bg-purple-100 text-purple-800',
    'temporaneo': 'bg-yellow-100 text-yellow-800',
    'volume': 'bg-green-100 text-green-800'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function ContractsSection({ contracts }: ContractsSectionProps) {
  const activeContracts = contracts.filter(c => c.isActive)
  const expiredContracts = contracts.filter(c => !c.isActive)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Contratti e Condizioni Commerciali
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Contracts */}
        {activeContracts.length > 0 && (
          <div>
            <h4 className="font-medium text-green-700 mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Contratti Attivi
            </h4>
            <div className="space-y-4">
              {activeContracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4 bg-green-50/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={getContractTypeColor(contract.type)}>
                        {getContractTypeLabel(contract.type)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </span>
                    </div>
                    {contract.renewalDate && (
                      <div className="flex items-center text-sm text-amber-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Rinnovo: {formatDate(contract.renewalDate)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Condizioni Generali</p>
                      <p className="font-medium text-sm">{contract.termsAndConditions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Termini di Consegna</p>
                      <p className="font-medium text-sm">{contract.deliveryTerms}</p>
                    </div>
                  </div>

                  {contract.minimumOrderValue && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Ordine Minimo</p>
                      <p className="font-medium">{formatCurrency(contract.minimumOrderValue)}</p>
                    </div>
                  )}

                  {contract.discountTiers.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Sconti per Volume</p>
                      <div className="flex flex-wrap gap-2">
                        {contract.discountTiers.map((tier, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {tier.minimumQuantity}+ pz: -{tier.discountPercentage}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {contract.qualityStandards && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Standard di Qualità</p>
                      <p className="font-medium text-sm">{contract.qualityStandards}</p>
                    </div>
                  )}

                  {contract.penaltyTerms && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Penali</p>
                      <p className="font-medium text-sm text-yellow-800">{contract.penaltyTerms}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expired Contracts */}
        {expiredContracts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-600 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Contratti Scaduti
            </h4>
            <div className="space-y-3">
              {expiredContracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-3 bg-gray-50 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {getContractTypeLabel(contract.type)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </span>
                    </div>
                    <span className="text-xs text-red-600 font-medium">Scaduto</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {contracts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Nessun contratto presente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}