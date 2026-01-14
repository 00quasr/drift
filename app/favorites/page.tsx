"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ViewSwitcher, ViewMode } from '@/components/ui/view-switcher'
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
  ExternalLink,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { favoritesService } from '@/lib/services/favorites'
import ClassicLoader from '@/components/ui/loader'
import { H1, H3 } from "@/components/ui/typography"

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

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'venue' | 'event' | 'artist'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    venues: 0,
    events: 0,
    artists: 0
  })

  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setIsLoading(true)

        // Fetch favorites
        const { data: favoritesData, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
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
                    target_location: data.city && data.country ? `${data.city}, ${data.country}` : null,
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
  }, [user])

  const handleRemoveFavorite = async (favoriteId: string, targetType: string, targetId: string) => {
    if (!user) return

    setRemovingId(favoriteId)
    try {
      await favoritesService.removeFavorite(targetType as any, targetId)
      setFavorites(prev => prev.filter(f => f.id !== favoriteId))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        [targetType + 's']: Math.max(0, prev[targetType + 's' as keyof typeof prev] - 1)
      }))
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Failed to remove favorite. Please try again.')
    } finally {
      setRemovingId(null)
    }
  }

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

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
        <Card className="bg-white/5 border border-white/20 p-8 max-w-md w-full mx-6">
          <div className="text-center space-y-4">
            <Heart className="w-12 h-12 text-white/60 mx-auto" />
            <H1 variant="display">
              SIGN IN REQUIRED
            </H1>
            <p className="text-white/80 font-medium">
              Please sign in to view your favorites collection.
            </p>
            <Link href="/auth/signin" className="block">
              <button className="w-full mt-6 bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                SIGN IN
              </button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-widest uppercase mb-4">MY FAVORITES</h1>
            <p className="text-white/60 font-medium tracking-wider uppercase">Loading your collection...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white/5 border border-white/20 p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-8 bg-white/20 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-white/5 border border-white/20">
                <div className="animate-pulse">
                  <div className="h-48 bg-white/20 rounded-t"></div>
                  <div className="p-4">
                    <div className="h-4 bg-white/20 rounded mb-2"></div>
                    <div className="h-3 bg-white/10 rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <H1 variant="display" className="mb-4">MY FAVORITES</H1>
          <p className="text-white/60 font-medium tracking-wider uppercase">
            Your personal collection of favorite artists, venues, and events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        {/* Favorites Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <H3>
              {filter === 'all' ? 'ALL FAVORITES' : `${filter.toUpperCase()} FAVORITES`}
            </H3>
            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {filteredFavorites.length === 0 ? (
            <Card className="bg-white/5 border border-white/20 p-12">
              <div className="text-center space-y-4">
                <Heart className="w-16 h-16 text-white/40 mx-auto" />
                <H3>
                  NO FAVORITES YET
                </H3>
                <p className="text-white/60 font-medium max-w-md mx-auto">
                  Start building your collection by favoriting venues, events, and artists you love!
                </p>
                <Link href="/explore" className="inline-block">
                  <button className="mt-4 bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                    EXPLORE DRIFT
                  </button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFavorites.map((favorite) => {
                    const Icon = getTargetIcon(favorite.target_type)

                    return (
                      <Card key={favorite.id} className="bg-white/5 border border-white/20 overflow-hidden hover:border-white/40 transition-all duration-300 group">
                        <Link href={`/${favorite.target_type}/${favorite.target_id}`}>
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
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleRemoveFavorite(favorite.id, favorite.target_type, favorite.target_id)
                                }}
                                disabled={removingId === favorite.id}
                                className="w-8 h-8 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                                title="Remove from favorites"
                              >
                                {removingId === favorite.id ? (
                                  <div className="scale-50">
                                    <ClassicLoader />
                                  </div>
                                ) : (
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </Link>

                        <div className="p-4">
                          <Link href={`/${favorite.target_type}/${favorite.target_id}`}>
                            <H3 className="mb-2 group-hover:text-white/80 transition-colors">
                              {favorite.target_name || 'Unknown'}
                            </H3>
                            
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
                          </Link>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredFavorites.map((favorite) => {
                    const Icon = getTargetIcon(favorite.target_type)

                    return (
                      <Card key={favorite.id} className="bg-white/5 border border-white/20 hover:border-white/40 transition-all duration-300 group">
                        <div className="p-6">
                          <div className="flex items-center gap-6">
                            {/* Image/Icon */}
                            <div className="relative w-20 h-20 bg-white/10 border border-white/20 flex-shrink-0">
                              {favorite.target_image ? (
                                <Image
                                  src={favorite.target_image}
                                  alt={favorite.target_name || ''}
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
                                      {favorite.target_type}
                                    </Badge>
                                    <Link href={`/${favorite.target_type}/${favorite.target_id}`}>
                                      <H3 className="hover:text-white/80 transition-colors">
                                        {favorite.target_name || 'Unknown'}
                                      </H3>
                                    </Link>
                                  </div>
                                  
                                  <div className="flex items-center gap-6 text-white/60 text-sm">
                                    {favorite.target_location && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{favorite.target_location}</span>
                                      </div>
                                    )}
                                    {favorite.target_capacity && (
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{favorite.target_capacity.toLocaleString()} capacity</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      <span>{formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}</span>
                                    </div>
                                  </div>

                                  {favorite.target_genres && favorite.target_genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {favorite.target_genres.slice(0, 3).map((genre) => (
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
                                  <Link href={`/${favorite.target_type}/${favorite.target_id}`}>
                                    <button className="p-2 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 text-white transition-all duration-200">
                                      <ExternalLink className="w-4 h-4" />
                                    </button>
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveFavorite(favorite.id, favorite.target_type, favorite.target_id)}
                                    disabled={removingId === favorite.id}
                                    className="p-2 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 transition-all duration-200 disabled:opacity-50"
                                    title="Remove from favorites"
                                  >
                                    {removingId === favorite.id ? (
                                      <div className="scale-50">
                                        <ClassicLoader />
                                      </div>
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <Card className="bg-white/5 border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-white/20">
                        <tr className="bg-white/5">
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-white text-sm">Type</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-white text-sm">Name</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-white text-sm">Location</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-white text-sm">Details</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-white text-sm">Added</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-white text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFavorites.map((favorite) => {
                          const Icon = getTargetIcon(favorite.target_type)
                          
                          return (
                            <tr key={favorite.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-white/60" />
                                  <Badge className="font-bold tracking-wider uppercase text-xs bg-white/10 text-white border-white/20">
                                    {favorite.target_type}
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-4">
                                <Link href={`/${favorite.target_type}/${favorite.target_id}`}>
                                  <span className="font-bold tracking-wider uppercase text-white hover:text-white/80 transition-colors">
                                    {favorite.target_name || 'Unknown'}
                                  </span>
                                </Link>
                              </td>
                              <td className="p-4 text-white/60 text-sm">
                                {favorite.target_location || '-'}
                              </td>
                              <td className="p-4 text-white/60 text-sm">
                                {favorite.target_capacity && `${favorite.target_capacity.toLocaleString()} cap`}
                                {favorite.target_genres && favorite.target_genres.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {favorite.target_genres.slice(0, 2).map((genre) => (
                                      <span key={genre} className="text-xs bg-white/10 px-1 py-0.5 border border-white/20">
                                        {genre}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-white/60 text-sm">
                                {formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Link href={`/${favorite.target_type}/${favorite.target_id}`}>
                                    <button className="p-1 text-white/60 hover:text-white transition-colors">
                                      <ExternalLink className="w-4 h-4" />
                                    </button>
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveFavorite(favorite.id, favorite.target_type, favorite.target_id)}
                                    disabled={removingId === favorite.id}
                                    className="p-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                    title="Remove from favorites"
                                  >
                                    {removingId === favorite.id ? (
                                      <div className="scale-50">
                                        <ClassicLoader />
                                      </div>
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}