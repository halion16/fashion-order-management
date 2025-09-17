'use client'

import { Supplier } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation, Clock } from 'lucide-react'

interface LocationSectionProps {
  supplier: Supplier
}

// Funzione per calcolare distanza approssimativa da Milano (centro business moda)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Raggio della Terra in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function LocationSection({ supplier }: LocationSectionProps) {
  const { address } = supplier
  const hasCoordinates = address.latitude && address.longitude

  // Milano coordinates (fashion business center)
  const milanLat = 45.4642
  const milanLon = 9.1900

  const distanceFromMilan = hasCoordinates
    ? calculateDistance(milanLat, milanLon, address.latitude!, address.longitude!)
    : null

  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${address.street}, ${address.city}, ${address.country}`)}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Posizione e Logistica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{address.street}</p>
              <p className="text-gray-600">{address.zipCode} {address.city}</p>
              <p className="text-gray-600">{address.country}</p>
            </div>
          </div>
        </div>

        {/* Logistics Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Lead Time</p>
              <p className="font-medium">{supplier.leadTimesDays} giorni</p>
            </div>
          </div>

          {distanceFromMilan && (
            <div className="flex items-center space-x-3">
              <Navigation className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Distanza da Milano</p>
                <p className="font-medium">{Math.round(distanceFromMilan)} km</p>
              </div>
            </div>
          )}
        </div>

        {/* Coordinates (if available) */}
        {hasCoordinates && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Coordinate GPS</p>
            <p className="font-mono text-sm">
              {address.latitude?.toFixed(4)}, {address.longitude?.toFixed(4)}
            </p>
          </div>
        )}

        {/* Map Link */}
        <div className="pt-4 border-t">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Visualizza su Google Maps
          </a>
        </div>

        {/* Delivery Zones */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Zone di Consegna</h4>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex justify-between">
              <span>Italia Settentrionale:</span>
              <span className="font-medium">{Math.max(1, Math.floor(supplier.leadTimesDays * 0.6))} giorni</span>
            </div>
            <div className="flex justify-between">
              <span>Italia Centrale:</span>
              <span className="font-medium">{Math.max(2, Math.floor(supplier.leadTimesDays * 0.8))} giorni</span>
            </div>
            <div className="flex justify-between">
              <span>Italia Meridionale:</span>
              <span className="font-medium">{supplier.leadTimesDays} giorni</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}