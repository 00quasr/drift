'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import CMSLayout from '@/components/cms/CMSLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Debug logging
  console.log('Dashboard Layout Debug:', { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null, 
    loading 
  })

  useEffect(() => {
    console.log('Dashboard useEffect triggered:', { user: !!user, loading })
    if (!loading && !user) {
      console.log('Redirecting to login - no user')
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    console.log('No user found, returning null')
    return null
  }

  // Check if user has permission to access dashboard
  console.log('Checking user role:', user.role)
  if (user.role === 'fan' && false) { // Temporarily disabled role check
    console.log('User is fan, showing access denied')
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">ACCESS DENIED</h1>
          <p className="text-white/60 mb-6">You need creator permissions to access the dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white text-black font-bold tracking-wider uppercase hover:bg-white/90 transition-colors"
          >
            GO HOME
          </button>
        </div>
      </div>
    )
  }

  console.log('User has permission, rendering CMS layout')

  return <CMSLayout>{children}</CMSLayout>
}