import { createClient } from '@/lib/supabase-server'
import { Database } from '@/lib/types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface ConversationWithDetails extends Conversation {
  participants: (ConversationParticipant & {
    profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'display_name'>
  })[]
  last_message?: Message & {
    sender: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'display_name'> | null
  }
  unread_count?: number
}

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'display_name'> | null
}

export interface CreateConversationParams {
  participantIds: string[]
  name?: string
  isGroup?: boolean
  createdBy: string
}

export interface SendMessageParams {
  conversationId: string
  senderId: string
  content: string
}

/**
 * Get all conversations for a user with latest message and participants
 */
export async function getUserConversations(userId: string): Promise<ConversationWithDetails[]> {
  const supabase = await createClient()

  // Get conversations where user is an active participant
  const { data: participations, error: participationsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId)
    .is('left_at', null)

  if (participationsError) {
    console.error('Error fetching participations:', participationsError)
    throw new Error('Failed to fetch conversations')
  }

  if (!participations || participations.length === 0) {
    return []
  }

  const conversationIds = participations.map((p: { conversation_id: string }) => p.conversation_id)

  // Get conversations with participants
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        *,
        profile:profiles(id, full_name, avatar_url, display_name)
      )
    `)
    .in('id', conversationIds)
    .order('updated_at', { ascending: false })

  if (conversationsError) {
    console.error('Error fetching conversations:', conversationsError)
    throw new Error('Failed to fetch conversations')
  }

  // Get last message for each conversation
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv: any) => {
      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url, display_name)
        `)
        .eq('conversation_id', conv.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get unread count
      const userParticipation = conv.participants.find(
        (p: ConversationParticipant) => p.user_id === userId
      )

      let unreadCount = 0
      if (userParticipation?.last_read_at) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_deleted', false)
          .neq('sender_id', userId)
          .gt('created_at', userParticipation.last_read_at)

        unreadCount = count || 0
      }

      return {
        ...conv,
        last_message: lastMessage || undefined,
        unread_count: unreadCount
      } as ConversationWithDetails
    })
  )

  return conversationsWithDetails
}

/**
 * Get a single conversation by ID with participants
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<ConversationWithDetails | null> {
  const supabase = await createClient()

  // Verify user is a participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .is('left_at', null)
    .single()

  if (!participation) {
    return null
  }

  // Get conversation with participants
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        *,
        profile:profiles(id, full_name, avatar_url, display_name)
      )
    `)
    .eq('id', conversationId)
    .single()

  if (error || !conversation) {
    return null
  }

  return conversation as ConversationWithDetails
}

/**
 * Create a new conversation (1:1 or group)
 */
export async function createConversation(
  params: CreateConversationParams
): Promise<Conversation> {
  const supabase = await createClient()
  const { participantIds, name, isGroup = false, createdBy } = params

  // For 1:1 chats, check if a conversation already exists between these users
  if (!isGroup && participantIds.length === 2) {
    const existingConversation = await findExisting1to1Conversation(
      participantIds[0],
      participantIds[1]
    )
    if (existingConversation) {
      return existingConversation
    }
  }

  // Create the conversation
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({
      name: isGroup ? name : null,
      is_group: isGroup,
      created_by: createdBy
    })
    .select()
    .single()

  if (conversationError || !conversation) {
    console.error('Error creating conversation:', conversationError)
    throw new Error('Failed to create conversation')
  }

  // Add participants
  const participantInserts = participantIds.map((userId, index) => ({
    conversation_id: conversation.id,
    user_id: userId,
    role: userId === createdBy ? 'admin' : 'member' as const
  }))

  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participantInserts)

  if (participantsError) {
    console.error('Error adding participants:', participantsError)
    // Rollback conversation creation
    await supabase.from('conversations').delete().eq('id', conversation.id)
    throw new Error('Failed to add participants to conversation')
  }

  return conversation
}

/**
 * Find an existing 1:1 conversation between two users
 */
