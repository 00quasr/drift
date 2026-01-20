'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { RealtimeChannel } from '@supabase/supabase-js'

// Notification sound using Audio element
const NOTIFICATION_SOUND_URL = 'https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/me-too-603.mp3'
let audioUnlocked = false

// Initialize/unlock audio on first user interaction (required by browsers)
const initAudio = () => {
  if (audioUnlocked) return

  try {
    // Create and play a silent sound to unlock audio
    const audio = new Audio(NOTIFICATION_SOUND_URL)
    audio.volume = 0
    audio.play().then(() => {
      audio.pause()
      audioUnlocked = true
    }).catch(() => {
      // Audio unlock failed - likely no user interaction yet
    })
  } catch {
    // Audio initialization failed
  }
}

// Play the notification sound
const playNotificationSound = () => {
  try {
    // Create a new Audio instance each time for reliability
    const audio = new Audio(NOTIFICATION_SOUND_URL)
    audio.volume = 0.5
    audio.play().catch(() => {
      // Audio playback failed
    })
  } catch {
    // Audio creation failed
  }
}

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  display_name: string | null
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  sender?: Profile | null
}

interface Participant {
  id: string
  conversation_id: string
  user_id: string
  role: string
  joined_at: string
  left_at: string | null
  is_muted: boolean
  last_read_at: string
  profile?: Profile
}

interface Conversation {
  id: string
  name: string | null
  is_group: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  participants?: Participant[]
  last_message?: Message
  unread_count?: number
}

// Define callback type for real-time message handling
type MessageCallback = (message: Message) => void

