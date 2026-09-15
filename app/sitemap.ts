import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase-public'
import { getSiteUrl } from '@/lib/site'

// Detail content changes often enough that a day-old sitemap is fine, but we do
// not want it frozen at build time for the lifetime of a deployment.
export const revalidate = 3600

const STATIC_PATHS = [
  '',
  '/explore',
  '/explore/trending',
  '/explore/weekend',
  '/events',
  '/events/festivals',
  '/events/map',
  '/venues',
  '/artists',
  '/artists/trending',
  '/artists/newcomers',
  '/privacy',
  '/terms',
  '/impressum',
]

type Row = { id: string; updated_at: string | null }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  const supabase = createPublicClient()

  // No credentials (or an unreachable database) must not fail the build - fall
  // back to the static routes, matching how the data services degrade.
  if (!supabase) return staticEntries

  try {
    const [venues, events, artists] = await Promise.all([
      supabase.from('venues').select('id, updated_at').eq('is_active', true).eq('status', 'published'),
      supabase.from('events').select('id, updated_at').eq('is_active', true).eq('status', 'published'),
      supabase.from('artists').select('id, updated_at').eq('is_active', true).eq('status', 'published'),
    ])

    const toEntries = (
      rows: Row[] | null,
      prefix: string,
      priority: number
    ): MetadataRoute.Sitemap =>
      (rows ?? []).map((row) => ({
        url: `${siteUrl}${prefix}/${row.id}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority,
      }))

    return [
      ...staticEntries,
      // Events are the most time-sensitive and the strongest search surface.
      ...toEntries(events.data as Row[] | null, '/event', 0.9),
      ...toEntries(venues.data as Row[] | null, '/venue', 0.8),
      ...toEntries(artists.data as Row[] | null, '/artist', 0.8),
    ]
  } catch (error) {
    console.error('Error building sitemap:', error)
    return staticEntries
  }
}
