"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/auth'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'

export default function ProfileEditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    try {
      setError('')
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch(`/api/user/profile`, {
        headers
      })
      const data = await response.json()
      
      console.log('Profile API response:', data) // Debug log
      
      if (data.success) {
        setProfile(data.data.profile)
      } else {
        setError(data.error || 'Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Network error fetching profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/80 font-bold tracking-wider uppercase">
            LOADING PROFILE...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-bold tracking-wider uppercase">
            ERROR: {error}
          </p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60 font-bold tracking-wider uppercase">
            NO PROFILE DATA FOUND
          </p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/profile/${user.id}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold tracking-wider uppercase text-sm">BACK TO PROFILE</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-white" />
            <h1 className="text-3xl font-bold tracking-wider uppercase">
              EDIT PROFILE
            </h1>
          </div>
          <p className="text-white/60 font-medium">
            Update your profile information and preferences
          </p>
        </div>

        {/* Edit Form */}
        <Card className="bg-white/5 border border-white/20 p-8">
          <ProfileEditForm 
            profile={profile} 
            onSuccess={() => {
              router.push(`/profile/${user.id}`)
            }}
          />
        </Card>
      </div>
    </div>
  )
}