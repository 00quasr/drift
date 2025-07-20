import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { image, filename } = await request.json()

    if (!image) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image provided' 
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, skipping moderation')
      return NextResponse.json({ 
        success: true, 
        approved: true,
        message: 'Moderation skipped - API key not configured'
      })
    }

    // Use OpenAI's vision model to analyze the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this image for content moderation as a profile picture for an electronic music platform. Return ONLY a JSON object:
              {
                "approved": boolean,
                "reason": "explanation if not approved",
                "categories": ["list of any problematic categories found"]
              }
              
              ONLY reject images that contain:
              - Clear nudity or sexually explicit content
              - Graphic violence or disturbing content
              - Obvious hate symbols or offensive gestures
              - Clear illegal activities
              
              APPROVE images that are:
              - Profile pictures of people (faces, portraits, selfies)
              - Artistic or creative content
              - Nature, objects, or abstract art
              - Music-related content (DJ equipment, concerts, etc.)
              - Screenshots or digital art
              - Logos or text-based images
              - Animals or pets
              - Food or everyday objects
              
              Be LIBERAL in approval - when in doubt, approve the image. This is for user profile pictures on a music platform.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from moderation service')
    }

    // Parse the JSON response (handle markdown code blocks)
    let moderationResult
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      moderationResult = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse moderation response:', content)
      // Fallback to approved if we can't parse (be liberal)
      moderationResult = {
        approved: true,
        reason: 'Parsing failed but defaulting to approved',
        categories: ['parsing_error']
      }
    }

    // Log moderation results for monitoring
    console.log('Image moderation result:', {
      filename,
      approved: moderationResult.approved,
      reason: moderationResult.reason,
      categories: moderationResult.categories,
      rawResponse: content
    })

    return NextResponse.json({
      success: true,
      approved: moderationResult.approved,
      reason: moderationResult.reason,
      categories: moderationResult.categories
    })

  } catch (error: any) {
    console.error('Image moderation error:', error)
    
    // In case of error, default to requiring manual review
    return NextResponse.json({
      success: true,
      approved: false,
      reason: 'Moderation service temporarily unavailable - manual review required',
      categories: ['service_error']
    })
  }
}