-- Messaging System Migration
-- Implements 1:1 and group conversations with real-time support
-- DRI-33: Direct Messaging System

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, -- NULL for 1:1 chats, set for group chats
  is_group BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CONVERSATION PARTICIPANTS TABLE
-- ============================================================================
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE, -- NULL means still active
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Message pagination - fetch messages by conversation, newest first
CREATE INDEX idx_messages_conversation_created
  ON messages(conversation_id, created_at DESC);

-- User's active conversations
CREATE INDEX idx_participants_user_active
  ON conversation_participants(user_id, left_at)
  WHERE left_at IS NULL;

-- Conversation members
CREATE INDEX idx_participants_conversation
  ON conversation_participants(conversation_id);

-- Unread messages - for counting
CREATE INDEX idx_messages_created_at
  ON messages(created_at);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - CONVERSATIONS
-- ============================================================================

-- Users can view conversations they participate in
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
      AND conversation_participants.left_at IS NULL
    )
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update group conversations
CREATE POLICY "Admins can update group conversations"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
      AND conversation_participants.role = 'admin'
      AND conversation_participants.left_at IS NULL
    )
  );

-- ============================================================================
-- RLS POLICIES - PARTICIPANTS
-- ============================================================================

-- Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.left_at IS NULL
    )
  );

-- Users can join conversations (for creating new 1:1 or being added to groups)
CREATE POLICY "Users can be added to conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    -- Either the user is adding themselves to a conversation they created
    user_id = auth.uid()
    OR
    -- Or an admin is adding them
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'admin'
      AND cp.left_at IS NULL
    )
  );

-- Users can update their own participation (mute, mark read)
-- Admins can update others (remove from group)
CREATE POLICY "Users can update their participation"
  ON conversation_participants FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'admin'
      AND cp.left_at IS NULL
    )
  );

-- ============================================================================
-- RLS POLICIES - MESSAGES
-- ============================================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
      AND conversation_participants.left_at IS NULL
    )
  );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
      AND conversation_participants.left_at IS NULL
    )
  );

-- Users can edit their own messages
CREATE POLICY "Users can edit their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update conversation.updated_at when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Update message.updated_at on edit
CREATE OR REPLACE FUNCTION update_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_timestamp
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_message_timestamp();

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for conversation_participants (for typing indicators, join/leave)
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- ============================================================================
-- REPLICA IDENTITY FOR REALTIME WITH RLS
-- ============================================================================
-- For postgres_changes to work with RLS, tables need REPLICA IDENTITY FULL
-- This allows Postgres to include full row data in WAL for RLS evaluation

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
