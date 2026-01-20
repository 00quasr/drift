'use client'

import { useMessaging } from '@/contexts/MessagingContext'
import { useAuth } from '@/contexts/AuthContext'
import { ConversationItem } from './ConversationItem'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  onNewConversation?: () => void
  className?: string
}

export function ConversationList({ onNewConversation, className }: ConversationListProps) {
  const { user } = useAuth()
  const {
    conversations,
    currentConversation,
    selectConversation,
    loading,
    error,
  } = useMessaging()

  if (!user) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-black', className)}>
        <p className="text-sm text-neutral-400">Please sign in to view messages</p>
      </div>
    )
  }

  if (loading && conversations.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-black', className)}>
        <p className="text-sm text-neutral-400">Loading conversations...</p>
      </div>
    )
  }

  // Only show error if we failed to load conversations (not for message sending errors)
  if (error && conversations.length === 0 && !loading) {
    return (
      <div className={cn('flex items-center justify-center h-full p-4 bg-black', className)}>
        <p className="text-sm text-red-400 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-black', className)}>
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-white tracking-wide uppercase">Messages</h2>
        {onNewConversation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewConversation}
            className="text-sm text-neutral-300 hover:text-white hover:bg-neutral-800"
          >
            New
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
            <p className="text-sm text-neutral-400 text-center">
              No conversations yet
            </p>
            {onNewConversation && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNewConversation}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={user.id}
                isSelected={currentConversation?.id === conversation.id}
                onClick={() => selectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
