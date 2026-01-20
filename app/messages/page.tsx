'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { MessagingProvider, useMessaging } from '@/contexts/MessagingContext'
import { ConversationList, MessageThread, NewConversationModal } from '@/components/messaging'
import { cn } from '@/lib/utils'

function MessagesContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { currentConversation, selectConversation } = useMessaging()
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/messages')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-black">
        <p className="text-sm text-neutral-400">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleBack = () => {
    selectConversation(null)
  }

  const handleConversationCreated = (conversationId: string) => {
    selectConversation(conversationId)
  }

  // Mobile view - show list or thread based on selection
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-black">
        {currentConversation ? (
          <MessageThread onBack={handleBack} className="h-full" />
        ) : (
          <ConversationList
            onNewConversation={() => setIsNewConversationOpen(true)}
            className="h-full"
          />
        )}
        <NewConversationModal
          isOpen={isNewConversationOpen}
          onClose={() => setIsNewConversationOpen(false)}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    )
  }

  // Desktop view - side by side
  return (
    <div className="h-[calc(100vh-4rem)] flex bg-black">
      <ConversationList
        onNewConversation={() => setIsNewConversationOpen(true)}
        className="w-80 border-r border-neutral-800 flex-shrink-0"
      />
      <MessageThread className="flex-1" />
      <NewConversationModal
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}

export default function MessagesPage() {
  return (
    <MessagingProvider>
      <MessagesContent />
    </MessagingProvider>
  )
}
