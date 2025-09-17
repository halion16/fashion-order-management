'use client'

import { TechnicalSheet, ProductMeasurements } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FileText, Ruler, Award, Download, Calendar } from 'lucide-react'

interface TechnicalSheetProps {
  technicalSheet?: TechnicalSheet
  measurements: ProductMeasurements
  productName: string
}

export function TechnicalSheetSection({ technicalSheet, measurements, productName }: TechnicalSheetProps) {
  if (!technicalSheet && (!measurements.sizeChart || measurements.sizeChart.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Scheda Tecnica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Nessuna scheda tecnica disponibile</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getFitLabel = (fit: string) => {
    const labels = {
      'slim': 'Slim Fit',
      'regular': 'Regular Fit',
      'loose': 'Loose Fit',
      'oversize': 'Oversize',
      'custom': 'Custom Fit'
    }
    return labels[fit as keyof typeof labels] || fit
  }

  return (
    <div className="space-y-6">
      {/* Technical Specifications */}
      {technicalSheet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Scheda Tecnica v{technicalSheet.version}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Aggiornata: {formatDate(technicalSheet.lastUpdated)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Specifications by Category */}
            {technicalSheet.specifications.map((specCategory, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{specCategory.category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(specCategory.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quality Standards */}
            {technicalSheet.qualityStandards.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Standard di Qualità
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technicalSheet.qualityStandards.map((standard, index) => (
                    <Badge key={index} variant="secondary">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {technicalSheet.certifications.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Certificazioni
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technicalSheet.certifications.map((cert, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {technicalSheet.attachments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Allegati
                </h4>
                <div className="space-y-2">
                  {technicalSheet.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {technicalSheet.notes && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Note</h4>
                <p className="text-sm text-yellow-700">{technicalSheet.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Size Chart & Measurements */}
      {measurements.sizeChart && measurements.sizeChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ruler className="h-5 w-5 mr-2" />
              Taglie e Misure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fit Type */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Vestibilità:</span>
              <Badge variant="outline">{getFitLabel(measurements.fit)}</Badge>
            </div>

            {/* Size Chart Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Taglia</th>
                    {measurements.sizeChart[0] && Object.keys(measurements.sizeChart[0].measurements).map((measurement) => (
                      <th key={measurement} className="border border-gray-300 px-4 py-2 text-center">
                        {measurement}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {measurements.sizeChart.map((sizeEntry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {sizeEntry.size}
                      </td>
                      {Object.values(sizeEntry.measurements).map((value, valueIndex) => (
                        <td key={valueIndex} className="border border-gray-300 px-4 py-2 text-center">
                          {value} cm
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grading Rules */}
            {measurements.grading && measurements.grading.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Regole di Grading</h4>
                <div className="space-y-2">
                  {measurements.grading.map((rule, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {rule.fromSize} → {rule.toSize}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(rule.adjustments).map(([measurement, adjustment]) => (
                          <div key={measurement} className="flex justify-between">
                            <span className="text-gray-600">{measurement}:</span>
                            <span className={adjustment > 0 ? 'text-green-600' : adjustment < 0 ? 'text-red-600' : 'text-gray-600'}>
                              {adjustment > 0 ? '+' : ''}{adjustment} cm
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Measurement Notes */}
            {measurements.notes && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Note sulle Misure</h4>
                <p className="text-sm text-blue-700">{measurements.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}