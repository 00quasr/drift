"use client"

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FollowButton } from '@/components/social/FollowButton'

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
  followers_count: number
  following_count: number
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

  const socialPlatforms = profile.social_links
    ? Object.entries(profile.social_links).filter(([_, url]) => url)
    : []

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-neutral-800 flex-shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-neutral-600 text-4xl font-light">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {displayName}
                </h1>
                {profile.is_verified && (
                  <span className="text-xs font-medium bg-white text-black px-2 py-0.5">
                    Verified
                  </span>
                )}
              </div>

              {profile.location && (
                <p className="text-neutral-500 mb-4">
                  {profile.location}
                </p>
              )}

              {/* Stats inline */}
              {stats && (
                <div className="flex flex-wrap gap-6 text-sm mb-6">
                  <div>
                    <span className="text-white font-medium">{stats.followers_count}</span>
                    <span className="text-neutral-500 ml-1.5">followers</span>
                  </div>
                  <div>
                    <span className="text-white font-medium">{stats.following_count}</span>
                    <span className="text-neutral-500 ml-1.5">following</span>
                  </div>
                  <div>
                    <span className="text-white font-medium">{stats.reviews_count}</span>
                    <span className="text-neutral-500 ml-1.5">reviews</span>
                  </div>
                  <div>
                    <span className="text-white font-medium">{stats.favorites_count}</span>
                    <span className="text-neutral-500 ml-1.5">favorites</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {isOwnProfile ? (
                  <Link href="/settings/profile">
                    <button className="bg-white text-black px-5 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors">
                      Edit profile
                    </button>
                  </Link>
                ) : (
                  <FollowButton
                    userId={profile.id}
                    className="bg-white text-black px-5 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
                  />
                )}
                <button
                  onClick={handleShare}
                  className={cn(
                    "px-5 py-2 text-sm font-medium transition-colors border",
                    shareStatus === 'copied'
                      ? "border-green-600 text-green-500"
                      : shareStatus === 'error'
                      ? "border-red-600 text-red-500"
                      : "border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:text-white"
                  )}
                >
                  {shareStatus === 'copied' ? 'Copied!' : shareStatus === 'error' ? 'Failed' : 'Share'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio Section */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-neutral-300 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>
          </motion.div>
        )}

        {/* Genres */}
        {profile.favorite_genres && profile.favorite_genres.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
              Genres
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.favorite_genres.map((genre) => (
                <span
                  key={genre}
                  className="text-sm text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1.5"
                >
                  {genre}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Social Links */}
        {socialPlatforms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
              Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {socialPlatforms.map(([platform, url]) => (
                <a
                  key={platform}
                  href={typeof url === 'string' ? url : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-4"
                >
                  {platform}
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Member since */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="pt-8 border-t border-neutral-800"
        >
          <p className="text-neutral-600 text-sm">
            Member since {formatDistanceToNow(joinedDate, { addSuffix: true })}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
