'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMessaging } from '@/contexts/MessagingContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  display_name: string | null
}

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onConversationCreated?: (conversationId: string) => void
}

export function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const { user } = useAuth()
  const { createConversation } = useMessaging()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isGroup = selectedUsers.length > 1

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setSearching(true)
      try {
        const supabase = createClient()
        const { data, error: searchError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, display_name')
          .or(`full_name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
          .limit(10)

        if (searchError) {
          console.error('Search error:', searchError)
          return
        }

        // Filter out current user and already selected users
        const filtered = (data || []).filter(
          (profile) =>
            profile.id !== user?.id && // Don't allow chatting with yourself
            !selectedUsers.some((s) => s.id === profile.id)
        )
        setSearchResults(filtered)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearching(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, selectedUsers])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setSelectedUsers([])
      setGroupName('')
      setError(null)
    }
  }, [isOpen])

  const handleSelectUser = useCallback((user: Profile) => {
    setSelectedUsers((prev) => [...prev, user])
    setSearchQuery('')
    setSearchResults([])
  }, [])

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }, [])

  const handleCreateConversation = useCallback(async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user')
      return
    }

    if (isGroup && !groupName.trim()) {
      setError('Please enter a group name')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const conversation = await createConversation(
        selectedUsers.map((u) => u.id),
        isGroup ? groupName.trim() : undefined,
        isGroup
      )

      onConversationCreated?.(conversation.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
    } finally {
      setLoading(false)
    }
  }, [selectedUsers, groupName, isGroup, createConversation, onConversationCreated, onClose])

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg shadow-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">New Conversation</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 bg-neutral-800 px-2 py-1 rounded-full text-sm text-white"
                >
                  <Avatar className="h-5 w-5">
                    {user.avatar_url && (
                      <AvatarImage src={user.avatar_url} />
                    )}
                    <AvatarFallback className="text-xs bg-neutral-700 text-white">
                      {getInitials(user.display_name || user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.display_name || user.full_name}</span>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-neutral-400 hover:text-white ml-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Group name input (shown when 2+ users selected) */}
          {isGroup && (
            <div>
              <label className="text-sm font-medium mb-1.5 block text-neutral-300">
                Group Name
              </label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter a name for your group"
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0"
              />
            </div>
          )}

          {/* User search */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-neutral-300">
              {selectedUsers.length === 0 ? 'Search for a user' : 'Add more people'}
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0"
            />
          </div>

          {/* Search results */}
          {searching ? (
            <p className="text-sm text-neutral-500">Searching...</p>
          ) : searchResults.length > 0 ? (
            <div className="border border-neutral-800 rounded-lg divide-y divide-neutral-800 max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-800 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                    <AvatarFallback className="text-xs bg-neutral-700 text-white">
                      {getInitials(user.display_name || user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">
                    {user.display_name || user.full_name || 'Unknown User'}
                  </span>
                </button>
              ))}
            </div>
          ) : searchQuery.trim().length >= 2 ? (
            <p className="text-sm text-neutral-500">No users found</p>
          ) : null}

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-neutral-800">
          <Button variant="outline" onClick={onClose} disabled={loading} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={loading || selectedUsers.length === 0 || (isGroup && !groupName.trim())}
            className="bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            {loading ? 'Creating...' : isGroup ? 'Create Group' : 'Start Chat'}
          </Button>
        </div>
      </div>
    </div>
  )
}
