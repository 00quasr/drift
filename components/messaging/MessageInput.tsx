'use client'

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  className,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent || sending || disabled) return

    setSending(true)
    setError(null)

    try {
      await onSendMessage(trimmedContent)
      setContent('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }, [content, sending, disabled, onSendMessage])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Send on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value)
      setError(null)

      // Auto-resize textarea
      const textarea = e.target
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    },
    []
  )

  const canSend = content.trim().length > 0 && !sending && !disabled

  return (
    <div className={cn('border-t border-neutral-800 p-4 bg-neutral-950', className)}>
      {error && (
        <div className="mb-2 px-2 py-1 text-sm text-red-400 bg-red-950/50 rounded">
          {error}
        </div>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="min-h-[40px] max-h-[150px] resize-none bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0"
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="sm"
          className="h-10 px-4 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
