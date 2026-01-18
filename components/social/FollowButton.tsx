'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface FollowButtonProps {
  userId: string
  initialIsFollowing?: boolean
  initialPendingRequest?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showUnfollowOnHover?: boolean
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  initialPendingRequest = false,
  onFollowChange,
  size = 'default',
  className,
  showUnfollowOnHover = true
}: FollowButtonProps) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, setIsPending] = useState(initialPendingRequest)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial follow status on mount if not provided
  useEffect(() => {
    if (user && !initialIsFollowing && !initialPendingRequest) {
      fetchFollowStatus()
    }
  }, [user, userId])

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsFollowing(data.data.isFollowing)
          setIsPending(data.data.pendingRequest)
        }
      }
    } catch (err) {
      console.error('Error fetching follow status:', err)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/auth/login'
      return
    }

    if (user.id === userId) {
      return // Can't follow yourself
    }

    setIsLoading(true)
    setError(null)

    // Optimistic update
    const wasFollowing = isFollowing
    const wasPending = isPending

    if (isFollowing || isPending) {
      setIsFollowing(false)
      setIsPending(false)
    } else {
      setIsFollowing(true) // Optimistically assume accepted
    }

    try {
      const method = wasFollowing || wasPending ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Revert optimistic update
        setIsFollowing(wasFollowing)
        setIsPending(wasPending)
        setError(data.error || 'Failed to update follow status')
        return
      }

      // Update state based on response
      if (method === 'POST') {
        if (data.data.status === 'pending') {
          setIsFollowing(false)
          setIsPending(true)
        } else {
          setIsFollowing(true)
          setIsPending(false)
        }
      } else {
        setIsFollowing(false)
        setIsPending(false)
      }

      onFollowChange?.(method === 'POST')
    } catch (err) {
      // Revert optimistic update
      setIsFollowing(wasFollowing)
      setIsPending(wasPending)
      setError('Network error. Please try again.')
      console.error('Error updating follow status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if viewing own profile
  if (user?.id === userId) {
    return null
  }

  const getButtonText = () => {
    if (isLoading) return null
    if (isPending) return 'Requested'
    if (isFollowing) {
      if (showUnfollowOnHover && isHovered) return 'Unfollow'
      return 'Following'
    }
    return 'Follow'
  }

  const getButtonVariant = () => {
    if (isPending) return 'outline' as const
    if (isFollowing) {
      if (showUnfollowOnHover && isHovered) return 'destructive' as const
      return 'secondary' as const
    }
    return 'default' as const
  }

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleFollow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={cn(
        'min-w-[100px] transition-all duration-200',
        isFollowing && showUnfollowOnHover && 'hover:border-red-500 hover:text-red-500',
        className
      )}
      title={error || undefined}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        getButtonText()
      )}
    </Button>
  )
}

export default FollowButton
