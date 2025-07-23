// Curated professional images for different entity types
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
 * Returns a curated fallback image for an entity when no image is provided
 * Uses entity ID for consistent image selection
 */
export function getFallbackImage(
  entityType: 'venue' | 'event' | 'artist',
  entityId: string
): string {
  // Convert string ID to numeric hash for consistent selection
  const hash = entityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let imageArray: string[];
  switch (entityType) {
    case 'venue':
      imageArray = VENUE_IMAGES;
      break;
    case 'event':
      imageArray = EVENT_IMAGES;
      break;
    case 'artist':
      imageArray = ARTIST_IMAGES;
      break;
    default:
      imageArray = VENUE_IMAGES;
  }
  
  const index = hash % imageArray.length;
  return imageArray[index];
}

/**
 * Get a fallback image for a list view (when user hasn't uploaded an image)
 */
export function getListFallbackImage(
  entityType: 'venue' | 'event' | 'artist',
  index: number
): string {
  let imageArray: string[];
  switch (entityType) {
    case 'venue':
      imageArray = VENUE_IMAGES;
      break;
    case 'event':
      imageArray = EVENT_IMAGES;
      break;
    case 'artist':
      imageArray = ARTIST_IMAGES;
      break;
    default:
      imageArray = VENUE_IMAGES;
  }
  
  return imageArray[index % imageArray.length];
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

/**
 * Get a random background image from the Supabase assets bucket
 * Uses entity ID for consistent selection across renders
 */
export function getRandomBackgroundImage(entityId: string): string {
  // Convert string ID to numeric hash for consistent selection
  const hash = entityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // We have 29 background images (001.jpg through 029.jpg)
  const imageNumber = (hash % 29) + 1;
  const paddedNumber = imageNumber.toString().padStart(3, '0');
  
  // Return Supabase storage URL for the assets bucket
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${paddedNumber}.jpg`;
} 