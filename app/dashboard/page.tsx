'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  MapPin,
  Calendar,
  Music,
  Eye,
  TrendingUp,
  ArrowRight,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import ClassicLoader from '@/components/ui/loader'
import { H1, H2, H3 } from "@/components/ui/typography"

interface DashboardStats {
  venues: number
  events: number
  artists: number
  totalViews: number
  totalLikes: number
  recentActivity: any[]
  pendingVerifications?: number
}

export default function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    venues: 0,
    events: 0,
    artists: 0,
    totalViews: 0,
    totalLikes: 0,
    recentActivity: [],
    pendingVerifications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Import auth service here to get token
      const { authService } = await import('@/lib/auth')
      const token = await authService.getAccessToken()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch('/api/dashboard/stats', { headers })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setStats(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQuickActions = () => {
    const actions = []
    
    if (user?.role === 'club_owner' || user?.role === 'admin') {
      actions.push({
        title: 'Add Venue',
        href: '/dashboard/venues/new',
        icon: MapPin,
        description: 'Create a new venue profile'
      })
    }
    
    if (user?.role === 'promoter' || user?.role === 'club_owner' || user?.role === 'admin') {
      actions.push({
        title: 'Create Event',
        href: '/dashboard/events/new',
        icon: Calendar,
        description: 'Schedule a new event'
      })
    }
    
    if (user?.role === 'artist' || user?.role === 'admin') {
      actions.push({
        title: 'Artist Profile',
        href: '/dashboard/artists/new',
        icon: Music,
        description: 'Create artist profile'
      })
    }

    if (user?.role === 'admin') {
      actions.push({
        title: 'Verification Requests',
        href: '/admin/verification',
        icon: Shield,
        description: 'Review and approve user verification requests'
      })
    }

    return actions
  }

  const quickActions = getQuickActions()

  const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-neutral-900/50 border border-white/10 p-6 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6 text-white/50" />
        {trend && (
          <div className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
        {label}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClassicLoader />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="border-b border-white/10 pb-8">
        <H1 variant="display" className="mb-2">
          Welcome back, {user?.display_name || user?.email}
        </H1>
        <p className="text-white/50 font-medium tracking-wider uppercase text-sm">
          {user?.role} Dashboard • {user?.is_verified ? 'VERIFIED' : 'PENDING VERIFICATION'}
        </p>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <H2 variant="display" className="mb-6">
            Quick Actions
          </H2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <div className="bg-neutral-900/50 border border-white/10 p-5 hover:border-white/20 transition-colors cursor-pointer group h-full">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Icon className="w-5 h-5 text-white/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <H3 className="text-base mb-1">
                          {action.title}
                        </H3>
                        <p className="text-white/50 text-xs font-medium tracking-wide uppercase">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-white/50 text-xs font-medium tracking-wider uppercase group-hover:text-white transition-colors">
                      <ArrowRight className="w-3 h-3 mr-2" />
                      CREATE
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div>
        <H2 variant="display" className="mb-6">
          Overview
        </H2>
        <div className={`grid grid-cols-2 gap-4 ${user?.role === 'admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <StatCard
            icon={MapPin}
            label="Total Venues"
            value={stats.venues}
            trend={12}
          />
          <StatCard
            icon={Calendar}
            label="Events Created"
            value={stats.events}
            trend={8}
          />
          <StatCard
            icon={Music}
            label="Artists"
            value={stats.artists}
            trend={15}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.totalViews?.toLocaleString() || '0'}
            trend={23}
          />
          {user?.role === 'admin' && (
            <Link href="/dashboard/verification">
              <StatCard
                icon={Shield}
                label="Pending Verifications"
                value={stats.pendingVerifications || 0}
                trend={null}
              />
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <H2 variant="display" className="mb-6">
          Recent Activity
        </H2>
        <div className="bg-neutral-900/30 border border-white/10">
          {stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-white/5">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="p-4 flex items-center space-x-4 hover:bg-white/5 transition-colors">
                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                  <div className="flex-1">
                    <p className="text-white font-medium tracking-wider uppercase text-sm">
                      {activity.action}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-white/40 text-xs">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-white/50 font-medium tracking-wider uppercase text-sm">
                No recent activity
              </p>
              <p className="text-white/40 text-xs mt-2">
                Start creating content to see activity here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}