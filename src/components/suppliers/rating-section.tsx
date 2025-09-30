'use client'

import { QualityRating } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Star, TrendingUp, MessageSquare, User } from 'lucide-react'

interface RatingSectionProps {
  ratingHistory: QualityRating[]
  overallRating: number
}

const ScoreBar = ({ score, label, color = "blue" }: { score: number; label: string; color?: string }) => {
  const percentage = (score / 5) * 100
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{score.toFixed(1)}/5</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'text-yellow-500 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

export function RatingSection({ ratingHistory, overallRating }: RatingSectionProps) {
  if (ratingHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Valutazioni Qualità
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Nessuna valutazione presente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calcola le medie per categoria
  const averageScores = ratingHistory.reduce(
    (acc, rating) => ({
      quality: acc.quality + rating.qualityScore,
      delivery: acc.delivery + rating.deliveryScore,
      communication: acc.communication + rating.communicationScore,
      price: acc.price + rating.priceScore,
    }),
    { quality: 0, delivery: 0, communication: 0, price: 0 }
  )

  const count = ratingHistory.length
  const avgQuality = averageScores.quality / count
  const avgDelivery = averageScores.delivery / count
  const avgCommunication = averageScores.communication / count
  const avgPrice = averageScores.price / count

  // Ultime valutazioni (prime 3)
  const recentRatings = ratingHistory
    .sort((a, b) => new Date(b.ratingDate).getTime() - new Date(a.ratingDate).getTime())
    .slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Valutazioni Qualità
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 mb-2">{overallRating.toFixed(1)}</div>
          <StarRating rating={overallRating} />
          <p className="text-sm text-gray-600 mt-2">
            Basato su {count} valutazioni
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Breakdown delle Valutazioni
          </h4>

          <div className="space-y-3">
            <ScoreBar score={avgQuality} label="Qualità Prodotto" color="green" />
            <ScoreBar score={avgDelivery} label="Puntualità Consegne" color="blue" />
            <ScoreBar score={avgCommunication} label="Comunicazione" color="purple" />
            <ScoreBar score={avgPrice} label="Rapporto Qualità/Prezzo" color="yellow" />
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Ultime Valutazioni
          </h4>

          <div className="space-y-4">
            {recentRatings.map((rating) => (
              <div key={rating.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StarRating rating={rating.overallRating} />
                    <span className="text-sm text-gray-500">
                      Ordine: {rating.orderId}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(new Date(rating.ratingDate))}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <User className="h-3 w-3 mr-1" />
                      {rating.ratedBy}
                    </div>
                  </div>
                </div>

                {/* Mini scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-700">{rating.qualityScore}</div>
                    <div className="text-green-600">Qualità</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-700">{rating.deliveryScore}</div>
                    <div className="text-blue-600">Consegna</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-medium text-purple-700">{rating.communicationScore}</div>
                    <div className="text-purple-600">Comunicazione</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-medium text-yellow-700">{rating.priceScore}</div>
                    <div className="text-yellow-600">Prezzo</div>
                  </div>
                </div>

                {rating.comments && (
                  <div className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded">
                    "{rating.comments}"
                  </div>
                )}
              </div>
            ))}
          </div>

          {ratingHistory.length > 3 && (
            <div className="text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Vedi tutte le valutazioni ({ratingHistory.length})
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}