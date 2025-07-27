'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import ClassicLoader from '@/components/ui/loader'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Eye,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Trash2,
  Save,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

interface UserSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  profile_visibility: 'public' | 'private' | 'friends'
  location_sharing: boolean
  activity_visibility: boolean
  review_notifications: boolean
  event_recommendations: boolean
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    profile_visibility: 'public',
    location_sharing: true,
    activity_visibility: true,
    review_notifications: true,
    event_recommendations: true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('notifications')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      // Load user settings from profile or use defaults
      // In a real implementation, you'd fetch from your API
      console.log('Loading user settings...')
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSettingChange = (setting: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Save settings to your API
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error: any) {
      console.error('Save error:', error)
      setError(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Lock }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClassicLoader />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/20 pb-6 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 border border-white/30 text-white hover:border-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
              Settings
            </h1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              Manage your account preferences
            </p>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-bold tracking-wider uppercase transition-colors border ${
                  activeTab === id
                    ? 'bg-white text-black border-white'
                    : 'bg-black/50 text-white/80 border-white/30 hover:border-white/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
                  <Bell className="w-6 h-6 mr-3" />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">Email Notifications</h3>
                      <p className="text-white/60 text-sm">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.email_notifications}
                        onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">Push Notifications</h3>
                      <p className="text-white/60 text-sm">Receive push notifications on your devices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.push_notifications}
                        onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">Review Notifications</h3>
                      <p className="text-white/60 text-sm">Get notified when someone reviews your content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.review_notifications}
                        onChange={(e) => handleSettingChange('review_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">Event Recommendations</h3>
                      <p className="text-white/60 text-sm">Receive personalized event recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.event_recommendations}
                        onChange={(e) => handleSettingChange('event_recommendations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">Marketing Emails</h3>
                      <p className="text-white/60 text-sm">Receive marketing and promotional emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketing_emails}
                        onChange={(e) => handleSettingChange('marketing_emails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3" />
                  Privacy Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white mb-2">Profile Visibility</h3>
                    <p className="text-white/60 text-sm mb-4">Choose who can see your profile</p>
                    <div className="space-y-2">
                      {['public', 'friends', 'private'].map((visibility) => (
                        <label key={visibility} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="profile_visibility"
                            value={visibility}
                            checked={settings.profile_visibility === visibility}
                            onChange={(e) => handleSettingChange('profile_visibility', e.target.value)}
                            className="w-4 h-4 accent-white"
                          />
                          <span className="text-white capitalize">{visibility}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">Location Sharing</h3>
                      <p className="text-white/60 text-sm">Share your location in posts and reviews</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.location_sharing}
                        onChange={(e) => handleSettingChange('location_sharing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">Activity Visibility</h3>
                      <p className="text-white/60 text-sm">Show your activity to other users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.activity_visibility}
                        onChange={(e) => handleSettingChange('activity_visibility', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3" />
                  Account Information
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full bg-black/30 border border-white/20 text-white/60 p-3 cursor-not-allowed"
                      />
                      <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user.role || ''}
                        disabled
                        className="w-full bg-black/30 border border-white/20 text-white/60 p-3 cursor-not-allowed capitalize"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      disabled
                      className="w-full bg-black/30 border border-white/20 text-white/60 p-3 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push('/profile/edit')}
                        className="flex items-center space-x-2 px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
                      >
                        <User className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>

                      {/* Role-specific quick actions */}
                      {user.role === 'artist' && (
                        <button
                          onClick={() => router.push('/artist-profile')}
                          className="flex items-center space-x-2 px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
                        >
                          <User className="w-4 h-4" />
                          <span>Manage Artist Profile</span>
                        </button>
                      )}

                      {user.role === 'club_owner' && (
                        <button
                          onClick={() => router.push('/my-venue')}
                          className="flex items-center space-x-2 px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Manage My Venue</span>
                        </button>
                      )}

                      {user.role === 'promoter' && (
                        <button
                          onClick={() => router.push('/events/manage')}
                          className="flex items-center space-x-2 px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
                        >
                          <Bell className="w-4 h-4" />
                          <span>Manage Events</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-3" />
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4">
                    <p className="text-yellow-200 text-sm">
                      Password and security settings are managed through your authentication provider.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-white mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <button className="flex items-center space-x-2 px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase">
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>

                      <button className="flex items-center space-x-2 px-4 py-2 border border-red-500/50 text-red-400 hover:border-red-500 hover:text-red-300 transition-colors font-bold tracking-wider uppercase">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 border-t border-white/20">
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}