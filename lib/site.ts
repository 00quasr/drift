/**
 * Canonical public origin for the site.
 *
 * Used anywhere we need an absolute URL (sitemap, robots, Open Graph tags).
 * NEXT_PUBLIC_SITE_URL must be set in production. Preview deployments fall back
 * to the per-deployment Vercel URL so they describe themselves rather than
 * claiming production's canonical URLs; localhost is the last resort for local
 * development and CI builds.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (configured) {
    // Trailing slashes break URL concatenation in the sitemap.
    return configured.replace(/\/+$/, '')
  }

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelUrl) {
    // Vercel supplies this without a protocol.
    return `https://${vercelUrl.replace(/\/+$/, '')}`
  }

  return 'http://localhost:3000'
}

export const SITE_NAME = 'Drift'
export const SITE_DESCRIPTION =
  'Rate and discover the best electronic music venues, events, and artists.'
