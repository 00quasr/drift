'use client'

import { useState, useEffect } from 'react'
import { H1, H2 } from '@/components/ui/typography'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart
} from 'recharts'
import {
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Eye,
  Music
} from 'lucide-react'
import ClassicLoader from '@/components/ui/loader'

// Sample data - in production this would come from an API
const viewsData = [
  { month: 'Jan', views: 1200, events: 45 },
  { month: 'Feb', views: 1850, events: 52 },
  { month: 'Mar', views: 2100, events: 61 },
  { month: 'Apr', views: 1950, events: 58 },
  { month: 'May', views: 2400, events: 72 },
  { month: 'Jun', views: 2800, events: 85 },
]

const userGrowthData = [
  { month: 'Jan', users: 120, verified: 45 },
  { month: 'Feb', users: 185, verified: 68 },
  { month: 'Mar', users: 210, verified: 89 },
  { month: 'Apr', users: 195, verified: 95 },
  { month: 'May', users: 240, verified: 120 },
  { month: 'Jun', users: 280, verified: 145 },
]

const contentByCategory = [
  { category: 'Venues', count: 45 },
  { category: 'Events', count: 128 },
  { category: 'Artists', count: 67 },
]

const viewsChartConfig = {
  views: {
    label: 'Page Views',
    color: 'hsl(160, 60%, 45%)',
  },
  events: {
    label: 'Events',
    color: 'hsl(40, 90%, 60%)',
  },
} satisfies ChartConfig

const usersChartConfig = {
  users: {
    label: 'Total Users',
    color: 'hsl(220, 70%, 50%)',
  },
  verified: {
    label: 'Verified',
    color: 'hsl(160, 60%, 45%)',
  },
} satisfies ChartConfig

const contentChartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(280, 60%, 50%)',
  },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalEvents: 0,
    totalArtists: 0,
    totalViews: 0,
    growthPercent: 0
  })

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 1280,
        totalVenues: 45,
        totalEvents: 128,
        totalArtists: 67,
        totalViews: 12800,
        growthPercent: 23
      })
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClassicLoader />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <H1 variant="display" className="mb-2">
          Analytics
        </H1>
        <p className="text-white/50 font-medium tracking-wider uppercase text-sm">
          Platform performance and insights
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Users</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalVenues}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Venues</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Events</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Music className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalArtists}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Artists</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-white/60" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Views</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">+{stats.growthPercent}%</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Chart */}
        <div className="bg-neutral-900/50 border border-white/10 p-6">
          <div className="mb-6">
            <H2 variant="display" className="text-lg mb-1">
              Page Views
            </H2>
            <p className="text-white/50 text-xs font-medium tracking-wider uppercase">
              Monthly page views trend
            </p>
          </div>
          <ChartContainer config={viewsChartConfig} className="h-[250px] w-full">
            <AreaChart data={viewsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(160, 60%, 45%)"
                fill="url(#fillViews)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* User Growth Chart */}
        <div className="bg-neutral-900/50 border border-white/10 p-6">
          <div className="mb-6">
            <H2 variant="display" className="text-lg mb-1">
              User Growth
            </H2>
            <p className="text-white/50 text-xs font-medium tracking-wider uppercase">
              New user registrations
            </p>
          </div>
          <ChartContainer config={usersChartConfig} className="h-[250px] w-full">
            <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(220, 70%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(220, 70%, 50%)', strokeWidth: 0, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="verified"
                stroke="hsl(160, 60%, 45%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(160, 60%, 45%)', strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Content by Category */}
        <div className="bg-neutral-900/50 border border-white/10 p-6 lg:col-span-2">
          <div className="mb-6">
            <H2 variant="display" className="text-lg mb-1">
              Content Distribution
            </H2>
            <p className="text-white/50 text-xs font-medium tracking-wider uppercase">
              Content by category
            </p>
          </div>
          <ChartContainer config={contentChartConfig} className="h-[200px] w-full">
            <BarChart data={contentByCategory} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                width={60}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="hsl(280, 60%, 50%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900/50 border border-white/10 p-6">
          <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4">
            Top Genres
          </h3>
          <div className="space-y-3">
            {['Techno', 'House', 'Drum & Bass', 'Ambient', 'Trance'].map((genre, i) => (
              <div key={genre} className="flex items-center justify-between">
                <span className="text-white text-sm">{genre}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-1.5 bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                  <span className="text-white/50 text-xs w-8 text-right">{100 - i * 15}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-6">
          <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4">
            Top Cities
          </h3>
          <div className="space-y-3">
            {['Berlin', 'Amsterdam', 'London', 'Barcelona', 'Paris'].map((city, i) => (
              <div key={city} className="flex items-center justify-between">
                <span className="text-white text-sm">{city}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-1.5 bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-blue-400"
                      style={{ width: `${95 - i * 12}%` }}
                    />
                  </div>
                  <span className="text-white/50 text-xs w-8 text-right">{95 - i * 12}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-6">
          <h3 className="text-sm font-medium tracking-wider uppercase text-white/60 mb-4">
            User Roles
          </h3>
          <div className="space-y-3">
            {[
              { role: 'Fans', percent: 65, color: 'bg-white/50' },
              { role: 'Artists', percent: 18, color: 'bg-purple-400' },
              { role: 'Promoters', percent: 10, color: 'bg-amber-400' },
              { role: 'Venues', percent: 5, color: 'bg-emerald-400' },
              { role: 'Admins', percent: 2, color: 'bg-red-400' },
            ].map(({ role, percent, color }) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-white text-sm">{role}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-1.5 bg-white/10 overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-white/50 text-xs w-8 text-right">{percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
