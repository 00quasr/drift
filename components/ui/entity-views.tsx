'use client'

import React from 'react'
import { EntityCard } from './entity-card'
import { Card } from './card'
import { Badge } from './badge'
import { formatDistanceToNow } from 'date-fns'
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Music, 
  Clock,
  Users,
  Star,
  ExternalLink,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ViewMode } from './view-switcher'

export interface BaseEntity {
  id: string
  name?: string
  title?: string
  imageUrl?: string
  image_url?: string
  images?: string[]
  city?: string
  country?: string
  genres?: string[]
  created_at?: string
  updated_at?: string
  [key: string]: any
}

interface EntityViewsProps {
  entities: BaseEntity[]
  viewMode: ViewMode
  entityType: 'artist' | 'venue' | 'event'
  onEntityAction?: (action: string, entity: BaseEntity) => void
  showActions?: boolean
  emptyMessage?: string
}

export function EntityViews({
  entities,
  viewMode,
  entityType,
  onEntityAction,
  showActions = false,
  emptyMessage = 'No items found'
}: EntityViewsProps) {
  const getEntityName = (entity: BaseEntity) => {
    return entity.name || entity.title || 'Unknown'
  }

  const getEntityImage = (entity: BaseEntity) => {
    if (entity.imageUrl) return entity.imageUrl
    if (entity.image_url) return entity.image_url
    if (entity.images && Array.isArray(entity.images) && entity.images.length > 0) {
      return entity.images[0]
    }
    return null
  }

  const getEntityLocation = (entity: BaseEntity) => {
    if (entity.city && entity.country) {
      return `${entity.city}, ${entity.country}`
    }
    return entity.city || entity.country || null
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'venue': return MapPin
      case 'event': return Calendar
      case 'artist': return Music
      default: return Heart
    }
  }

  const getEntityHref = (entity: BaseEntity) => {
    return `/${entityType}/${entity.id}`
  }

  if (entities.length === 0) {
    return (
      <Card className="bg-white/5 border border-white/20 p-12">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 text-white/40 mx-auto" />
          <h3 className="text-xl font-bold tracking-wider uppercase text-white">
            {emptyMessage}
          </h3>
        </div>
      </Card>
    )
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {entities.map((entity) => {
          const entityName = getEntityName(entity)
          const imageUrl = getEntityImage(entity)
          const location = getEntityLocation(entity)

          if (entityType === 'artist') {
            return (
              <EntityCard
                key={entity.id}
                type="artist"
                id={entity.id}
                title={entityName}
                imageUrl={imageUrl || ''}
                category={entity.genres?.[0] || 'Electronic'}
                href={getEntityHref(entity)}
                bio={entity.bio}
                city={entity.city}
                country={entity.country}
                genres={entity.genres || []}
                rating={entity.average_rating}
                reviewCount={entity.review_count}
              />
            )
          } else if (entityType === 'venue') {
            return (
              <EntityCard
                key={entity.id}
                type="venue"
                id={entity.id}
                title={entityName}
                imageUrl={imageUrl || ''}
                category={entity.city || 'Unknown Location'}
                href={getEntityHref(entity)}
                city={entity.city || 'Unknown'}
                country={entity.country || 'Unknown'}
                capacity={entity.capacity}
                genres={entity.genres || []}
              />
            )
          } else if (entityType === 'event') {
            return (
              <EntityCard
                key={entity.id}
                type="event"
                id={entity.id}
                title={entityName}
                imageUrl={imageUrl || ''}
                category="EVENT"
                href={getEntityHref(entity)}
                artist={entity.artists?.[0]?.name || entity.artist || 'Various Artists'}
                date={entity.start_date ? new Date(entity.start_date).toLocaleDateString() : 'TBA'}
                time={entity.start_date ? new Date(entity.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                venue={entity.venue?.name || entity.venue || 'TBA'}
                location={location || 'Location TBA'}
                price={entity.ticket_price_min && entity.ticket_price_max ? `€${entity.ticket_price_min}-€${entity.ticket_price_max}` : undefined}
                isUpcoming={entity.start_date ? new Date(entity.start_date) > new Date() : true}
              />
            )
          }
        })}
      </div>
    )
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {entities.map((entity) => {
          const Icon = getEntityIcon(entityType)
          const entityName = getEntityName(entity)
          const imageUrl = getEntityImage(entity)
          const location = getEntityLocation(entity)

          return (
            <Card key={entity.id} className="bg-white/5 border border-white/20 hover:border-white/40 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* Image/Icon */}
                  <div className="relative w-20 h-20 bg-white/10 border border-white/20 flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={entityName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white/60" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="font-bold tracking-wider uppercase text-xs bg-white/10 text-white border-white/20">
                            {entityType}
                          </Badge>
                          <Link href={getEntityHref(entity)}>
                            <h4 className="text-xl font-bold tracking-wider uppercase text-white hover:text-white/80 transition-colors">
                              {entityName}
                            </h4>
                          </Link>
                        </div>
                        
                        <div className="flex items-center gap-6 text-white/60 text-sm">
                          {location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{location}</span>
                            </div>
                          )}
                          {entity.capacity && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{entity.capacity.toLocaleString()} capacity</span>
                            </div>
                          )}
                          {entity.created_at && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatDistanceToNow(new Date(entity.created_at), { addSuffix: true })}</span>
                            </div>
                          )}
                        </div>

                        {entity.genres && entity.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {entity.genres.slice(0, 3).map((genre) => (
                              <div key={genre} className="bg-white/10 border border-white/20 px-2 py-1">
                                <span className="text-white/80 text-xs font-bold tracking-wider uppercase">
                                  {genre}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 ml-4">
                        <Link href={getEntityHref(entity)}>
                          <button className="p-2 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 text-white transition-all duration-200">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                        {showActions && onEntityAction && (
                          <button
                            onClick={() => onEntityAction('remove', entity)}
                            className="p-2 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 transition-all duration-200"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return null
}