"use client"

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { FourCategoryRating } from '@/components/ui/star-rating'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/auth'

interface Review {
  id: string
  user_id: string
  rating_overall: number
  rating_sound: number | null
  rating_vibe: number | null
  rating_crowd: number | null
  comment: string | null
  created_at: string
}

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: 'venue' | 'event' | 'artist' | 'label'
  targetId: string
  targetName: string
  onSubmit?: () => void
  existingReview?: Review | null
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSubmit,
  existingReview
}) => {
  const { user } = useAuth()
  const [ratings, setRatings] = useState({
    sound: 0,
    vibe: 0,
    crowd: 0,
    overall: 0
  })
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const isEditing = !!existingReview

  // Initialize form with existing review data when editing
  useEffect(() => {
    if (isOpen && existingReview) {
      setRatings({
        sound: existingReview.rating_sound || 0,
        vibe: existingReview.rating_vibe || 0,
        crowd: existingReview.rating_crowd || 0,
        overall: existingReview.rating_overall || 0
      })
      setComment(existingReview.comment || '')
    } else if (isOpen && !existingReview) {
      // Reset form for new reviews
      setRatings({ sound: 0, vibe: 0, crowd: 0, overall: 0 })
      setComment('')
    }
  }, [isOpen, existingReview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to submit a review')
      return
    }

    // Validate that at least overall rating is provided
    if (ratings.overall === 0) {
      setError('Please provide at least an overall rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Get access token for authentication
      const token = await authService.getAccessToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }

      const url = isEditing ? `/api/reviews/${existingReview.id}` : '/api/reviews'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          rating_sound: ratings.sound || null,
          rating_vibe: ratings.vibe || null,
          rating_crowd: ratings.crowd || null,
          rating_overall: ratings.overall,
          comment: comment.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      // Reset form
      setRatings({ sound: 0, vibe: 0, crowd: 0, overall: 0 })
      setComment('')
      
      // Call success callback
      onSubmit?.()
      
      // Close modal
      onClose()
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRatings({ sound: 0, vibe: 0, crowd: 0, overall: 0 })
      setComment('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border-2 border-white/20 p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wider uppercase mb-2">
              {isEditing ? 'EDIT REVIEW' : 'WRITE REVIEW'}
            </h2>
            <p className="text-white/60 font-medium tracking-wider uppercase text-sm">
              {targetType}: {targetName}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white/60 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Categories */}
          <div>            
            <FourCategoryRating
              ratings={ratings}
              onChange={setRatings}
            />
          </div>

          {/* Comment */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-white animate-pulse" />
              <h3 className="text-white font-bold tracking-widest uppercase text-lg">REVIEW (OPTIONAL)</h3>
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="w-full bg-white/5 border border-white/20 text-white placeholder-white/40 p-4 focus:outline-none focus:border-white/40 transition-colors resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4">
              <p className="text-red-400 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-white/30 text-white hover:bg-white/10 font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50"
            >
              CANCEL
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || ratings.overall === 0}
              className="px-6 py-3 bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SUBMITTING...' : isEditing ? 'UPDATE REVIEW' : 'SUBMIT REVIEW'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}