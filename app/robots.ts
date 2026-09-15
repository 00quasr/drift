import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Authenticated and administrative surfaces have no business in an index.
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/settings/',
          '/auth/',
          '/messages/',
          '/events/manage',
          '/events/edit/',
          '/my-venue',
          '/artist-profile',
          '/verification',
          '/unauthorized',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
