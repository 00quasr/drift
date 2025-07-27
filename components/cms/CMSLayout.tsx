'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Music, 
  Users,
  Settings,
  BarChart3,
  Shield,
  ChevronDown,
  Menu,
  X,
  UserCheck
} from 'lucide-react'

interface CMSLayoutProps {
  children: React.ReactNode
}

export default function CMSLayout({ children }: CMSLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { 
        href: '/dashboard', 
        label: 'Overview', 
        icon: LayoutDashboard,
        roles: ['artist', 'promoter', 'club_owner', 'admin']
      }
    ]

    const contentItems = [
      { 
        href: '/dashboard/venues', 
        label: 'Venues', 
        icon: MapPin,
        roles: ['club_owner', 'admin']
      },
      { 
        href: '/dashboard/events', 
        label: 'Events', 
        icon: Calendar,
        roles: ['promoter', 'club_owner', 'admin']
      },
      { 
        href: '/dashboard/artists', 
        label: 'Artists', 
        icon: Music,
        roles: ['artist', 'admin']
      }
    ]

    const adminItems = [
      { 
        href: '/dashboard/users', 
        label: 'User Management', 
        icon: Users,
        roles: ['admin']
      },
      { 
        href: '/dashboard/verification', 
        label: 'Verification Requests', 
        icon: UserCheck,
        roles: ['admin']
      },
      { 
        href: '/dashboard/admin/moderate', 
        label: 'Content Moderation', 
        icon: Shield,
        roles: ['admin']
      },
      { 
        href: '/dashboard/admin/analytics', 
        label: 'Analytics', 
        icon: BarChart3,
        roles: ['admin']
      }
    ]

    const settingsItems = [
      { 
        href: '/dashboard/settings', 
        label: 'Settings', 
        icon: Settings,
        roles: ['artist', 'promoter', 'club_owner', 'admin']
      }
    ]

    return [
      ...baseItems,
      ...contentItems,
      ...adminItems,
      ...settingsItems
    ].filter(item => item.roles.includes(user?.role || ''))
  }

  const navigationItems = getNavigationItems()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile header */}
      <div className="lg:hidden bg-black/95 backdrop-blur-md border-b border-white/20 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wider uppercase">CMS DASHBOARD</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white hover:text-white/80 transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/95 backdrop-blur-md border-r border-white/20
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-200 ease-in-out
        `}>
          <div className="p-6 border-b border-white/20">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold tracking-wider uppercase hover:text-white/80 transition-colors">
                CMS
              </h1>
            </Link>
            <p className="text-white/60 text-sm mt-1 uppercase tracking-wider">
              {user?.role} Dashboard
            </p>
          </div>

          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`
                      flex items-center space-x-3 px-4 py-3 font-bold tracking-wider uppercase text-sm
                      border border-white/20 bg-black/50 backdrop-blur-sm transition-all duration-200
                      ${active 
                        ? 'border-white bg-white/10 text-white' 
                        : 'hover:border-white/60 hover:bg-white/5 text-white/80 hover:text-white'
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User info at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {user?.display_name?.[0] || user?.email[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {user?.display_name || user?.email}
                </p>
                <p className="text-xs text-white/60 uppercase tracking-wider">
                  {user?.role}
                  {user?.is_verified && ' • VERIFIED'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="min-h-screen p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}