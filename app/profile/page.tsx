"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileRedirect() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace(`/profile/${user.id}`)
    } else {
      router.replace('/auth/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white/80 font-bold tracking-wider uppercase">
          REDIRECTING TO PROFILE...
        </p>
      </div>
    </div>
  )
}