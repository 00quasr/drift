import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase-public'
import { getSiteUrl, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'

export type EntityKind = 'venue' | 'event' | 'artist'

// Every detail page is a client component, so crawlers and link unfurlers only
// ever see what we put in the document head. These are generated in the route's
// layout, which stays a server component.
const ENTITY_CONFIG: Record<
  EntityKind,
  { table: string; titleColumn: string; descriptionColumn: string; pathPrefix: string }
> = {
  venue: { table: 'venues', titleColumn: 'name', descriptionColumn: 'description', pathPrefix: '/venue' },
  event: { table: 'events', titleColumn: 'title', descriptionColumn: 'description', pathPrefix: '/event' },
  artist: { table: 'artists', titleColumn: 'name', descriptionColumn: 'bio', pathPrefix: '/artist' },
}

function firstImage(value: unknown): string | null {
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  if (typeof value === 'string' && value.length > 0) return value
  return null
}

function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

export async function buildEntityMetadata(kind: EntityKind, id: string): Promise<Metadata> {
  const config = ENTITY_CONFIG[kind]
  const siteUrl = getSiteUrl()
  const canonical = `${siteUrl}${config.pathPrefix}/${id}`

  // A missing record or an unreachable database must still yield valid tags.
  const fallback: Metadata = {
    // `absolute` bypasses the root layout's "%s | Drift" template, which would
    // otherwise append the brand a second time.
    title: { absolute: `${SITE_NAME} - Electronic Music Discovery` },
    description: SITE_DESCRIPTION,
    alternates: { canonical },
  }

  const supabase = createPublicClient()
  if (!supabase) return fallback

  try {
    // Columns differ per entity, so a dynamic column list would defeat the typed
    // query parser. Select everything and read the fields we need dynamically.
    const { data, error } = await supabase
      .from(config.table)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return fallback

    const record = data as unknown as Record<string, unknown>
    const name = typeof record[config.titleColumn] === 'string'
      ? (record[config.titleColumn] as string)
      : null

    if (!name) return fallback

    const rawDescription = record[config.descriptionColumn]
    const description = typeof rawDescription === 'string' && rawDescription.trim()
      ? truncate(rawDescription)
      : SITE_DESCRIPTION

    const image = firstImage(record.images)
    // The root layout applies a "%s | Drift" template, so the page title is just
    // the entity name. Open Graph has no template, so it carries the brand itself.
    const socialTitle = `${name} | ${SITE_NAME}`

    return {
      title: name,
      description,
      alternates: { canonical },
      openGraph: {
        title: socialTitle,
        description,
        url: canonical,
        siteName: SITE_NAME,
        type: 'website',
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title: socialTitle,
        description,
        ...(image ? { images: [image] } : {}),
      },
    }
  } catch (err) {
    console.error(`Error building ${kind} metadata:`, err)
    return fallback
  }
}
