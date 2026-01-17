"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/auth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { ProfileActivity } from '@/components/profile/ProfileActivity'
import { ProfileReviews } from '@/components/profile/ProfileReviews'
import { ProfileFavorites } from '@/components/profile/ProfileFavorites'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

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

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  const profileId = params?.id as string

  useEffect(() => {
    if (!profileId) return

    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError('')

        // Check if this is the user's own profile
        const ownProfile = user?.id === profileId
        setIsOwnProfile(ownProfile)

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single()

        if (profileError) {
          throw new Error('Profile not found')
        }

        setProfile(profileData)

        // Fetch profile stats
        const [reviewsResult, favoritesResult, viewsResult, connectionsResult] = await Promise.all([
          supabase
            .from('reviews')
            .select('id', { count: 'exact' })
            .eq('user_id', profileId),
          supabase
            .from('favorites')
            .select('id', { count: 'exact' })
            .eq('user_id', profileId),
          supabase
            .from('profile_views')
            .select('id', { count: 'exact' })
            .eq('profile_id', profileId),
          supabase
            .from('user_connections')
            .select('id', { count: 'exact' })
            .eq('following_id', profileId)
            .eq('status', 'accepted')
        ])

        setStats({
          reviews_count: reviewsResult.count || 0,
          favorites_count: favoritesResult.count || 0,
          profile_views: viewsResult.count || 0,
          connections_count: connectionsResult.count || 0
        })

        // Track profile view (if not own profile and user is authenticated)
        if (!ownProfile && user) {
          await supabase
            .from('profile_views')
            .insert({
              profile_id: profileId,
              viewer_id: user.id
            })
        }

      } catch (error: any) {
        console.error('Error fetching profile:', error)
        setError(error.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [profileId, user])

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-950" />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <Card className="bg-white/5 border border-red-500/30 p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold tracking-wider uppercase">
              PROFILE NOT FOUND
            </h1>
            <p className="text-white/80 font-medium">
              {error || 'The profile you are looking for does not exist.'}
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="w-full mt-6 bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200"
            >
              BACK TO EXPLORE
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <ProfileHeader 
      profile={profile} 
      stats={stats} 
      isOwnProfile={isOwnProfile}
    />
  )
}