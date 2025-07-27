'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Music, 
  Users,
  Eye,
  Heart,
  TrendingUp,
  Plus,
  Shield
} from 'lucide-react'
import Link from 'next/link'

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
    <motion.div
      className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-white/60" />
        {trend && (
          <div className="flex items-center space-x-1 text-green-400 text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
        {label}
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="border-b border-white/20 pb-6">
        <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
          Welcome back, {user?.display_name || user?.email}
        </h1>
        <p className="text-white/60 font-bold tracking-wider uppercase">
          {user?.role} Dashboard • {user?.is_verified ? 'VERIFIED' : 'PENDING VERIFICATION'}
        </p>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm hover:border-white/40 transition-all duration-200 cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold tracking-wider uppercase text-white text-lg">
                          {action.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-white/80 text-sm font-bold tracking-wider uppercase group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4 mr-2" />
                      CREATE NOW
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
          Overview
        </h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${user?.role === 'admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
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
        <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
          Recent Activity
        </h2>
        <div className="bg-black/50 border border-white/20 backdrop-blur-sm">
          {stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-white/10">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="p-4 flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white" />
                  <div className="flex-1">
                    <p className="text-white font-bold tracking-wider uppercase text-sm">
                      {activity.action}
                    </p>
                    <p className="text-white/60 text-sm">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-white/40 text-sm">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-white/60 font-bold tracking-wider uppercase">
                No recent activity
              </p>
              <p className="text-white/40 text-sm mt-2">
                Start creating content to see activity here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}