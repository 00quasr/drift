'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  display_name: string | null
}

interface Participant {
  user_id: string
  profile?: Profile
}

interface Message {
  content: string
  created_at: string
  sender?: Profile | null
}

interface Conversation {
  id: string
  name: string | null
  is_group: boolean
  updated_at: string
  participants?: Participant[]
  last_message?: Message
  unread_count?: number
}

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string
  isSelected: boolean
  onClick: () => void
}

export function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onClick,
}: ConversationItemProps) {
  // Get display name - for 1:1, show the other participant's name
  const getDisplayName = () => {
    if (conversation.is_group && conversation.name) {
      return conversation.name
    }

    const otherParticipant = conversation.participants?.find(
      (p) => p.user_id !== currentUserId
    )

    if (otherParticipant?.profile) {
      return (
        otherParticipant.profile.display_name ||
        otherParticipant.profile.full_name ||
        'Unknown User'
      )
    }

    return 'Unknown User'
  }

  // Get avatar - for 1:1, show the other participant's avatar
  const getAvatarUrl = () => {
    if (conversation.is_group) {
      return null // Group chats don't have a single avatar
    }

    const otherParticipant = conversation.participants?.find(
      (p) => p.user_id !== currentUserId
    )

    return otherParticipant?.profile?.avatar_url || null
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = getDisplayName()
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format last message preview
  const getLastMessagePreview = () => {
    if (!conversation.last_message) {
      return 'No messages yet'
    }

    const content = conversation.last_message.content
    const maxLength = 50

    if (content.length > maxLength) {
      return content.substring(0, maxLength) + '...'
    }

    return content
  }

  // Format timestamp
  const getTimestamp = () => {
    const date = conversation.last_message?.created_at || conversation.updated_at
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const displayName = getDisplayName()
  const avatarUrl = getAvatarUrl()
  const initials = getInitials()
  const lastMessagePreview = getLastMessagePreview()
  const timestamp = getTimestamp()
  const unreadCount = conversation.unread_count || 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-neutral-900',
        isSelected && 'bg-neutral-800'
      )}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
        <AvatarFallback className="text-xs bg-neutral-700 text-white">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            'text-sm font-medium truncate text-white',
            unreadCount > 0 && 'font-semibold'
          )}>
            {displayName}
          </span>
          <span className="text-xs text-neutral-500 flex-shrink-0">
            {timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            'text-sm truncate',
            unreadCount > 0
              ? 'text-neutral-200 font-medium'
              : 'text-neutral-500'
          )}>
            {lastMessagePreview}
          </p>

          {unreadCount > 0 && (
            <span className="flex-shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-white text-black text-xs font-medium flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
