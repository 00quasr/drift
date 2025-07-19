// Run this script to create missing profiles for existing users
// Usage: node scripts/create-profile.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createProfile(userId, email, fullName = 'User') {
  try {
    console.log(`Creating profile for user: ${userId}`)

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('Profile already exists')
      return
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        role: 'fan',
        is_verified: false
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return
    }

    console.log('Profile created:', profile)

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        profile_visibility: 'public',
        show_activity: true,
        show_reviews: true,
        show_favorites: true,
        show_location: false
      })

    if (settingsError) {
      console.error('Settings creation error:', settingsError)
    } else {
      console.log('User settings created')
    }

    console.log('✅ Profile setup complete!')

  } catch (error) {
    console.error('Error:', error)
  }
}

// Create profile for your user
createProfile('068573a1-5a37-47f9-85c1-4d8ad3ee634b', 'keanukl.kk@gmail.com', 'Keanu')
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })