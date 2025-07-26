'use client'

import React from 'react'
import { EntityCard } from './entity-card'
import { Card } from './card'
import { Badge } from './badge'
import { formatDistanceToNow } from 'date-fns'
import { getFallbackImage } from '@/lib/utils/imageUtils'
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

  const getUploadedImage = (entity: BaseEntity) => {
    // Only return actual uploaded images, not fallbacks
    if (entity.imageUrl) return entity.imageUrl
    if (entity.image_url) return entity.image_url
    // Check images array first (contains actual uploaded images)
    if (entity.images && Array.isArray(entity.images) && entity.images.length > 0) {
      return entity.images[0]
    }
    // Fallback to flyer_url for events (may contain older/seed data)
    if (entity.flyer_url) return entity.flyer_url
    return null
  }

  const getGridImage = (entity: BaseEntity) => {
    // For grid view: ALWAYS return undefined so EntityCard uses random background assets
    return undefined
  }

  const getListImage = (entity: BaseEntity) => {
    // For list view: only uploaded images, no background assets
    return getUploadedImage(entity)
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

  // Grid View - Mobile uses single column, desktop uses grid
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {entities.map((entity) => {
          const entityName = getEntityName(entity)
          const imageUrl = getGridImage(entity)
          const location = getEntityLocation(entity)

          if (entityType === 'artist') {
            return (
              <EntityCard
                key={entity.id}
                type="artist"
                id={entity.id}
                title={entityName}
                imageUrl={imageUrl}
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
                imageUrl={imageUrl}
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
                imageUrl={imageUrl}
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
          const imageUrl = getListImage(entity)
          const location = getEntityLocation(entity)

          return (
            <div key={entity.id} className="group relative overflow-hidden bg-black border-2 border-white/20 hover:border-white/60 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
              <Link href={getEntityHref(entity)}>
                <div className="p-4 md:p-6">
                  {/* Mobile Layout - Vertical */}
                  <div className="block md:hidden">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Image/Icon */}
                      <div className="relative w-12 h-12 bg-white/10 border border-white/20 flex-shrink-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={entityName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white/60" />
                          </div>
                        )}
                      </div>
                      
                      {/* Type badge and title */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-black/80 backdrop-blur-sm border border-white/60 px-2 py-1 inline-block mb-1">
                          <span className="text-white text-xs font-bold tracking-widest uppercase font-mono">
                            {entityType}
                          </span>
                        </div>
                        <h4 className="text-base font-bold tracking-wider uppercase text-white group-hover:text-white/80 transition-colors leading-tight">
                          {entityName}
                        </h4>
                      </div>
                      
                      {/* Action button for mobile */}
                      <div className="flex-shrink-0">
                        {entityType === 'event' && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span className="text-white text-xs font-bold tracking-wider uppercase">
                              ENTER
                            </span>
                          </div>
                        )}
                        {showActions && onEntityAction && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onEntityAction('remove', entity)
                            }}
                            className="p-2 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 transition-all duration-200"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Mobile info row */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-3 text-white/60 text-xs">
                        {location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="font-bold tracking-widest uppercase">{location}</span>
                          </div>
                        )}
                        {entity.capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-white" />
                            <span className="text-white font-bold tracking-wider">
                              {entity.capacity.toLocaleString()} CAP
                            </span>
                          </div>
                        )}
                        {entity.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-bold tracking-widest uppercase">
                              {new Date(entity.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {entity.genres && entity.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entity.genres.slice(0, 2).map((genre) => (
                            <div key={genre} className="bg-white/10 border border-white/30 px-2 py-0.5">
                              <span className="text-white text-xs font-bold tracking-widest uppercase">
                                {genre}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout - Horizontal */}
                  <div className="hidden md:flex items-center gap-6">
                    {/* Image/Icon */}
                    <div className="relative w-20 h-20 bg-white/10 border border-white/20 flex-shrink-0">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={entityName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                            <div className="bg-black/80 backdrop-blur-sm border border-white/60 px-3 py-1">
                              <span className="text-white text-xs font-bold tracking-widest uppercase font-mono">
                                {entityType}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold tracking-wider uppercase text-white group-hover:text-white/80 transition-colors">
                              {entityName}
                            </h4>
                          </div>
                          
                          <div className="flex items-center gap-6 text-white/60 text-sm">
                            {location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-bold tracking-widest uppercase">{location}</span>
                              </div>
                            )}
                            {entity.capacity && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-white" />
                                <span className="text-white font-bold text-sm tracking-wider">
                                  {entity.capacity.toLocaleString()} CAP
                                </span>
                              </div>
                            )}
                            {entity.start_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-bold tracking-widest uppercase text-xs">
                                  {new Date(entity.start_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {entity.genres && entity.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {entity.genres.slice(0, 3).map((genre) => (
                                <div key={genre} className="bg-white/10 border border-white/30 px-2 py-1">
                                  <span className="text-white text-xs font-bold tracking-widest uppercase">
                                    {genre}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 ml-4">
                          {entityType === 'event' && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              <span className="text-white text-sm font-bold tracking-wider uppercase">
                                ENTER
                              </span>
                            </div>
                          )}
                          {showActions && onEntityAction && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onEntityAction('remove', entity)
                              }}
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
              </Link>

              {/* Angular Corner Design */}
              <div className="absolute top-4 right-4 w-8 h-8 z-20">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>

              {/* Glitch Effect Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none z-30">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12" />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}