"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, ExternalLink, Star, Heart, Share2, Phone, Mail, Clock, Globe } from "lucide-react"
import Link from "next/link"
import { getVenueById } from "@/lib/services/venues"
import { getEvents } from "@/lib/services/events"
import { getReviews, getReviewStats } from "@/lib/services/reviews"
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import { notFound } from "next/navigation"
import Image from "next/image"
import ImageGallery from '@/components/ui/ImageGallery'
import MapboxMap from '@/components/ui/MapboxMap'
import { VenueReviews } from '@/components/reviews/VenueReviews'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ReviewModal } from '@/components/reviews/ReviewModal'
import { favoritesService } from '@/lib/services/favorites'
import { H1, H2, H3 } from "@/components/ui/typography"

interface VenuePageProps {
  params: { id: string }
}

export default function VenuePage({ params }: VenuePageProps) {
  const [venue, setVenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesLoading, setLikesLoading] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const { user } = useAuth()

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const venueData = await getVenueById(params.id)
        setVenue(venueData)
      } catch (error) {
        console.error('Error fetching venue:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchVenue()
  }, [params.id])

  // Check if venue is favorited when component mounts and user changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && venue) {
        try {
          const isFavorited = await favoritesService.isFavorited('venue', venue.id)
          setIsLiked(isFavorited)
        } catch (error) {
          console.error('Error checking favorite status:', error)
        }
      }
    }
    checkFavoriteStatus()
  }, [user, venue])

  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch (err) {
      setShareStatus('error')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like venues')
      return
    }
    
    if (likesLoading) return
    
    setLikesLoading(true)
    try {
      const newLikedState = await favoritesService.toggleFavorite('venue', venue.id)
      setIsLiked(newLikedState)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to update favorite. Please try again.')
    } finally {
      setLikesLoading(false)
    }
  }

  const handleRate = () => {
    if (!user) {
      alert('Please sign in to rate venues')
      return
    }
    setIsReviewModalOpen(true)
  }

  if (loading) {
    return null
  }

  if (!venue) {
    notFound()
  }

  // Get upcoming events at this venue
  const upcomingEvents = venue.events?.filter((event: any) => 
    new Date(event.start_date) > new Date()
  ).slice(0, 6) || []

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Main Venue Tile */}
        <div className="relative overflow-hidden bg-black border-2 border-white/20 mb-8">
          {/* Angular Corner Design */}
          <div className="absolute top-4 right-4 w-8 h-8 z-10">
            <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
          </div>
          
          {/* Content */}
          <div className="relative z-0 p-8 pt-12">
            {/* Category Tag and Genre Tags Container */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {/* Category Tag */}
              <div className="bg-black border border-white/60 px-3 py-1">
                <span className="text-white text-xs font-bold tracking-widest uppercase font-mono">
                  VENUE
                </span>
              </div>
              
              {/* Genre Tags */}
              {venue.genres?.map((genre: string) => (
                <div key={genre} className="bg-white/10 border border-white/30 px-2 py-1">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">
                    {genre}
                  </span>
                </div>
              ))}
            </div>

            {/* Venue Title */}
            <H1 variant="display" className="mb-6 text-white">
              {venue.name}
            </H1>

            {/* Venue Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Location */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">LOCATION</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {venue.city}, {venue.country}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  {venue.address || 'ADDRESS TBA'}
                </div>
              </div>

              {/* Capacity */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">CAPACITY</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {venue.capacity ? venue.capacity.toLocaleString() : 'TBA'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  PEOPLE
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">WEBSITE</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {venue.website ? 'AVAILABLE' : 'TBA'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  VISIT WEBSITE
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={handleLike}
                disabled={likesLoading}
                className={`p-3 border transition-all duration-200 disabled:opacity-50 ${
                  isLiked 
                    ? 'bg-red-500/20 border-red-500/60 text-red-400' 
                    : 'bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/60 text-white'
                }`}
                title={isLiked ? 'Unlike Venue' : 'Like Venue'}
              >
                {likesLoading ? (
                  <div className="scale-50">
                    <ClassicLoader />
                  </div>
                ) : (
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400' : ''}`} />
                )}
              </button>
              <button 
                onClick={handleShare}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 text-white transition-all duration-200"
                title={shareStatus === 'copied' ? 'Copied!' : shareStatus === 'error' ? 'Error' : 'Share Venue'}
              >
                {shareStatus === 'copied' ? (
                  <span className="text-xs font-bold tracking-wider uppercase">✓</span>
                ) : shareStatus === 'error' ? (
                  <span className="text-xs font-bold tracking-wider uppercase">!</span>
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={handleRate}
                className="px-6 py-3 bg-white text-black hover:bg-white/90 border-2 border-white font-bold tracking-wider uppercase transition-all duration-200"
              >
                RATE VENUE
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {venue.description && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6 z-10">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <H2 variant="display" className="mb-4 text-white">
                  ABOUT {venue.name}
                </H2>
                <p className="text-white/80 leading-relaxed font-medium tracking-wide">
                  {venue.description}
                </p>
              </div>
            )}

            {/* Venue Images Section */}
            {venue.images && venue.images.length > 0 && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6 z-10">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <H2 variant="display" className="mb-6 text-white">
                  VENUE PHOTOS
                </H2>
                <ImageGallery
                  images={venue.images}
                  title={`${venue.name} Photos`}
                  maxDisplay={8}
                  aspectRatio="video"
                />
              </div>
            )}

            {/* Upcoming Events Section */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6 z-10">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <H2 variant="display" className="text-white">
                    UPCOMING EVENTS
                  </H2>
                  <Link href={`/events?venue=${venue.id}`} className="text-white/80 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm">
                    VIEW ALL →
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.map((event: any) => (
                    <Link key={event.id} href={`/event/${event.id}`}>
                      <div className="bg-white/5 border border-white/20 p-4 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/80 font-bold tracking-wider uppercase">
                            {new Date(event.start_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-sm text-white/80 font-bold tracking-wider uppercase">
                            {new Date(event.start_date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <H3 className="font-bold text-white mb-1 tracking-wider uppercase">
                          {event.title}
                        </H3>
                        {event.artists && event.artists.length > 0 && (
                          <p className="text-sm text-white/60 font-bold tracking-widest uppercase">
                            {event.artists[0].name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <VenueReviews venueId={venue.id} venueName={venue.name} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Venue Information */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6 z-10">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <H3 variant="display" className="mb-6 text-white">
                VENUE INFORMATION
              </H3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">ADDRESS</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {venue.address || `${venue.city}, ${venue.country}`}
                  </div>
                  <div className="text-white/80 font-bold tracking-wider uppercase text-xs">
                    {venue.city}, {venue.country}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">CAPACITY</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {venue.capacity ? `${venue.capacity.toLocaleString()} PEOPLE` : 'TBA'}
                  </div>
                </div>

                {venue.website && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-white" />
                      <span className="text-white/80 font-bold tracking-widest uppercase text-xs">WEBSITE</span>
                    </div>
                    <a 
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white text-sm transition-colors font-bold tracking-wider uppercase"
                    >
                      VISIT WEBSITE →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Map Section */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6 z-10">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <H3 variant="display" className="mb-4 text-white">
                LOCATION
              </H3>
              <div className="mt-4">
                <MapboxMap
                  latitude={venue.latitude}
                  longitude={venue.longitude}
                  venueName={venue.name}
                  address={venue.address}
                />
              </div>
            </div>

            {/* Follow Section */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6 z-10">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <H3 variant="display" className="mb-4 text-white">
                FOLLOW {venue.name}
              </H3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-200 text-white font-bold tracking-wider uppercase text-sm">
                  GET NOTIFICATIONS
                </button>
                <button className="w-full p-3 bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-200 text-white font-bold tracking-wider uppercase text-sm">
                  SAVE VENUE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        targetType="venue"
        targetId={venue.id}
        targetName={venue.name}
        onSubmit={() => {
          setIsReviewModalOpen(false)
          // The VenueReviews component will refresh automatically
        }}
      />
    </div>
  )
} 