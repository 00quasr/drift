'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useMessaging } from '@/contexts/MessagingContext'
import { useAuth } from '@/contexts/AuthContext'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { ConversationHeader } from './ConversationHeader'
import { cn } from '@/lib/utils'
import { format, isSameDay, isToday, isYesterday } from 'date-fns'

interface MessageThreadProps {
  className?: string
  onBack?: () => void
}

export function MessageThread({ className, onBack }: MessageThreadProps) {
  const { user } = useAuth()
  const { currentConversation, messages, sendMessage, loading } = useMessaging()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change (only within the container)
  useEffect(() => {
    if (containerRef.current) {
      // Use scrollTop instead of scrollIntoView to avoid page jumping
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof messages }[] = []
    let currentDate: string | null = null
    let currentGroup: typeof messages = []

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at)
      let dateLabel: string

      if (isToday(messageDate)) {
        dateLabel = 'Today'
      } else if (isYesterday(messageDate)) {
        dateLabel = 'Yesterday'
      } else {
        dateLabel = format(messageDate, 'MMMM d, yyyy')
      }

      if (dateLabel !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate!, messages: currentGroup })
        }
        currentDate = dateLabel
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate!, messages: currentGroup })
    }

    return groups
  }, [messages])

  if (!currentConversation) {
    return (
      <div className={cn(
        'flex items-center justify-center h-full bg-neutral-950',
        className
      )}>
        <p className="text-sm text-neutral-500">
          Select a conversation to start messaging
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-neutral-950', className)}>
      <ConversationHeader
        conversation={currentConversation}
        currentUserId={user?.id || ''}
        onBack={onBack}
      />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-4"
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-neutral-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-neutral-500">
              No messages yet. Send a message to start the conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                    {group.date}
                  </span>
                </div>

                <div className="space-y-1">
                  {group.messages.map((message, index) => {
                    const isOwnMessage = message.sender_id === user?.id
                    const prevMessage = index > 0 ? group.messages[index - 1] : null
                    const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null

                    // Show avatar only for first message in a sequence from same sender
                    const showAvatar =
                      !prevMessage || prevMessage.sender_id !== message.sender_id

                    // Show timestamp for last message in a sequence or if > 5 min gap
                    const showTimestamp =
                      !nextMessage ||
                      nextMessage.sender_id !== message.sender_id ||
                      (nextMessage &&
                        new Date(nextMessage.created_at).getTime() -
                          new Date(message.created_at).getTime() >
                          5 * 60 * 1000)

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        showAvatar={showAvatar}
                        showTimestamp={showTimestamp}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput onSendMessage={sendMessage} />
    </div>
  )
}
