"use client"

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { favoritesService } from '@/lib/services/favorites'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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

type FilterType = 'all' | 'venue' | 'event' | 'artist'
type SortType = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'venue', label: 'Venues' },
  { value: 'event', label: 'Events' },
  { value: 'artist', label: 'Artists' },
]

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'newest', label: 'Recently added' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
]

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const { data: favoritesData, error: fetchError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Enrich favorites with target details
      const enrichedFavorites = await Promise.all(
        favoritesData.map(async (favorite) => {
          let targetData: Partial<Favorite> = {}

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
                const venue = data.venues as unknown as { city: string; country: string } | null
                targetData = {
                  target_name: data.title,
                  target_slug: data.slug,
                  target_description: data.description,
                  target_date: data.start_date,
                  target_image: data.images?.[0] || null,
                  target_genres: data.genres,
                  target_location: venue ? `${venue.city}, ${venue.country}` : undefined
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
                  target_location: data.city && data.country ? `${data.city}, ${data.country}` : undefined,
                  target_description: data.bio,
                  target_image: data.images?.[0] || null,
                  target_genres: data.genres
                }
              }
            }
          } catch (e) {
            console.error('Error fetching target details:', e)
          }

          return { ...favorite, ...targetData }
        })
      )

      setFavorites(enrichedFavorites)
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setError('Failed to load favorites. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const handleRemoveFavorite = async (favoriteId: string, targetType: string, targetId: string) => {
    if (!user) return

    setRemovingId(favoriteId)

    // Optimistic update
    const previousFavorites = [...favorites]
    setFavorites(prev => prev.filter(f => f.id !== favoriteId))

    try {
      await favoritesService.removeFavorite(targetType as 'artist' | 'venue' | 'event', targetId)
    } catch (err) {
      console.error('Error removing favorite:', err)
      // Revert on error
      setFavorites(previousFavorites)
    } finally {
      setRemovingId(null)
    }
  }

  const filteredAndSortedFavorites = favorites
    .filter(favorite => filter === 'all' || favorite.target_type === filter)
    .sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name-asc':
          return (a.target_name || '').localeCompare(b.target_name || '')
        case 'name-desc':
          return (b.target_name || '').localeCompare(a.target_name || '')
        default:
          return 0
      }
    })

  const stats = {
    all: favorites.length,
    venue: favorites.filter(f => f.target_type === 'venue').length,
    event: favorites.filter(f => f.target_type === 'event').length,
    artist: favorites.filter(f => f.target_type === 'artist').length,
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
        <div className="max-w-lg mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-neutral-800 bg-neutral-900/50 p-8 text-center"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-3">
              Sign in required
            </h1>
            <p className="text-neutral-400 mb-6">
              Please sign in to view your favorites.
            </p>
            <Link href="/auth/signin">
              <button className="bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors">
                Sign in
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <div className="h-8 w-48 bg-neutral-800 animate-pulse mb-2" />
            <div className="h-4 w-64 bg-neutral-800/50 animate-pulse" />
          </div>
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-9 w-20 bg-neutral-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/3] bg-neutral-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
        <div className="max-w-lg mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-red-900/50 bg-red-950/20 p-8 text-center"
          >
            <h1 className="text-xl font-semibold tracking-tight text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-neutral-400 mb-6">{error}</p>
            <button
              onClick={fetchFavorites}
              className="bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
            Favorites
          </h1>
          <p className="text-neutral-500">
            {favorites.length === 0
              ? 'Your saved items will appear here'
              : `${favorites.length} saved ${favorites.length === 1 ? 'item' : 'items'}`
            }
          </p>
        </motion.div>

        {/* Filter and Sort controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all",
                  filter === option.value
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                {option.label}
                <span className="ml-2 text-xs opacity-60">
                  {stats[option.value]}
                </span>
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-sm">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="bg-neutral-900 border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-700 cursor-pointer"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Empty state */}
        {filteredAndSortedFavorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-neutral-800 bg-neutral-900/30 p-12 text-center"
          >
            <h2 className="text-xl font-semibold tracking-tight text-white mb-3">
              {filter === 'all' ? 'No favorites yet' : `No ${filter}s saved`}
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              {filter === 'all'
                ? 'Start exploring and save items you love to find them here later.'
                : `You haven't saved any ${filter}s yet. Explore to find some.`
              }
            </p>
            <Link href="/explore">
              <button className="bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors">
                Explore
              </button>
            </Link>
          </motion.div>
        )}

        {/* Favorites grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedFavorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <FavoriteCard
                  favorite={favorite}
                  isRemoving={removingId === favorite.id}
                  onRemove={() => handleRemoveFavorite(
                    favorite.id,
                    favorite.target_type,
                    favorite.target_id
                  )}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

interface FavoriteCardProps {
  favorite: Favorite
  isRemoving: boolean
  onRemove: () => void
}

function FavoriteCard({ favorite, isRemoving, onRemove }: FavoriteCardProps) {
  const href = `/${favorite.target_type}/${favorite.target_id}`

  return (
    <div className={cn(
      "group relative bg-neutral-900 border border-neutral-800 overflow-hidden transition-all duration-200",
      "hover:border-neutral-700",
      isRemoving && "opacity-50 pointer-events-none"
    )}>
      <Link href={href}>
        {/* Image */}
        <div className="relative aspect-[4/3] bg-neutral-800">
          {favorite.target_image ? (
            <Image
              src={favorite.target_image}
              alt={favorite.target_name || ''}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-neutral-600 text-sm uppercase tracking-wider">
                {favorite.target_type}
              </span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 uppercase tracking-wider">
              {favorite.target_type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-medium mb-1 truncate group-hover:text-neutral-200 transition-colors">
            {favorite.target_name || 'Untitled'}
          </h3>

          {favorite.target_location && (
            <p className="text-neutral-500 text-sm mb-2 truncate">
              {favorite.target_location}
            </p>
          )}

          {favorite.target_genres && favorite.target_genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {favorite.target_genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-neutral-400 text-xs bg-neutral-800 px-2 py-0.5"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <p className="text-neutral-600 text-xs">
            Saved {formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}
          </p>
        </div>
      </Link>

      {/* Remove button - visible on hover */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        disabled={isRemoving}
        className={cn(
          "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-black/70 backdrop-blur-sm text-neutral-400 hover:text-white text-xs font-medium px-2.5 py-1",
          "disabled:opacity-50"
        )}
      >
        Remove
      </button>
    </div>
  )
}
