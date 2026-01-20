import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ModerationResult {
  success: boolean
  approved: boolean
  reason?: string
  categories?: string[]
}

export async function POST(request: NextRequest): Promise<NextResponse<ModerationResult>> {
  try {
    const { content } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({
        success: false,
        approved: false,
        reason: 'No message content provided'
      }, { status: 400 })
    }

    // Reject empty or whitespace-only messages
    if (content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        approved: false,
        reason: 'Message cannot be empty'
      }, { status: 400 })
    }

    // Reject excessively long messages
    if (content.length > 5000) {
      return NextResponse.json({
        success: false,
        approved: false,
        reason: 'Message exceeds maximum length of 5000 characters'
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, skipping message moderation')
      return NextResponse.json({
        success: true,
        approved: true,
        reason: 'Message moderation skipped - API key not configured'
      })
    }

    // Use OpenAI's moderation API
    const moderationResponse = await openai.moderations.create({
      input: content
    })

    const result = moderationResponse.results[0]
    const flagged = result?.flagged
    const categories = result?.categories || {}

    if (flagged) {
      // Map flagged categories to user-friendly messages
      const flaggedCategories = Object.entries(categories)
        .filter(([_, isFlagged]) => isFlagged)
        .map(([category]) => category)

      // Determine the rejection reason based on flagged categories
      let reason = 'Your message contains content that violates our community guidelines.'

      if (flaggedCategories.includes('harassment') || flaggedCategories.includes('harassment/threatening')) {
        reason = 'Your message contains harassment or threatening content.'
      } else if (flaggedCategories.includes('hate') || flaggedCategories.includes('hate/threatening')) {
        reason = 'Your message contains hateful or discriminatory content.'
      } else if (flaggedCategories.includes('self-harm') || flaggedCategories.includes('self-harm/intent') || flaggedCategories.includes('self-harm/instructions')) {
        reason = 'Your message contains content related to self-harm.'
      } else if (flaggedCategories.includes('sexual') || flaggedCategories.includes('sexual/minors')) {
        reason = 'Your message contains inappropriate sexual content.'
      } else if (flaggedCategories.includes('violence') || flaggedCategories.includes('violence/graphic')) {
        reason = 'Your message contains violent or graphic content.'
      } else if (flaggedCategories.includes('illicit') || flaggedCategories.includes('illicit/violent')) {
        reason = 'Your message contains content promoting illegal activities.'
      }

      return NextResponse.json({
        success: true,
        approved: false,
        reason,
        categories: flaggedCategories
      })
    }

    // Message passed moderation
    return NextResponse.json({
      success: true,
      approved: true,
      reason: 'Message approved',
      categories: []
    })

  } catch (error) {
    console.error('Message moderation error:', error)

    // In case of API error, allow the message but log it
    // This prevents blocking users due to moderation service issues
    return NextResponse.json({
      success: true,
      approved: true,
      reason: 'Moderation service temporarily unavailable',
      categories: ['service_error']
    })
  }
}
