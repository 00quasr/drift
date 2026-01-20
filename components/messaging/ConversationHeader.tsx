'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  display_name: string | null
}

interface Participant {
  user_id: string
  profile?: Profile
  left_at: string | null
}

interface Conversation {
  id: string
  name: string | null
  is_group: boolean
  participants?: Participant[]
}

interface ConversationHeaderProps {
  conversation: Conversation
  currentUserId: string
  onBack?: () => void
  className?: string
}

export function ConversationHeader({
  conversation,
  currentUserId,
  onBack,
  className,
}: ConversationHeaderProps) {
  // Get active participants (not left)
  const activeParticipants =
    conversation.participants?.filter((p) => !p.left_at) || []

  // Get display name
  const getDisplayName = () => {
    if (conversation.is_group && conversation.name) {
      return conversation.name
    }

    const otherParticipant = activeParticipants.find(
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

  // Get avatar URL for 1:1 chats
  const getAvatarUrl = () => {
    if (conversation.is_group) return null

    const otherParticipant = activeParticipants.find(
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

  // Get participant count for groups
  const getParticipantCount = () => {
    if (!conversation.is_group) return null
    const count = activeParticipants.length
    return `${count} member${count !== 1 ? 's' : ''}`
  }

  const displayName = getDisplayName()
  const avatarUrl = getAvatarUrl()
  const initials = getInitials()
  const participantCount = getParticipantCount()

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-black', className)}>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mr-1 -ml-2 h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="sr-only">Back</span>
        </Button>
      )}

      <Avatar className="h-10 w-10">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
        <AvatarFallback className="text-sm bg-neutral-700 text-white">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate text-white">{displayName}</h3>
        {participantCount && (
          <p className="text-xs text-neutral-500">{participantCount}</p>
        )}
      </div>
    </div>
  )
}
