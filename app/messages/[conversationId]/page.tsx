'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { MessagingProvider, useMessaging } from '@/contexts/MessagingContext'
import { ConversationList, MessageThread, NewConversationModal } from '@/components/messaging'
import { useState } from 'react'

function ConversationContent() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.conversationId as string
  const { user, loading: authLoading } = useAuth()
  const { selectConversation, currentConversation, conversations } = useMessaging()
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
      router.push(`/auth/signin?redirect=/messages/${conversationId}`)
    }
  }, [user, authLoading, router, conversationId])

  // Select the conversation when conversations load
  useEffect(() => {
    if (conversations.length > 0 && conversationId && !currentConversation) {
      selectConversation(conversationId)
    }
  }, [conversations, conversationId, currentConversation, selectConversation])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleBack = () => {
    router.push('/messages')
  }

  const handleConversationCreated = (newConversationId: string) => {
    router.push(`/messages/${newConversationId}`)
  }

  // Mobile view - show just the thread
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <MessageThread onBack={handleBack} className="h-full" />
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
    <div className="h-[calc(100vh-4rem)] flex">
      <ConversationList
        onNewConversation={() => setIsNewConversationOpen(true)}
        className="w-80 border-r flex-shrink-0"
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

export default function ConversationPage() {
  return (
    <MessagingProvider>
      <ConversationContent />
    </MessagingProvider>
  )
}
