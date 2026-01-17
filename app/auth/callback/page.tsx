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
            // Create a basic profile for OAuth users using the API route
            try {
              const response = await fetch('/api/auth/create-profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.session.access_token}`
                },
                body: JSON.stringify({
                  user_id: data.session.user.id,
                  email: data.session.user.email,
                  full_name: data.session.user.user_metadata.full_name || data.session.user.user_metadata.name || 'User',
                  role: 'fan'
                })
              })

              if (!response.ok) {
                const errorData = await response.json()
                console.error('Profile creation error:', errorData)
              } else {
                console.log('Profile created successfully')
              }
            } catch (error) {
              console.error('Profile creation request error:', error)
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

  return <div className="min-h-screen bg-neutral-950" />
}