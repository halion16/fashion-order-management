'use client'

import { useState } from 'react'
import { ProductImage } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ZoomIn, RotateCw, Download } from 'lucide-react'

interface ImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96 bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
              <ZoomIn className="w-8 h-8" />
            </div>
            <p>Nessuna immagine disponibile</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  const selectedImage = sortedImages[selectedImageIndex]

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % sortedImages.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
  }

  const getImageTypeLabel = (type: string) => {
    const labels = {
      'principale': 'Principale',
      'dettaglio': 'Dettaglio',
      'indossato': 'Indossato',
      'tecnica': 'Tecnica',
      'packaging': 'Packaging'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getImageTypeColor = (type: string) => {
    const colors = {
      'principale': 'bg-blue-100 text-blue-800',
      'dettaglio': 'bg-green-100 text-green-800',
      'indossato': 'bg-purple-100 text-purple-800',
      'tecnica': 'bg-orange-100 text-orange-800',
      'packaging': 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card>
        <CardContent className="p-0">
          <div className="relative group">
            <div className={`relative overflow-hidden bg-gray-100 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || `${productName} - ${getImageTypeLabel(selectedImage.imageType)}`}
                className={`w-full h-96 object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Image Type Badge */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImageTypeColor(selectedImage.imageType)}`}>
                  {getImageTypeLabel(selectedImage.imageType)}
                  {selectedImage.isPrimary && ' • Primaria'}
                </span>
              </div>

              {/* Controls Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsZoomed(!isZoomed)
                      }}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Implementa rotazione se necessario
                      }}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Implementa download
                        window.open(selectedImage.url, '_blank')
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {sortedImages.length > 1 && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Image Counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {sortedImages.length}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Grid */}
      {sortedImages.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-6 gap-2">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${productName} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.isPrimary && (
                    <div className="absolute top-1 left-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent">
                    <div className="text-white text-xs p-1 truncate">
                      {getImageTypeLabel(image.imageType)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}