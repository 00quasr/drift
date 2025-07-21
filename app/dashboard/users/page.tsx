'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
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

      // Get auth session for API call
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
        
        // Calculate stats
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
        // Remove user from local state
        setUsers(prev => prev.filter(u => u.id !== userId))
        
        // Update stats
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
      case 'admin': return 'text-red-400 border-red-400'
      case 'promoter': return 'text-purple-400 border-purple-400'
      case 'club_owner': return 'text-blue-400 border-blue-400'
      case 'artist': return 'text-green-400 border-green-400'
      default: return 'text-white/60 border-white/60'
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
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-white/20 pb-6 mb-8">
        <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
          User Management
        </h1>
        <p className="text-white/60 font-bold tracking-wider uppercase">
          Manage platform users and permissions
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 p-4 mb-6 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-200">{error}</span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-white/60" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/60 text-sm font-bold tracking-wider uppercase">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.verified}</p>
              <p className="text-white/60 text-sm font-bold tracking-wider uppercase">Verified</p>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.admins}</p>
              <p className="text-white/60 text-sm font-bold tracking-wider uppercase">Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.artists}</p>
              <p className="text-white/60 text-sm font-bold tracking-wider uppercase">Artists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-black/50 border border-white/30 text-white pl-10 pr-4 py-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
              Filter by Role
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white pl-10 pr-4 py-3 focus:border-white/60 outline-none transition-colors appearance-none"
              >
                {USER_ROLES.map(role => (
                  <option key={role} value={role} className="bg-black">
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
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-white/30 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
          <p className="text-white/60">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm hover:border-white/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-white/60" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {user.display_name || user.full_name}
                      </h3>
                      <div className={`px-2 py-1 text-xs font-bold tracking-wider uppercase border ${getRoleColor(user.role)} bg-black/50`}>
                        {user.role}
                      </div>
                      {user.is_verified && (
                        <ShieldCheck className="w-4 h-4 text-green-400" title="Verified" />
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-white/60">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      
                      {(user.city || user.country) && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/profile/${user.id}`)}
                    className="flex items-center space-x-2 px-3 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
                    className="flex items-center space-x-2 px-3 py-2 border border-blue-400 text-blue-400 hover:bg-blue-400/10 transition-colors font-bold tracking-wider uppercase text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  {user.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.display_name || user.full_name)}
                      className="flex items-center space-x-2 px-3 py-2 border border-red-400 text-red-400 hover:bg-red-400/10 transition-colors font-bold tracking-wider uppercase text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}