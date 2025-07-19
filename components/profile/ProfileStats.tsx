"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Heart, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Users,
  Eye
} from 'lucide-react'

interface ProfileStats {
  reviews_count: number
  favorites_count: number
  profile_views: number
  connections_count: number
}

interface ProfileStatsProps {
  profileId: string
  stats: ProfileStats | null
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  profileId,
  stats
}) => {
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white/5 border border-white/20 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-3"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'TOTAL REVIEWS',
      value: stats.reviews_count,
      icon: MessageSquare,
      color: 'text-cyan-400',
      description: 'Reviews written'
    },
    {
      title: 'FAVORITES',
      value: stats.favorites_count,
      icon: Heart,
      color: 'text-red-400',
      description: 'Items favorited'
    },
    {
      title: 'PROFILE VIEWS',
      value: stats.profile_views,
      icon: Eye,
      color: 'text-green-400',
      description: 'Profile visits'
    },
    {
      title: 'CONNECTIONS',
      value: stats.connections_count,
      icon: Users,
      color: 'text-purple-400',
      description: 'Active connections'
    },
    {
      title: 'ENGAGEMENT RATE',
      value: Math.round(((stats.reviews_count + stats.favorites_count) / Math.max(stats.profile_views, 1)) * 100),
      icon: TrendingUp,
      color: 'text-yellow-400',
      description: 'Reviews + Favorites / Views',
      suffix: '%'
    },
    {
      title: 'ACTIVITY SCORE',
      value: Math.min(Math.round((stats.reviews_count * 3 + stats.favorites_count * 2 + stats.connections_count * 1) / 10), 100),
      icon: BarChart3,
      color: 'text-pink-400',
      description: 'Overall activity level',
      suffix: '/100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold tracking-wider uppercase mb-6 text-white">
          PROFILE STATISTICS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="bg-white/5 border border-white/20 p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {stat.value}{stat.suffix || ''}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold tracking-wider uppercase text-sm text-white mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-white/60 text-sm font-medium">
                    {stat.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div>
        <h3 className="text-xl font-bold tracking-wider uppercase mb-4 text-white">
          ACTIVITY BREAKDOWN
        </h3>
        
        <Card className="bg-white/5 border border-white/20 p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold tracking-wider uppercase text-sm text-white">
                REVIEWS CONTRIBUTION
              </span>
              <span className="text-cyan-400 font-bold">
                {stats.reviews_count > 0 ? Math.round((stats.reviews_count / (stats.reviews_count + stats.favorites_count)) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats.reviews_count > 0 ? Math.round((stats.reviews_count / (stats.reviews_count + stats.favorites_count)) * 100) : 0}%` 
                }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold tracking-wider uppercase text-sm text-white">
                FAVORITES CONTRIBUTION
              </span>
              <span className="text-red-400 font-bold">
                {stats.favorites_count > 0 ? Math.round((stats.favorites_count / (stats.reviews_count + stats.favorites_count)) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-red-400 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats.favorites_count > 0 ? Math.round((stats.favorites_count / (stats.reviews_count + stats.favorites_count)) * 100) : 0}%` 
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <div>
        <h3 className="text-xl font-bold tracking-wider uppercase mb-4 text-white">
          PERFORMANCE INSIGHTS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h4 className="font-bold tracking-wider uppercase text-white">
                ENGAGEMENT LEVEL
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/80 text-sm">Active Contributor</span>
                <span className="text-green-400 font-bold text-sm">
                  {stats.reviews_count > 5 ? 'HIGH' : stats.reviews_count > 1 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80 text-sm">Social Activity</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {stats.connections_count > 10 ? 'HIGH' : stats.connections_count > 3 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-400" />
              <h4 className="font-bold tracking-wider uppercase text-white">
                COMMUNITY IMPACT
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/80 text-sm">Profile Popularity</span>
                <span className="text-purple-400 font-bold text-sm">
                  {stats.profile_views > 50 ? 'HIGH' : stats.profile_views > 10 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80 text-sm">Content Quality</span>
                <span className="text-pink-400 font-bold text-sm">
                  {stats.reviews_count > 3 ? 'ESTABLISHED' : 'GROWING'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}