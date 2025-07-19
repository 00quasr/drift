"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/auth'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=oauth_error')
          return
        }

        if (data.session) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', data.session.user.id)
            .single()

          if (!profile) {
            // Create a basic profile for OAuth users
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email,
                full_name: data.session.user.user_metadata.full_name || data.session.user.user_metadata.name,
                role: 'fan',
                is_verified: false,
              })

            if (profileError) {
              console.error('Profile creation error:', profileError)
            }
          }

          // Redirect to explore page
          router.push('/explore')
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/login?error=oauth_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white/80 font-bold tracking-wider uppercase">
          PROCESSING AUTHENTICATION...
        </p>
      </div>
    </div>
  )
}