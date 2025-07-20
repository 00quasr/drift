import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'No text provided' 
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, skipping text moderation')
      return NextResponse.json({ 
        success: true, 
        approved: true,
        message: 'Text moderation skipped - API key not configured'
      })
    }

    // Use OpenAI's moderation endpoint first (faster and cheaper)
    const moderationResponse = await openai.moderations.create({
      input: text
    })

    const flagged = moderationResponse.results[0]?.flagged
    const categories = moderationResponse.results[0]?.categories || {}

    if (flagged) {
      const flaggedCategories = Object.entries(categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => category)

      return NextResponse.json({
        success: true,
        approved: false,
        reason: 'Content flagged by moderation system',
        categories: flaggedCategories
      })
    }

    // For additional context-aware moderation, use GPT for borderline cases
    if (text.length > 20) { // Only for substantial text
      const contextResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for an electronic music platform. Analyze the following text for appropriateness. Return ONLY a JSON object:
            {
              "approved": boolean,
              "reason": "explanation if not approved",
              "severity": "low|medium|high"
            }
            
            Reject content that:
            - Contains hate speech or harassment
            - Promotes illegal activities
            - Contains excessive profanity in non-artistic context
            - Spreads misinformation
            - Contains spam or promotional content
            - Is completely off-topic for a music platform
            
            Approve content that:
            - Discusses music, events, venues, or artists
            - Shares personal experiences or opinions respectfully
            - Contains mild profanity in artistic or expressive context
            - Is general social interaction appropriate for a music community`
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 150,
        temperature: 0.1
      })

      const content = contextResponse.choices[0]?.message?.content
      if (content) {
        try {
          const contextResult = JSON.parse(content)
          if (!contextResult.approved) {
            return NextResponse.json({
              success: true,
              approved: false,
              reason: contextResult.reason,
              severity: contextResult.severity,
              categories: ['context_inappropriate']
            })
          }
        } catch (parseError) {
          console.error('Failed to parse context moderation response:', content)
        }
      }
    }

    // If we get here, content is approved
    return NextResponse.json({
      success: true,
      approved: true,
      reason: 'Content approved',
      categories: []
    })

  } catch (error: any) {
    console.error('Text moderation error:', error)
    
    // In case of error, be conservative
    return NextResponse.json({
      success: true,
      approved: true, // Allow text by default if moderation fails
      reason: 'Moderation service temporarily unavailable',
      categories: ['service_error']
    })
  }
}