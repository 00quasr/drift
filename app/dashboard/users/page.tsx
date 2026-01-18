'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ClassicLoader from '@/components/ui/loader'
import { H1 } from "@/components/ui/typography"
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
  Calendar,
  Mail,
  MapPin,
  Eye,
  AlertCircle
} from 'lucide-react'

interface User {
  id: string
  full_name: string
  display_name: string
  email: string
  role: string
  is_verified: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
  city?: string
  country?: string
}

const USER_ROLES = ['all', 'fan', 'artist', 'promoter', 'club_owner', 'admin']

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    admins: 0,
    artists: 0
  })

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const params = new URLSearchParams()
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (searchTerm) params.append('search', searchTerm)
      params.append('limit', '100')

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])

        const allUsers = data.data || []
        setStats({
          total: allUsers.length,
          verified: allUsers.filter((u: User) => u.is_verified).length,
          admins: allUsers.filter((u: User) => u.role === 'admin').length,
          artists: allUsers.filter((u: User) => u.role === 'artist').length
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))

        const deletedUser = users.find(u => u.id === userId)
        if (deletedUser) {
          setStats(prev => ({
            total: prev.total - 1,
            verified: prev.verified - (deletedUser.is_verified ? 1 : 0),
            admins: prev.admins - (deletedUser.role === 'admin' ? 1 : 0),
            artists: prev.artists - (deletedUser.role === 'artist' ? 1 : 0)
          }))
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      setError('Failed to delete user')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 border-red-400/50 bg-red-400/10'
      case 'promoter': return 'text-purple-400 border-purple-400/50 bg-purple-400/10'
      case 'club_owner': return 'text-blue-400 border-blue-400/50 bg-blue-400/10'
      case 'artist': return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10'
      default: return 'text-white/50 border-white/20 bg-white/5'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
          User Management
        </H1>
        <p className="text-white/50 font-medium tracking-wider uppercase text-sm">
          Manage platform users and permissions
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-white/40" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.verified}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Verified</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.artists}</p>
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase">Artists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900/50 border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/60 font-medium tracking-wider uppercase text-xs mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-neutral-900/50 border border-white/10 text-white pl-10 pr-4 py-3 focus:border-white/20 outline-none transition-colors placeholder-white/40 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 font-medium tracking-wider uppercase text-xs mb-2">
              Filter by Role
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-neutral-900/50 border border-white/10 text-white pl-10 pr-4 py-3 focus:border-white/20 outline-none transition-colors appearance-none text-sm"
              >
                {USER_ROLES.map(role => (
                  <option key={role} value={role} className="bg-neutral-900">
                    {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2 tracking-wider uppercase">No users found</h3>
          <p className="text-white/50 text-sm">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((listUser) => (
            <div
              key={listUser.id}
              className="bg-neutral-900/50 border border-white/10 p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                    {listUser.avatar_url ? (
                      <img
                        src={listUser.avatar_url}
                        alt={listUser.full_name}
                        className="w-10 h-10 object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-white/40" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-bold text-white tracking-wider uppercase">
                        {listUser.display_name || listUser.full_name}
                      </h3>
                      <div className={`px-2 py-0.5 text-xs font-medium tracking-wider uppercase border ${getRoleColor(listUser.role)}`}>
                        {listUser.role}
                      </div>
                      {listUser.is_verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified" />
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-white/50">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-white/30" />
                        <span>{listUser.email}</span>
                      </div>

                      {(listUser.city || listUser.country) && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-white/30" />
                          <span>{[listUser.city, listUser.country].filter(Boolean).join(', ')}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-white/30" />
                        <span>Joined {formatDate(listUser.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/profile/${listUser.id}`)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors font-medium tracking-wider uppercase text-xs"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => router.push(`/dashboard/users/${listUser.id}/edit`)}
                    className="flex items-center space-x-2 px-3 py-2 border border-blue-400/50 text-blue-400 hover:bg-blue-400/10 transition-colors font-medium tracking-wider uppercase text-xs"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  {listUser.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteUser(listUser.id, listUser.display_name || listUser.full_name)}
                      className="flex items-center space-x-2 px-3 py-2 border border-red-400/50 text-red-400 hover:bg-red-400/10 transition-colors font-medium tracking-wider uppercase text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
