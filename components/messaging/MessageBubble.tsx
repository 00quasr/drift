'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  display_name: string | null
}

interface Message {
  id: string
  content: string
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  sender_id: string | null
  sender?: Profile | null
}

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) {
  // Handle deleted messages
  if (message.is_deleted) {
    return (
      <div className={cn(
        'flex gap-2 px-4',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}>
        {showAvatar && <div className="w-8" />}
        <div className="max-w-[70%]">
          <p className="text-sm text-neutral-500 italic py-2">
            This message was deleted
          </p>
        </div>
      </div>
    )
  }

  const senderName = message.sender?.display_name || message.sender?.full_name || 'Unknown'
  const initials = senderName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formattedTime = (() => {
    try {
      return format(new Date(message.created_at), 'HH:mm')
    } catch {
      return ''
    }
  })()

  return (
    <div className={cn(
      'flex gap-2 px-4',
      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
    )}>
      {showAvatar ? (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {message.sender?.avatar_url && (
            <AvatarImage src={message.sender.avatar_url} alt={senderName} />
          )}
          <AvatarFallback className="text-xs bg-neutral-700 text-white">{initials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8" />
      )}

      <div className={cn(
        'max-w-[70%] flex flex-col',
        isOwnMessage ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'px-3 py-2 rounded-2xl',
          isOwnMessage
            ? 'bg-white text-black rounded-br-sm'
            : 'bg-neutral-800 text-white rounded-bl-sm'
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {(showTimestamp || message.is_edited) && (
          <div className="flex items-center gap-1.5 mt-1 px-1">
            {showTimestamp && (
              <span className="text-xs text-neutral-500">
                {formattedTime}
              </span>
            )}
            {message.is_edited && (
              <span className="text-xs text-neutral-500">
                (edited)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
