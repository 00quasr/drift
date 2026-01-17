"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { 
  Calendar, 
  Heart, 
  MessageSquare, 
  User, 
  MapPin,
  Clock,
  Activity
} from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  activity_type: string
  target_type: string | null
  target_id: string | null
  metadata: any
  created_at: string
  target_name?: string
  target_slug?: string
}

interface ProfileActivityProps {
  profileId: string
  isOwnProfile: boolean
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({
  profileId,
  isOwnProfile
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true)

        // Fetch user activity
        const { data: activityData, error } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // Enrich activity with target details
        const enrichedActivities = await Promise.all(
          activityData.map(async (activity) => {
            let targetName = ''
            let targetSlug = ''

            if (activity.target_type && activity.target_id) {
              try {
                let query = supabase
                  .from(activity.target_type + 's') // venues, events, artists
                  .select('name, slug')
                  .eq('id', activity.target_id)
                  .single()

                const { data: targetData } = await query
                if (targetData) {
                  targetName = targetData.name
                  targetSlug = targetData.slug
                }
              } catch (e) {
                // If target doesn't exist anymore, keep original activity
              }
            }

            return {
              ...activity,
              target_name: targetName,
              target_slug: targetSlug
            }
          })
        )

        setActivities(enrichedActivities)
      } catch (error) {
        console.error('Error fetching activity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [profileId])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review_posted': return MessageSquare
      case 'favorite_added': return Heart
      case 'profile_view': return User
      case 'venue_visit': return MapPin
      case 'event_attend': return Calendar
      default: return Activity
    }
  }


  const getActivityText = (activity: ActivityItem) => {
    const target = activity.target_name || 'Unknown'
    
    switch (activity.activity_type) {
      case 'review_posted':
        return `Posted a review for ${target}`
      case 'favorite_added':
        return `Added ${target} to favorites`
      case 'profile_view':
        return `Viewed a profile`
      case 'venue_visit':
        return `Visited ${target}`
      case 'event_attend':
        return `Attended ${target}`
      default:
        return `${activity.activity_type.replace('_', ' ')} ${target}`
    }
  }

  const getActivityLink = (activity: ActivityItem) => {
    if (!activity.target_type || !activity.target_slug) return null
    
    switch (activity.target_type) {
      case 'venue':
        return `/venues/${activity.target_slug}`
      case 'event':
        return `/events/${activity.target_slug}`
      case 'artist':
        return `/artists/${activity.target_slug}`
      default:
        return null
    }
  }

  if (isLoading) {
    return null
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-white/5 border border-white/20 p-12">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 text-white/40 mx-auto" />
          <h3 className="text-xl font-bold tracking-wider uppercase text-white">
            NO ACTIVITY YET
          </h3>
          <p className="text-white/60 font-medium max-w-md mx-auto">
            {isOwnProfile 
              ? "Start exploring venues, events, and artists to build your activity feed!"
              : "This user hasn't been active yet. Check back later!"}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wider uppercase text-white">
          RECENT ACTIVITY
        </h2>
        <div className="flex items-center gap-2 text-white/60">
          <Clock className="w-4 h-4" />
          <span className="font-medium tracking-wider uppercase text-sm">
            LAST {activities.length} ACTIONS
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.activity_type)
          const link = getActivityLink(activity)
          const activityText = getActivityText(activity)

          return (
            <Card key={activity.id} className="bg-white/5 border border-white/20 p-4 hover:border-white/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-white/20 bg-white/5 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white/60" />
                </div>
                
                <div className="flex-1">
                  {link ? (
                    <Link 
                      href={link}
                      className="font-bold tracking-wider uppercase text-white hover:text-white/80 transition-colors"
                    >
                      {activityText}
                    </Link>
                  ) : (
                    <span className="font-bold tracking-wider uppercase text-white">
                      {activityText}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-white/60 text-sm font-medium">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="text-white/40">
                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {activities.length >= 20 && (
        <Card className="bg-white/5 border border-white/20 p-4">
          <div className="text-center">
            <button className="text-white hover:text-white/80 font-bold tracking-wider uppercase text-sm transition-colors">
              LOAD MORE ACTIVITY
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}