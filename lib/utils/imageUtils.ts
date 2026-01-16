// Supabase storage configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`

// Available background images (001.jpg - 029.jpg) from Supabase storage
const BACKGROUND_IMAGES = Array.from({ length: 12 }, (_, i) => 
  String(i + 1).padStart(3, '0') + '.png'
)

// Curated professional images for different entity types (fallback to Unsplash if needed)
const VENUE_IMAGES = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center', // Dark nightclub with crowd
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&crop=center', // Underground club with purple lighting
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center', // Concert venue with atmospheric lighting
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center', // DJ booth in dark club
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop&crop=center', // Concert hall with stage lights
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center', // Electronic music venue
];

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop&crop=center', // Silhouette crowd at concert
  'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&h=600&fit=crop&crop=center', // DJ performance with crowd
  'https://images.unsplash.com/photo-1571173069043-cdcfe5ca46fd?w=800&h=600&fit=crop&crop=center', // Electronic music festival lights
  'https://images.unsplash.com/photo-1571155294602-0519d3fa8236?w=800&h=600&fit=crop&crop=center', // Night event with stage
  'https://images.unsplash.com/photo-1574131082076-b2a6b8b7ac00?w=800&h=600&fit=crop&crop=center', // Dark venue atmosphere
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&crop=center', // Club interior with neon
];

const ARTIST_IMAGES = [
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop&crop=faces', // DJ with headphones
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&crop=faces', // Artist with equipment
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&crop=faces', // Electronic artist portrait
  'https://images.unsplash.com/photo-1572201635894-5d82c8bb2f7a?w=800&h=600&fit=crop&crop=faces', // DJ performance shot
  'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=800&h=600&fit=crop&crop=faces', // Music studio portrait
  'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=800&h=600&fit=crop&crop=faces', // Artist in studio setting
];

/**
 * Get a random background image from Supabase storage
 * @param seed - Optional seed for consistent randomization (e.g., using an ID)
 * @returns Full URL to the background image
 */
export function getRandomBackgroundImage(seed?: string): string {
  let index: number
  
  if (seed) {
    // Use seed to generate consistent "random" index
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    index = Math.abs(hash) % BACKGROUND_IMAGES.length
  } else {
    // Truly random index
    index = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
  }
  
  const imageName = BACKGROUND_IMAGES[index]
  return `${SUPABASE_STORAGE_URL}/assets/${imageName}`
}

/**
 * Get a specific background image by number
 * @param number - Image number (1-29)
 * @returns Full URL to the background image
 */
export function getBackgroundImage(number: number): string {
  if (number < 1 || number > 12) {
    throw new Error('Background image number must be between 1 and 29')
  }
  
  const imageName = String(number).padStart(3, '0') + '.png'
  return `${SUPABASE_STORAGE_URL}/assets/${imageName}`
}

/**
 * Returns a curated fallback image for an entity when no image is provided
 * Now uses Supabase storage images as primary fallback
 */
export function getFallbackImage(
  entityType: 'venue' | 'event' | 'artist',
  entityId: string
): string {
  // Primary: Use Supabase storage background images
  return getRandomBackgroundImage(entityId)
}

/**
 * Get a fallback image for a list view (when user hasn't uploaded an image)
 * Now uses Supabase storage images
 */
export function getListFallbackImage(
  entityType: 'venue' | 'event' | 'artist',
  index: number
): string {
  // Use index to get consistent background image
  const imageIndex = (index % BACKGROUND_IMAGES.length) + 1
  return getBackgroundImage(imageIndex)
}

/**
 * Get multiple random background images
 * @param count - Number of images to get
 * @param seed - Optional seed for consistent randomization
 * @returns Array of image URLs
 */
export function getRandomBackgroundImages(count: number, seed?: string): string[] {
  const images: string[] = []
  const usedIndices = new Set<number>()
  
  for (let i = 0; i < Math.min(count, BACKGROUND_IMAGES.length); i++) {
    let index: number
    
    if (seed) {
      // Use seed + index to generate different but consistent images
      const seedWithIndex = seed + i
      let hash = 0
      for (let j = 0; j < seedWithIndex.length; j++) {
        const char = seedWithIndex.charCodeAt(j)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      index = Math.abs(hash) % BACKGROUND_IMAGES.length
    } else {
      // Ensure no duplicates for random selection
      do {
        index = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
      } while (usedIndices.has(index))
    }
    
    usedIndices.add(index)
    const imageName = BACKGROUND_IMAGES[index]
    images.push(`${SUPABASE_STORAGE_URL}/assets/${imageName}`)
  }
  
  return images
}

/**
 * Validates if an image URL is accessible and valid
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 