interface MessagingContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  totalUnreadCount: number
  loading: boolean
  error: string | null

  // Actions
  fetchConversations: () => Promise<void>
  selectConversation: (conversationId: string | null) => void
  fetchMessages: (conversationId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  markAsRead: (conversationId: string) => Promise<void>
  createConversation: (participantIds: string[], name?: string, isGroup?: boolean) => Promise<Conversation>

  // Real-time helpers
  subscribeToConversation: (conversationId: string) => void
  unsubscribeFromConversation: (conversationId: string) => void
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map())
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  // Use refs to track current state for real-time callbacks (avoids stale closures)
  const currentConversationIdRef = useRef<string | null>(null)
  const userIdRef = useRef<string | null>(null)

  // Keep refs in sync with state
  useEffect(() => {
    currentConversationIdRef.current = currentConversation?.id || null
  }, [currentConversation])

  useEffect(() => {
    userIdRef.current = user?.id || null
  }, [user])

  // Initialize Supabase client
  useEffect(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return () => {
      // Cleanup all channels on unmount
      channelsRef.current.forEach((channel) => {
        channel.unsubscribe()
      })
      channelsRef.current.clear()
    }
  }, [])

  // Get auth token for API calls (refreshes if needed)
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!supabaseRef.current) return null

    // First try to get current session
    const { data: { session }, error } = await supabaseRef.current.auth.getSession()

    if (error || !session) {
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabaseRef.current.auth.refreshSession()
      if (refreshError || !refreshData.session) {
        return null
      }
      return refreshData.session.access_token
    }

    // Check if token is about to expire (within 60 seconds)
    const expiresAt = session.expires_at
    if (expiresAt && expiresAt * 1000 - Date.now() < 60000) {
      const { data: refreshData, error: refreshError } = await supabaseRef.current.auth.refreshSession()
      if (!refreshError && refreshData.session) {
        return refreshData.session.access_token
      }
    }

    return session.access_token
  }, [])

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const { data } = await response.json()
      setConversations(data || [])

      // Calculate total unread count
      const unread = (data || []).reduce((sum: number, conv: Conversation) =>
        sum + (conv.unread_count || 0), 0
      )
      setTotalUnreadCount(unread)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const { data } = await response.json()
      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken])

  // Select a conversation
  const selectConversation = useCallback((conversationId: string | null) => {
    // Initialize audio on user interaction (required by browsers)
    initAudio()

    if (conversationId === null) {
      setCurrentConversation(null)
      setMessages([])
      return
    }

    const conv = conversations.find(c => c.id === conversationId)
    setCurrentConversation(conv || null)

    if (conv) {
      fetchMessages(conversationId)
    }
  }, [conversations, fetchMessages])

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !currentConversation) return

    // Initialize audio on first user interaction (required by browsers)
    initAudio()

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      let response: Response
      try {
        response = await fetch(`/api/conversations/${currentConversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection and try again.')
        }
        throw fetchError
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to send message (${response.status})`)
      }

      const { data: newMessage } = await response.json()

      // Add message to local state immediately
      setMessages(prev => [...prev, newMessage])

      // Update conversation's last message and move to top
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, last_message: newMessage, updated_at: newMessage.created_at }
            : conv
        )
        // Sort by updated_at to move the conversation to top
        return updated.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      })

      // Broadcast the message to other users in the conversation
      const channel = channelsRef.current.get(currentConversation.id)
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMessage,
        })
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      throw err
    }
  }, [user, currentConversation, getAuthToken])

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return

    try {
      const token = await getAuthToken()
      if (!token) return

      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Update local state
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread_count: 0 }
          : conv
      ))

      // Recalculate total unread
      setTotalUnreadCount(prev => {
        const conv = conversations.find(c => c.id === conversationId)
        return Math.max(0, prev - (conv?.unread_count || 0))
      })
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [user, conversations, getAuthToken])

  // Create a new conversation
  const createConversation = useCallback(async (
    participantIds: string[],
    name?: string,
    isGroup?: boolean
  ): Promise<Conversation> => {
    if (!user) {
      throw new Error('Not authenticated')
    }

    const token = await getAuthToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantIds, name, isGroup }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create conversation')
    }

    const { data: conversation } = await response.json()

    // Refresh conversations list
    await fetchConversations()

    return conversation
  }, [user, getAuthToken, fetchConversations])

  // Subscribe to real-time updates for a conversation
  const subscribeToConversation = useCallback((conversationId: string) => {
    if (!supabaseRef.current || channelsRef.current.has(conversationId)) return

    const channel = supabaseRef.current
      .channel(`conversation:${conversationId}`)
      // Listen for broadcast messages (more reliable than postgres_changes with RLS)
      .on(
        'broadcast',
        { event: 'new_message' },
        (payload) => {
          const newMessage = payload.payload as Message

          // Don't add if it's our own message (already added optimistically)
          if (newMessage.sender_id === userIdRef.current) {
            return
          }

          // Play notification sound for incoming messages
          playNotificationSound()

          // Use ref to check current conversation (avoids stale closure)
          const isViewingThisConversation = currentConversationIdRef.current === conversationId

          // Add to messages if viewing this conversation
          if (isViewingThisConversation) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMessage.id)) return prev
              return [...prev, newMessage]
            })
          }

          // Update conversation list
          setConversations(prev => {
            const updated = prev.map(conv => {
              if (conv.id !== conversationId) return conv
              return {
                ...conv,
                last_message: newMessage,
                updated_at: newMessage.created_at,
                unread_count: isViewingThisConversation
                  ? conv.unread_count
                  : (conv.unread_count || 0) + 1,
              }
            })
            return updated.sort((a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
          })

          // Update total unread if not viewing this conversation
          if (!isViewingThisConversation) {
            setTotalUnreadCount(prev => prev + 1)
          }
        }
      )
      // Also listen for postgres_changes as a backup
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message

          // Don't add if it's our own message
          if (newMessage.sender_id === userIdRef.current) {
            return
          }

          // Fetch sender info
          if (supabaseRef.current && newMessage.sender_id) {
            const { data: sender } = await supabaseRef.current
              .from('profiles')
              .select('id, full_name, avatar_url, display_name')
              .eq('id', newMessage.sender_id)
              .single()

            newMessage.sender = sender
          }

          const isViewingThisConversation = currentConversationIdRef.current === conversationId

          // Add to messages if viewing this conversation (avoid duplicates)
          if (isViewingThisConversation) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev
              return [...prev, newMessage]
            })
          }

          // Update conversation list
          setConversations(prev => {
            const updated = prev.map(conv => {
              if (conv.id !== conversationId) return conv
              // Only update if we don't already have this message
              if (conv.last_message?.id === newMessage.id) return conv
              return {
                ...conv,
                last_message: newMessage,
                updated_at: newMessage.created_at,
                unread_count: isViewingThisConversation
                  ? conv.unread_count
                  : (conv.unread_count || 0) + 1,
              }
            })
            return updated.sort((a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
          })

          if (!isViewingThisConversation) {
            setTotalUnreadCount(prev => prev + 1)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages(prev => prev.map(msg =>
            msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
          ))
        }
      )
      .subscribe()

    channelsRef.current.set(conversationId, channel)
  }, []) // No dependencies needed - we use refs for current state

  // Unsubscribe from a conversation's real-time updates
  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    const channel = channelsRef.current.get(conversationId)
    if (channel) {
      channel.unsubscribe()
      channelsRef.current.delete(conversationId)
    }
  }, [])

  // Auto-fetch conversations when user changes
  useEffect(() => {
    if (user) {
      fetchConversations()
    } else {
      setConversations([])
      setCurrentConversation(null)
      setMessages([])
      setTotalUnreadCount(0)
    }
  }, [user, fetchConversations])

  // Subscribe to all conversations for updates
  useEffect(() => {
    if (!user || conversations.length === 0) return

    // Get conversation IDs that need subscription
    const conversationIds = conversations.map(c => c.id)
    const existingIds = Array.from(channelsRef.current.keys())

    // Subscribe to new conversations only
    conversationIds.forEach(convId => {
      if (!existingIds.includes(convId)) {
        subscribeToConversation(convId)
      }
    })

    // Unsubscribe from conversations we're no longer part of
    existingIds.forEach(existingId => {
      if (!conversationIds.includes(existingId)) {
        unsubscribeFromConversation(existingId)
      }
    })

    // Cleanup on unmount only
    return () => {
      // Don't cleanup on re-render, only on actual unmount
    }
  }, [user, conversations, subscribeToConversation, unsubscribeFromConversation])

  // Mark as read when viewing a conversation
  useEffect(() => {
    if (currentConversation && currentConversation.unread_count && currentConversation.unread_count > 0) {
      markAsRead(currentConversation.id)
    }
  }, [currentConversation, markAsRead])

  const value: MessagingContextType = {
    conversations,
    currentConversation,
    messages,
    totalUnreadCount,
    loading,
    error,
    fetchConversations,
    selectConversation,
    fetchMessages,
    sendMessage,
    markAsRead,
    createConversation,
    subscribeToConversation,
    unsubscribeFromConversation,
  }

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider')
  }
  return context
}
