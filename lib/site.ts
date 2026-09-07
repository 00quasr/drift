/**
 * Canonical public origin for the site.
 *
 * Used anywhere we need an absolute URL (sitemap, robots, Open Graph tags).
 * NEXT_PUBLIC_SITE_URL must be set in production - the localhost fallback only
 * keeps local development and CI builds working.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (configured) {
    // Trailing slashes break URL concatenation in the sitemap.
    return configured.replace(/\/+$/, '')
  }

  return 'http://localhost:3000'
}

export const SITE_NAME = 'Drift'
export const SITE_DESCRIPTION =
  'Rate and discover the best electronic music venues, events, and artists.'
