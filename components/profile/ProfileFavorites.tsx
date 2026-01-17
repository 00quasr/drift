"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Music, 
  Clock,
  Users,
  Star,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Favorite {
  id: string
  target_type: string
  target_id: string
  created_at: string
  target_name?: string
  target_slug?: string
  target_location?: string
  target_image?: string
  target_description?: string
  target_genres?: string[]
  target_capacity?: number
  target_date?: string
}

interface ProfileFavoritesProps {
  profileId: string
  isOwnProfile: boolean
}

export const ProfileFavorites: React.FC<ProfileFavoritesProps> = ({
  profileId,
  isOwnProfile
}) => {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'venue' | 'event' | 'artist'>('all')
  const [stats, setStats] = useState({
    total: 0,
    venues: 0,
    events: 0,
    artists: 0
  })

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true)

        // Fetch favorites
        const { data: favoritesData, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Enrich favorites with target details
        const enrichedFavorites = await Promise.all(
          favoritesData.map(async (favorite) => {
            let targetData: any = {}

            try {
              if (favorite.target_type === 'venue') {
                const { data } = await supabase
                  .from('venues')
                  .select('name, slug, city, country, description, images, capacity, genres')
                  .eq('id', favorite.target_id)
                  .single()
                
                if (data) {
                  targetData = {
                    target_name: data.name,
                    target_slug: data.slug,
                    target_location: `${data.city}, ${data.country}`,
                    target_description: data.description,
                    target_image: data.images?.[0] || null,
                    target_capacity: data.capacity,
                    target_genres: data.genres
                  }
                }
              } else if (favorite.target_type === 'event') {
                const { data } = await supabase
                  .from('events')
                  .select('title, slug, description, start_date, images, genres, venues(city, country)')
                  .eq('id', favorite.target_id)
                  .single()
                
                if (data) {
                  targetData = {
                    target_name: data.title,
                    target_slug: data.slug,
                    target_description: data.description,
                    target_date: data.start_date,
                    target_image: data.images?.[0] || null,
                    target_genres: data.genres,
                    target_location: data.venues ? `${data.venues.city}, ${data.venues.country}` : undefined
                  }
                }
              } else if (favorite.target_type === 'artist') {
                const { data } = await supabase
                  .from('artists')
                  .select('name, slug, bio, city, country, images, genres')
                  .eq('id', favorite.target_id)
                  .single()
                
                if (data) {
                  targetData = {
                    target_name: data.name,
                    target_slug: data.slug,
                    target_location: `${data.city}, ${data.country}`,
                    target_description: data.bio,
                    target_image: data.images?.[0] || null,
                    target_genres: data.genres
                  }
                }
              }
            } catch (e) {
              console.error('Error fetching target details:', e)
            }

            return {
              ...favorite,
              ...targetData
            }
          })
        )

        setFavorites(enrichedFavorites)

        // Calculate stats
        const total = favoritesData.length
        const venues = favoritesData.filter(f => f.target_type === 'venue').length
        const events = favoritesData.filter(f => f.target_type === 'event').length
        const artists = favoritesData.filter(f => f.target_type === 'artist').length

        setStats({ total, venues, events, artists })

      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [profileId])

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'venue': return MapPin
      case 'event': return Calendar
      case 'artist': return Music
      default: return Heart
    }
  }


  const filteredFavorites = favorites.filter(favorite => 
    filter === 'all' || favorite.target_type === filter
  )

  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Favorites Stats */}
      <div>
        <h2 className="text-2xl font-bold tracking-wider uppercase mb-6 text-white">
          FAVORITES COLLECTION
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className={`bg-white/5 border cursor-pointer transition-all duration-300 ${
              filter === 'all' ? 'border-white' : 'border-white/20 hover:border-white/40'
            }`}
            onClick={() => setFilter('all')}
          >
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                ALL FAVORITES
              </div>
            </div>
          </Card>
          
          <Card 
            className={`bg-white/5 border cursor-pointer transition-all duration-300 ${
              filter === 'venue' ? 'border-white' : 'border-white/20 hover:border-white/40'
            }`}
            onClick={() => setFilter('venue')}
          >
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.venues}</div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                VENUES
              </div>
            </div>
          </Card>
          
          <Card 
            className={`bg-white/5 border cursor-pointer transition-all duration-300 ${
              filter === 'event' ? 'border-white' : 'border-white/20 hover:border-white/40'
            }`}
            onClick={() => setFilter('event')}
          >
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.events}</div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                EVENTS
              </div>
            </div>
          </Card>
          
          <Card 
            className={`bg-white/5 border cursor-pointer transition-all duration-300 ${
              filter === 'artist' ? 'border-white' : 'border-white/20 hover:border-white/40'
            }`}
            onClick={() => setFilter('artist')}
          >
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.artists}</div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                ARTISTS
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Favorites Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-wider uppercase text-white">
            {filter === 'all' ? 'ALL FAVORITES' : `${filter.toUpperCase()} FAVORITES`}
          </h3>
          <div className="flex items-center gap-2 text-white/60">
            <Heart className="w-4 h-4" />
            <span className="font-medium tracking-wider uppercase text-sm">
              {filteredFavorites.length} ITEMS
            </span>
          </div>
        </div>

        {filteredFavorites.length === 0 ? (
          <Card className="bg-white/5 border border-white/20 p-12">
            <div className="text-center space-y-4">
              <Heart className="w-16 h-16 text-white/40 mx-auto" />
              <h3 className="text-xl font-bold tracking-wider uppercase text-white">
                NO FAVORITES YET
              </h3>
              <p className="text-white/60 font-medium max-w-md mx-auto">
                {isOwnProfile 
                  ? "Start building your collection by favoriting venues, events, and artists you love!"
                  : "This user hasn't favorited anything yet."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => {
              const Icon = getTargetIcon(favorite.target_type)

              return (
                <Card key={favorite.id} className="bg-white/5 border border-white/20 overflow-hidden hover:border-white/40 transition-all duration-300 group">
                  <Link href={`/${favorite.target_type}s/${favorite.target_slug}`}>
                    <div className="relative h-48 bg-white/10">
                      {favorite.target_image ? (
                        <Image
                          src={favorite.target_image}
                          alt={favorite.target_name || ''}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-16 h-16 text-white/60" />
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <Badge className="font-bold tracking-wider uppercase text-xs bg-white/10 text-white border-white/20">
                          {favorite.target_type}
                        </Badge>
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="text-lg font-bold tracking-wider uppercase text-white mb-2 group-hover:text-white/80 transition-colors">
                        {favorite.target_name || 'Unknown'}
                      </h4>
                      
                      {favorite.target_location && (
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-white/40" />
                          <span className="text-white/60 text-sm font-medium">
                            {favorite.target_location}
                          </span>
                        </div>
                      )}
                      
                      {favorite.target_capacity && (
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-white/40" />
                          <span className="text-white/60 text-sm font-medium">
                            {favorite.target_capacity.toLocaleString()} capacity
                          </span>
                        </div>
                      )}
                      
                      {favorite.target_genres && favorite.target_genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {favorite.target_genres.slice(0, 2).map((genre) => (
                            <div key={genre} className="bg-white/10 border border-white/20 px-2 py-1">
                              <span className="text-white/80 text-xs font-bold tracking-wider uppercase">
                                {genre}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-white/40">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}