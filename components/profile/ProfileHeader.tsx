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
  UserCheck,
  User
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
  
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'club_owner': return 'VENUE OWNER'
      default: return role.replace('_', ' ').toUpperCase()
    }
  }

  return (
    <div className="relative bg-black border-b border-white/20">
      {/* Minimal Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(255,255,255,0.1) 50px,
            rgba(255,255,255,0.1) 51px
          ), repeating-linear-gradient(
            0deg,
            transparent,
            transparent 50px,
            rgba(255,255,255,0.1) 50px,
            rgba(255,255,255,0.1) 51px
          )`
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 lg:w-20 lg:h-20 border border-white/30 flex items-center justify-center">
                    <User className="w-8 h-8 lg:w-10 lg:h-10 text-white/60" />
                  </div>
                )}
              </div>
              
              {/* Verification badge */}
              {profile.is_verified && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border border-black flex items-center justify-center">
                  <span className="text-black font-bold text-xs">✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            {/* Name and Role */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-wider uppercase mb-2">
                {displayName}
              </h1>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-white/10 text-white border-white/20 font-bold tracking-wider uppercase">
                  {getRoleDisplay(profile.role)}
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
                      className="bg-white/5 border border-white/20 px-3 py-1"
                    >
                      <span className="text-white/80 text-sm font-bold tracking-wider uppercase">
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
                  <Link href="/settings/profile">
                    <Button className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase">
                      <Settings className="w-4 h-4 mr-2" />
                      EDIT PROFILE
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold tracking-wider uppercase"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    SHARE
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase">
                    <UserPlus className="w-4 h-4 mr-2" />
                    CONNECT
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold tracking-wider uppercase"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    MESSAGE
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold tracking-wider uppercase"
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