"use client"

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Settings,
  Share2,
  UserPlus,
  UserCheck,
  User,
  ExternalLink,
  Globe,
  Mail
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileData {
  id: string
  full_name: string | null
  display_name: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
  role: string
  is_verified: boolean
  favorite_genres: string[]
  social_links: any
  created_at: string
}

interface ProfileStats {
  reviews_count: number
  favorites_count: number
  profile_views: number
  connections_count: number
}

interface ProfileHeaderProps {
  profile: ProfileData
  stats: ProfileStats | null
  isOwnProfile: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  stats,
  isOwnProfile
}) => {
  const displayName = profile.display_name || profile.full_name || 'Anonymous User'
  const joinedDate = new Date(profile.created_at)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle')

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

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-black border-2 border-white/20 p-8 h-full">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-48 h-48 bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-24 h-24 text-white/60" />
                  )}
                </div>

                {/* Name and Info */}
                <div className="space-y-3 w-full">
                  <h1 className="text-2xl font-bold text-white tracking-wider uppercase">
                    {displayName}
                  </h1>
                  
                  {profile.location && (
                    <div className="flex items-center justify-center gap-2 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium tracking-wider uppercase text-sm">
                        {profile.location}
                      </span>
                    </div>
                  )}

                  {profile.is_verified && (
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-1">
                      <span className="text-white font-bold tracking-widest uppercase text-xs">VERIFIED</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                  {isOwnProfile ? (
                    <Link href="/settings/profile" className="block">
                      <button className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                        EDIT PROFILE
                      </button>
                    </Link>
                  ) : (
                    <button className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                      CONNECT
                    </button>
                  )}
                  <button 
                    onClick={handleShare}
                    className="w-full border border-white/30 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200"
                  >
                    {shareStatus === 'copied' ? 'COPIED!' : shareStatus === 'error' ? 'ERROR' : 'SHARE'}
                  </button>
                </div>

                {/* Join Date */}
                <div className="text-white/60 font-bold tracking-widest uppercase text-sm">
                  JOINED {formatDistanceToNow(joinedDate, { addSuffix: true }).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-black border-2 border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-white animate-pulse" />
                <h2 className="text-white font-bold tracking-widest uppercase text-lg">ABOUT</h2>
              </div>
              <p className="text-white/80 text-lg leading-relaxed font-medium">
                {profile.bio || 'No biography available yet.'}
              </p>
            </div>

            {/* Social Links Section */}
            <div className="bg-black border-2 border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-white animate-pulse" />
                <h2 className="text-white font-bold tracking-widest uppercase text-lg">CONNECT</h2>
              </div>
              <div className="space-y-4">
                {profile.social_links && Object.keys(profile.social_links).length > 0 ? (
                  Object.entries(profile.social_links).map(([platform, url]) => (
                    url && (
                      <a
                        key={platform}
                        href={typeof url === 'string' ? url : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all duration-200 group"
                      >
                        <span className="text-white font-bold tracking-wider uppercase">
                          {platform}
                        </span>
                        <ExternalLink className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                      </a>
                    )
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/40 font-bold tracking-widest uppercase">
                      NO SOCIAL LINKS ADDED
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Genres Section */}
            {profile.favorite_genres && profile.favorite_genres.length > 0 && (
              <div className="bg-black border-2 border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-white animate-pulse" />
                  <h2 className="text-white font-bold tracking-widest uppercase text-lg">GENRES</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {profile.favorite_genres.map((genre) => (
                    <div
                      key={genre}
                      className="bg-white/10 border border-white/30 px-4 py-3 text-center"
                    >
                      <span className="text-white font-bold tracking-wider uppercase text-sm">
                        {genre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black border-2 border-white/20 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.reviews_count}
              </div>
              <div className="text-white/60 font-bold tracking-widest uppercase text-sm">
                REVIEWS
              </div>
            </div>
            <div className="bg-black border-2 border-white/20 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.favorites_count}
              </div>
              <div className="text-white/60 font-bold tracking-widest uppercase text-sm">
                FAVORITES
              </div>
            </div>
            <div className="bg-black border-2 border-white/20 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.connections_count}
              </div>
              <div className="text-white/60 font-bold tracking-widest uppercase text-sm">
                CONNECTIONS
              </div>
            </div>
            <div className="bg-black border-2 border-white/20 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.profile_views}
              </div>
              <div className="text-white/60 font-bold tracking-widest uppercase text-sm">
                VIEWS
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}