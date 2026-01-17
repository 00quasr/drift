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

  return null
}