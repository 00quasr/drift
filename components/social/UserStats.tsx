'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UserStatsProps {
  userId: string
  initialFollowersCount?: number
  initialFollowingCount?: number
  className?: string
  showLinks?: boolean
}

export function UserStats({
  userId,
  initialFollowersCount,
  initialFollowingCount,
  className,
  showLinks = true
}: UserStatsProps) {
  const [followersCount, setFollowersCount] = useState(initialFollowersCount ?? 0)
  const [followingCount, setFollowingCount] = useState(initialFollowingCount ?? 0)
  const [isLoading, setIsLoading] = useState(
    initialFollowersCount === undefined || initialFollowingCount === undefined
  )

  useEffect(() => {
    if (initialFollowersCount === undefined || initialFollowingCount === undefined) {
      fetchStats()
    }
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFollowersCount(data.data.followersCount)
          setFollowingCount(data.data.followingCount)
        }
      }
    } catch (err) {
      console.error('Error fetching user stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const StatItem = ({
    count,
    label,
    href
  }: {
    count: number
    label: string
    href?: string
  }) => {
    const content = (
      <div className="text-center">
        <div className="text-lg font-semibold text-white">
          {isLoading ? '-' : formatCount(count)}
        </div>
        <div className="text-xs text-neutral-400 uppercase tracking-wide">
          {label}
        </div>
      </div>
    )

    if (showLinks && href) {
      return (
        <Link
          href={href}
          className="hover:bg-white/5 rounded-lg px-4 py-2 transition-colors"
        >
          {content}
        </Link>
      )
    }

    return <div className="px-4 py-2">{content}</div>
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatItem
        count={followersCount}
        label="Followers"
        href={showLinks ? `/profile/${userId}/followers` : undefined}
      />
      <div className="w-px h-8 bg-white/10" />
      <StatItem
        count={followingCount}
        label="Following"
        href={showLinks ? `/profile/${userId}/following` : undefined}
      />
    </div>
  )
}

export default UserStats
