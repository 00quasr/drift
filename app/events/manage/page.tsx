'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { H1, H3 } from '@/components/ui/typography'
import {
  Calendar,
  Plus,
  Edit3,
  Eye,
  Trash2,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Archive
} from 'lucide-react'

interface Event {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  venue: {
    id: string
    name: string
    city: string
  }
  status: string
  created_at: string
  ticket_info?: {
    price_regular?: number
  }
}

const STATUS_COLORS = {
  draft: 'text-yellow-400 border-yellow-400',
  published: 'text-green-400 border-green-400',
  archived: 'text-red-400 border-red-400'
}

export default function ManageEventsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState('')

  // Redirect if not a promoter
  useEffect(() => {
    if (!loading && user && user.role !== 'promoter') {
      router.push('/')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'promoter') {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/events?cms=true', {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Filter to only show user's events
        const userEvents = data.data?.filter((event: any) => event.created_by === user?.id) || []
        setEvents(userEvents)
      } else {
        setError('Failed to load events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleEventStatus = async (eventId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'archived' : 'published'
    const action = newStatus === 'archived' ? 'take down' : 'republish'
    
    if (!confirm(`Are you sure you want to ${action} this event? ${newStatus === 'archived' ? 'It will be hidden from the public but data will be preserved.' : 'It will be visible to the public again.'}`)) {
      return
    }

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setEvents(events.map(event => 
          event.id === eventId 
            ? { ...event, status: newStatus }
            : event
        ))
      } else {
        setError(`Failed to ${action} event`)
      }
    } catch (error) {
      console.error(`Error ${action}ing event:`, error)
      setError(`Failed to ${action} event`)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId))
      } else {
        setError('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      setError('Failed to delete event')
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading || isLoading) {
    return null
  }

  if (!user || user.role !== 'promoter') {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <H3 className="mb-2">Access Denied</H3>
        <p className="text-white/60 mb-6">Only promoter accounts can access this page.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/20 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <H1 variant="display" className="mb-2">
              My Events
            </H1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              Manage your promoted events
            </p>
          </div>
          
          <Link href="/events/create">
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </motion.button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 flex items-center space-x-3">
          <span className="text-red-200">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-black/50 border border-white/20 p-4 mb-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/30 text-white placeholder-white/60 focus:border-white/60 outline-none transition-colors"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-black/50 border border-white/30 text-white focus:border-white/60 outline-none transition-colors"
            >
              <option value="all" className="bg-black">All Status</option>
              <option value="draft" className="bg-black">Draft</option>
              <option value="published" className="bg-black">Published</option>
              <option value="archived" className="bg-black">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-white/30 mb-4" />
          <H3 className="mb-2">
            {events.length === 0 ? 'No Events Created' : 'No Events Found'}
          </H3>
          <p className="text-white/60 mb-6">
            {events.length === 0 
              ? 'Create your first event to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
          {events.length === 0 && (
            <Link href="/events/create">
              <button className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase">
                Create First Event
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm hover:border-white/40 transition-colors cursor-pointer"
              onClick={() => {
                if (event.status === 'published') {
                  router.push(`/event/${event.id}`)
                }
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <H3 variant="display">
                      {event.title}
                    </H3>
                    <div className={`px-2 py-1 text-xs font-bold tracking-wider uppercase border bg-black/50 ${
                      STATUS_COLORS[event.status as keyof typeof STATUS_COLORS]
                    }`}>
                      {event.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.start_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(event.start_date).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue.name}, {event.venue.city}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  {event.status === 'published' && (
                    <Link href={`/event/${event.id}`}>
                      <motion.button
                        className="p-2 border border-white/30 text-white hover:border-white/60 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="View Event"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  )}
                  
                  <Link href={`/events/edit/${event.id}`}>
                    <motion.button
                      className="p-2 border border-white/30 text-white hover:border-white/60 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Edit Event"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                  </Link>

                  {event.status === 'published' ? (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleEventStatus(event.id, event.status)
                      }}
                      className="p-2 border border-orange-500/50 text-orange-400 hover:border-orange-500 hover:text-orange-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Take Down Event"
                    >
                      <Archive className="w-4 h-4" />
                    </motion.button>
                  ) : event.status === 'archived' ? (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleEventStatus(event.id, event.status)
                      }}
                      className="p-2 border border-green-500/50 text-green-400 hover:border-green-500 hover:text-green-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Republish Event"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  ) : null}
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteEvent(event.id)
                    }}
                    className="p-2 border border-red-500/50 text-red-400 hover:border-red-500 hover:text-red-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Permanently Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      {events.length > 0 && (
        <div className="mt-8 bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H3 variant="display" className="mb-4">
            Event Statistics
          </H3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-white/60 text-sm uppercase tracking-wider">Total Events</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {events.filter(e => e.status === 'published').length}
              </div>
              <div className="text-white/60 text-sm uppercase tracking-wider">Published</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {events.filter(e => e.status === 'draft').length}
              </div>
              <div className="text-white/60 text-sm uppercase tracking-wider">Drafts</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {events.filter(e => new Date(e.start_date) > new Date()).length}
              </div>
              <div className="text-white/60 text-sm uppercase tracking-wider">Upcoming</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}