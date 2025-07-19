"use client"

import React from 'react'
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
  UserCheck
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

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
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-400/20 text-red-400 border-red-400/30'
      case 'artist': return 'bg-purple-400/20 text-purple-400 border-purple-400/30'
      case 'promoter': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
      case 'club_owner': return 'bg-green-400/20 text-green-400 border-green-400/30'
      default: return 'bg-blue-400/20 text-blue-400 border-blue-400/30'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artist': return '🎧'
      case 'promoter': return '🎪'
      case 'club_owner': return '🏢'
      case 'admin': return '👑'
      default: return '🎵'
    }
  }

  return (
    <div className="relative bg-black border-b border-white/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-pink-400/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          )`
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white/10 border-2 border-white/30 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl lg:text-7xl">
                    {getRoleIcon(profile.role)}
                  </div>
                )}
              </div>
              
              {/* Online Status (if own profile) */}
              {isOwnProfile && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 border-2 border-black rounded-full" />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            {/* Name and Role */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-wider uppercase">
                  {displayName}
                </h1>
                {profile.is_verified && (
                  <div className="w-8 h-8 bg-cyan-400 border border-cyan-400 flex items-center justify-center">
                    <span className="text-black font-bold text-sm">✓</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={`font-bold tracking-wider uppercase ${getRoleColor(profile.role)}`}>
                  {getRoleIcon(profile.role)} {profile.role.replace('_', ' ')}
                </Badge>
                {profile.location && (
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium tracking-wider uppercase text-sm">
                      {profile.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="max-w-2xl">
                <p className="text-white/80 leading-relaxed font-medium">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Genres */}
            {profile.favorite_genres && profile.favorite_genres.length > 0 && (
              <div>
                <p className="text-white/60 font-bold tracking-wider uppercase text-sm mb-3">
                  FAVORITE GENRES
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_genres.slice(0, 6).map((genre) => (
                    <div
                      key={genre}
                      className="bg-white/10 border border-white/30 px-3 py-1"
                    >
                      <span className="text-white text-sm font-bold tracking-wider uppercase">
                        {genre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">
                    {stats.reviews_count}
                  </div>
                  <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                    REVIEWS
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">
                    {stats.favorites_count}
                  </div>
                  <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                    FAVORITES
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">
                    {stats.connections_count}
                  </div>
                  <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                    CONNECTIONS
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">
                    {stats.profile_views}
                  </div>
                  <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                    VIEWS
                  </div>
                </div>
              </div>
            )}

            {/* Join Date */}
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="w-4 h-4" />
              <span className="font-medium tracking-wider uppercase text-sm">
                JOINED {formatDistanceToNow(joinedDate, { addSuffix: true }).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0">
            <div className="flex flex-col gap-3 w-48">
              {isOwnProfile ? (
                <>
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase">
                    <Settings className="w-4 h-4 mr-2" />
                    EDIT PROFILE
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 bg-black text-white hover:bg-white/10 font-bold tracking-wider uppercase"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    SHARE
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full bg-cyan-400 text-black hover:bg-cyan-500 font-bold tracking-wider uppercase">
                    <UserPlus className="w-4 h-4 mr-2" />
                    CONNECT
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 bg-black text-white hover:bg-white/10 font-bold tracking-wider uppercase"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    MESSAGE
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 bg-black text-white hover:bg-white/10 font-bold tracking-wider uppercase"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    SHARE
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}