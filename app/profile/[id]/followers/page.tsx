'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { User, ArrowLeft } from 'lucide-react'
import { FollowButton } from '@/components/social/FollowButton'

interface FollowerProfile {
  id: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

interface FollowerData {
  follower_id: string
  status: string
  created_at: string
  profile: FollowerProfile
  isFollowing?: boolean
}

export default function FollowersPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [followers, setFollowers] = useState<FollowerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileName, setProfileName] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const profileId = params?.id as string

  useEffect(() => {
    if (!profileId) return
    fetchFollowers()
  }, [profileId, page])

  const fetchFollowers = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`/api/users/${profileId}/followers?page=${page}&limit=20`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch followers')
      }

      if (page === 1) {
        setFollowers(data.data.followers)
      } else {
        setFollowers(prev => [...prev, ...data.data.followers])
      }

      setProfileName(data.data.profileName || 'User')
      setHasMore(data.data.hasMore)
    } catch (error: any) {
      console.error('Error fetching followers:', error)
      setError(error.message || 'Failed to load followers')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const getDisplayName = (profile: FollowerProfile) => {
    return profile.display_name || profile.full_name || 'Anonymous User'
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium tracking-wider uppercase text-sm">BACK</span>
          </button>

          <h1 className="text-3xl font-bold text-white tracking-wider uppercase">
            {profileName}'S FOLLOWERS
          </h1>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-6 text-center">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && followers.length === 0 && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && followers.length === 0 && !error && (
          <div className="bg-black border-2 border-white/20 p-12 text-center">
            <p className="text-white/60 font-bold tracking-widest uppercase">
              NO FOLLOWERS YET
            </p>
          </div>
        )}

        {/* Followers List */}
        {followers.length > 0 && (
          <div className="space-y-4">
            {followers.map((follower) => (
              <div
                key={follower.follower_id}
                className="bg-black border-2 border-white/20 p-4 hover:border-white/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${follower.follower_id}`}>
                    <div className="w-12 h-12 bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden">
                      {follower.profile.avatar_url ? (
                        <Image
                          src={follower.profile.avatar_url}
                          alt={getDisplayName(follower.profile)}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white/60" />
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${follower.follower_id}`}>
                      <h3 className="text-white font-bold tracking-wider uppercase truncate hover:text-white/80 transition-colors">
                        {getDisplayName(follower.profile)}
                      </h3>
                    </Link>
                    {follower.profile.bio && (
                      <p className="text-white/60 text-sm truncate">
                        {follower.profile.bio}
                      </p>
                    )}
                  </div>

                  {user && user.id !== follower.follower_id && (
                    <FollowButton
                      userId={follower.follower_id}
                      initialIsFollowing={follower.isFollowing}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-8 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'LOADING...' : 'LOAD MORE'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