export async function findExisting1to1Conversation(
  userId1: string,
  userId2: string
): Promise<Conversation | null> {
  const supabase = await createClient()

  // Find conversations where both users are active participants
  // and it's not a group chat
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(user_id)
    `)
    .eq('is_group', false)

  if (!conversations) return null

  // Find a conversation with exactly these two participants
  for (const conv of conversations) {
    const participantIds = conv.participants
      .filter((p: { user_id: string }) => p.user_id)
      .map((p: { user_id: string }) => p.user_id)

    if (
      participantIds.length === 2 &&
      participantIds.includes(userId1) &&
      participantIds.includes(userId2)
    ) {
      return conv
    }
  }

  return null
}

/**
 * Get messages for a conversation with pagination
 */
export async function getMessages(
  conversationId: string,
  userId: string,
  options: { limit?: number; before?: string } = {}
): Promise<MessageWithSender[]> {
  const supabase = await createClient()
  const { limit = 50, before } = options

  // Verify user is a participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .is('left_at', null)
    .single()

  if (!participation) {
    throw new Error('Not a participant of this conversation')
  }

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(id, full_name, avatar_url, display_name)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data: messages, error } = await query

  if (error) {
    console.error('Error fetching messages:', error)
    throw new Error('Failed to fetch messages')
  }

  // Return in chronological order
  return (messages || []).reverse() as MessageWithSender[]
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(
  params: SendMessageParams
): Promise<MessageWithSender> {
  const supabase = await createClient()
  const { conversationId, senderId, content } = params

  // Verify user is a participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', senderId)
    .is('left_at', null)
    .single()

  if (!participation) {
    throw new Error('Not a participant of this conversation')
  }

  // Insert the message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim()
    })
    .select(`
      *,
      sender:profiles(id, full_name, avatar_url, display_name)
    `)
    .single()

  if (error || !message) {
    console.error('Error sending message:', error)
    throw new Error('Failed to send message')
  }

  return message as MessageWithSender
}

/**
 * Edit a message
 */
export async function editMessage(
  messageId: string,
  userId: string,
  newContent: string
): Promise<MessageWithSender> {
  const supabase = await createClient()

  // Verify ownership
  const { data: message } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .eq('sender_id', userId)
    .single()

  if (!message) {
    throw new Error('Message not found or not authorized')
  }

  // Update the message
  const { data: updatedMessage, error } = await supabase
    .from('messages')
    .update({
      content: newContent.trim(),
      is_edited: true
    })
    .eq('id', messageId)
    .select(`
      *,
      sender:profiles(id, full_name, avatar_url, display_name)
    `)
    .single()

  if (error || !updatedMessage) {
    console.error('Error editing message:', error)
    throw new Error('Failed to edit message')
  }

  return updatedMessage as MessageWithSender
}

/**
 * Soft delete a message
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  // Verify ownership
  const { data: message } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .eq('sender_id', userId)
    .single()

  if (!message) {
    throw new Error('Message not found or not authorized')
  }

  // Soft delete
  const { error } = await supabase
    .from('messages')
    .update({ is_deleted: true })
    .eq('id', messageId)

  if (error) {
    console.error('Error deleting message:', error)
    throw new Error('Failed to delete message')
  }
}

/**
 * Mark a conversation as read
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error marking conversation as read:', error)
    throw new Error('Failed to mark conversation as read')
  }
}

/**
 * Leave a conversation (for group chats)
 */
export async function leaveConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversation_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error leaving conversation:', error)
    throw new Error('Failed to leave conversation')
  }
}

/**
 * Add a participant to a group conversation (admin only)
 */
export async function addParticipant(
  conversationId: string,
  adminUserId: string,
  newUserId: string
): Promise<void> {
  const supabase = await createClient()

  // Verify conversation is a group
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('is_group', true)
    .single()

  if (!conversation) {
    throw new Error('Conversation not found or not a group')
  }

  // Verify admin status
  const { data: adminParticipation } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', adminUserId)
    .eq('role', 'admin')
    .is('left_at', null)
    .single()

  if (!adminParticipation) {
    throw new Error('Only admins can add participants')
  }

  // Check if user is already a participant
  const { data: existingParticipation } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', newUserId)
    .single()

  if (existingParticipation && !existingParticipation.left_at) {
    throw new Error('User is already a participant')
  }

  // If they previously left, rejoin them
  if (existingParticipation) {
    const { error } = await supabase
      .from('conversation_participants')
      .update({
        left_at: null,
        joined_at: new Date().toISOString()
      })
      .eq('id', existingParticipation.id)

    if (error) throw new Error('Failed to add participant')
    return
  }

  // Add new participant
  const { error } = await supabase
    .from('conversation_participants')
    .insert({
      conversation_id: conversationId,
      user_id: newUserId,
      role: 'member'
    })

  if (error) {
    console.error('Error adding participant:', error)
    throw new Error('Failed to add participant')
  }
}

/**
 * Remove a participant from a group conversation (admin only)
 */
export async function removeParticipant(
  conversationId: string,
  adminUserId: string,
  userIdToRemove: string
): Promise<void> {
  const supabase = await createClient()

  // Can't remove yourself with this function
  if (adminUserId === userIdToRemove) {
    throw new Error('Use leaveConversation to leave')
  }

  // Verify admin status
  const { data: adminParticipation } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', adminUserId)
    .eq('role', 'admin')
    .is('left_at', null)
    .single()

  if (!adminParticipation) {
    throw new Error('Only admins can remove participants')
  }

  // Remove participant
  const { error } = await supabase
    .from('conversation_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userIdToRemove)

  if (error) {
    console.error('Error removing participant:', error)
    throw new Error('Failed to remove participant')
  }
}

/**
 * Mute/unmute a conversation
 */
export async function toggleMuteConversation(
  conversationId: string,
  userId: string,
  muted: boolean
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversation_participants')
    .update({ is_muted: muted })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error toggling mute:', error)
    throw new Error('Failed to update mute status')
  }
}

/**
 * Get unread message count across all conversations
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()

  // Get all participations with last_read_at
  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)
    .is('left_at', null)

  if (!participations || participations.length === 0) {
    return 0
  }

  let totalUnread = 0

  for (const participation of participations) {
    if (participation.last_read_at) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', participation.conversation_id)
        .eq('is_deleted', false)
        .neq('sender_id', userId)
        .gt('created_at', participation.last_read_at)

      totalUnread += count || 0
    }
  }

  return totalUnread
}

/**
 * Check if a user can message another user
 */
export async function canMessageUser(
  senderId: string,
  recipientId: string
): Promise<{ canMessage: boolean; reason?: string }> {
  const supabase = await createClient()

  // Check recipient's messaging settings
  const { data: recipientSettings } = await supabase
    .from('user_settings')
    .select('allow_messages')
    .eq('user_id', recipientId)
    .single()

  if (recipientSettings && recipientSettings.allow_messages === false) {
    return {
      canMessage: false,
      reason: 'This user has disabled direct messages'
    }
  }

  // Check if sender is blocked by recipient
  const { data: blocked } = await supabase
    .from('user_connections')
    .select('*')
    .eq('follower_id', recipientId)
    .eq('following_id', senderId)
    .eq('status', 'blocked')
    .single()

  if (blocked) {
    return {
      canMessage: false,
      reason: 'Unable to message this user'
    }
  }

  return { canMessage: true }
}
