"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users, ExternalLink, Star, Heart, Share2, Ticket, Music } from "lucide-react"
import Link from "next/link"
import { getEvent } from "@/lib/services/events"
import { EntityReviews } from "@/components/reviews/EntityReviews"
import { notFound } from "next/navigation"
import Image from "next/image"
import { isValidImageUrl, getFallbackImage } from "@/lib/utils/imageUtils"
import ImageGallery from '@/components/ui/ImageGallery'
import EventLineup from '@/components/event/EventLineup'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ReviewModal } from '@/components/reviews/ReviewModal'
import { favoritesService } from '@/lib/services/favorites'
import { H1, H2, H3 } from "@/components/ui/typography"

interface EventPageProps {
  params: { id: string }
}

export default function EventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesLoading, setLikesLoading] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEvent(params.id)
        setEvent(eventData)
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [params.id])

  // Check if event is favorited when component mounts and user changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && event) {
        try {
          const isFavorited = await favoritesService.isFavorited('event', event.id)
          setIsLiked(isFavorited)
        } catch (error) {
          console.error('Error checking favorite status:', error)
        }
      }
    }
    checkFavoriteStatus()
  }, [user, event])

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
      alert('Please sign in to like events')
      return
    }
    
    if (likesLoading) return
    
    setLikesLoading(true)
    try {
      const newLikedState = await favoritesService.toggleFavorite('event', event.id)
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
      alert('Please sign in to rate events')
      return
    }
    setIsReviewModalOpen(true)
  }

  if (loading) {
    return null
  }

  if (!event) {
    notFound()
  }

  // Get fallback image
  const eventFlyer = isValidImageUrl(event.flyer_url) ? event.flyer_url! : getFallbackImage('event', event.id)

  // Format dates
  const startDate = new Date(event.start_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const isUpcoming = startDate > new Date()
  const isPast = startDate < new Date()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Main Event Tile */}
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
                  {isPast ? 'PAST EVENT' : 'UPCOMING EVENT'}
                </span>
              </div>
              
              {/* Genre Tags */}
              {event.genres?.map((genre: string) => (
                <div key={genre} className="bg-white/10 border border-white/30 px-2 py-1">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">
                    {genre}
                  </span>
                </div>
              ))}
            </div>

            {/* Event Title */}
            <H1 variant="display" className="mb-6 text-white">
              {event.title}
            </H1>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Date & Time */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">DATE & TIME</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {startDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  {startDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {endDate ? endDate.toLocaleTimeString('en-US', {
                    hour: '2-digit', 
                    minute: '2-digit'
                  }) : '01:00'}
                </div>
              </div>

              {/* Venue */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">VENUE</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {event.venue?.name || 'TBA'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  {event.venue?.city}, {event.venue?.country}
                </div>
              </div>

              {/* Price */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">PRICING</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {event.ticket_price_min && event.ticket_price_max 
                    ? `€${event.ticket_price_min}-€${event.ticket_price_max}`
                    : 'TBA'
                  }
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  ENTRY FEE
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
                title={isLiked ? 'Unlike Event' : 'Like Event'}
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
                title={shareStatus === 'copied' ? 'Copied!' : shareStatus === 'error' ? 'Error' : 'Share Event'}
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
                RATE EVENT
              </button>
              {event.ticket_url && isUpcoming && (
                <a 
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-black hover:bg-white/90 border-2 border-white font-bold tracking-wider uppercase transition-all duration-200 inline-flex items-center"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  BUY TICKETS
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {event.description && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6 z-10">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <H2 variant="display" className="mb-4 text-white">
                  ABOUT THIS EVENT
                </H2>
                <p className="text-white/80 leading-relaxed font-medium tracking-wide">
                  {event.description}
                </p>
              </div>
            )}

            {/* Event Images Section */}
            {event.images && event.images.length > 0 && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6 z-10">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <H2 variant="display" className="mb-6 text-white">
                  EVENT PHOTOS
                </H2>
                <ImageGallery
                  images={event.images}
                  title={`${event.title} Photos`}
                  maxDisplay={6}
                  aspectRatio="video"
                />
              </div>
            )}

            {/* Lineup Section */}
            {event.artists && event.artists.length > 0 && (
              <EventLineup artists={event.artists} />
            )}

            {/* Reviews Section */}
            <EntityReviews
              entityType="event"
              entityId={event.id}
              entityName={event.title}
              isPastEvent={!isUpcoming}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6 z-10">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <H3 variant="display" className="mb-6 text-white">
                EVENT DETAILS
              </H3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">DATE & TIME</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {startDate.toLocaleDateString()}
                  </div>
                  <div className="text-white/80 font-bold tracking-wider uppercase text-xs">
                    {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '01:00'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">VENUE</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {event.venue?.name || 'TBA'}
                  </div>
                  <div className="text-white/80 font-bold tracking-wider uppercase text-xs">
                    {event.venue?.address || `${event.venue?.city}, ${event.venue?.country}`}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">PRICING</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {event.ticket_price_min && event.ticket_price_max 
                      ? `€${event.ticket_price_min} - €${event.ticket_price_max}`
                      : 'FREE ENTRY'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Artists */}
            {event.artists && event.artists.length > 0 && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6 z-10">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <H3 variant="display" className="mb-4 text-white">
                  ARTISTS
                </H3>
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-white" />
                  <div>
                    <div className="font-bold text-white tracking-wider uppercase">
                      {event.artists.length} PERFORMING
                    </div>
                    <div className="text-white/60 text-sm font-bold tracking-widest uppercase">
                      {event.artists.slice(0, 3).map(a => a.name).join(', ')}
                      {event.artists.length > 3 && ` +${event.artists.length - 3} MORE`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* More at Venue */}
            {event.venue && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6 z-10">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <H3 variant="display" className="mb-4 text-white">
                  MORE AT {event.venue.name}
                </H3>
                <Link 
                  href={`/venue/${event.venue.id}`}
                  className="text-white/80 hover:text-white text-sm transition-colors font-bold tracking-wider uppercase"
                >
                  VIEW ALL EVENTS AT THIS VENUE →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        targetType="event"
        targetId={event.id}
        targetName={event.title}
        onSubmit={() => {
          setIsReviewModalOpen(false)
          // The EntityReviews component will refresh automatically
        }}
      />
    </div>
  )
} 