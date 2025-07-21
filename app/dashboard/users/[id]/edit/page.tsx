'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Users, 
  Save,
  ArrowLeft,
  AlertCircle,
  Shield,
  ShieldCheck,
  UserCheck,
  Mail,
  MapPin
} from 'lucide-react'

interface UserFormData {
  full_name: string
  display_name: string
  role: string
  is_verified: boolean
  city: string
  country: string
  bio: string
}

interface UserEditPageProps {
  params: Promise<{ id: string }>
}

const USER_ROLES = ['fan', 'artist', 'promoter', 'club_owner', 'admin']

export default function UserEditPage({ params }: UserEditPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserFormData | null>(null)
  const [originalData, setOriginalData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function getUserId() {
      const resolvedParams = await params
      setUserId(resolvedParams.id)
    }
    getUserId()
  }, [params])

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    if (!userId) return
    
    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOriginalData(data.data)
        setUserData({
          full_name: data.data.full_name || '',
          display_name: data.data.display_name || '',
          role: data.data.role || 'fan',
          is_verified: data.data.is_verified || false,
          city: data.data.city || '',
          country: data.data.country || '',
          bio: data.data.bio || ''
        })
      } else {
        console.error('Failed to fetch user:', response.status, response.statusText)
        setError('User not found or access denied')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setError('Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    if (!userData) return
    setUserData(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleSave = async () => {
    if (!userData || !userId) return
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        setSuccess('User updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const isCurrentUser = user?.id === userId

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (!userData || !originalData) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">User not found</h3>
        <p className="text-white/60 mb-6">The user you're looking for doesn't exist or you don't have permission to edit it.</p>
        <button
          onClick={() => router.push('/dashboard/users')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Back to Users
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/20 pb-6 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="p-2 border border-white/30 text-white hover:border-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
              Edit User
            </h1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              {originalData.display_name || originalData.full_name} • {originalData.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 border border-white/30 bg-black/50">
            <Mail className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm">{originalData.email}</span>
          </div>
          
          {originalData.is_verified && (
            <div className="flex items-center space-x-2 px-3 py-2 border border-green-400 text-green-400 bg-black/50">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wider uppercase">Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
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

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/50 p-4 mb-6 flex items-center space-x-3"
        >
          <Save className="w-5 h-5 text-green-400" />
          <span className="text-green-200">{success}</span>
        </motion.div>
      )}

      {/* Edit Form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={userData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={userData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Public display name"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                City
              </label>
              <input
                type="text"
                value={userData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Country
              </label>
              <input
                type="text"
                value={userData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Country"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Bio
              </label>
              <textarea
                value={userData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors resize-none"
                placeholder="User biography..."
              />
            </div>
          </div>
        </div>

        {/* Admin Controls - Only show if current user is admin and not editing themselves */}
        {user?.id !== userId && (
          <div className="bg-black/50 border border-orange-500/50 p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-orange-400" />
              Admin Controls
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                  User Role
                </label>
                <select
                  value={userData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                >
                  {USER_ROLES.map(role => (
                    <option key={role} value={role} className="bg-black">
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Verification Status
                </label>
                <div className="flex items-center space-x-4 pt-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userData.is_verified}
                      onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                      className="w-4 h-4 text-green-400 bg-black/50 border border-white/30 focus:ring-green-400 focus:ring-2"
                    />
                    <span className="text-white/80 text-sm font-bold tracking-wider uppercase">
                      Verified User
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="px-6 py-3 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
          >
            Cancel
          </button>
          
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}