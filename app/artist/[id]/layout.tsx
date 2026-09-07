import type { Metadata } from 'next'
import { buildEntityMetadata } from '@/lib/seo'

// The page itself is a client component, so metadata is generated here.
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  return buildEntityMetadata('artist', params.id)
}

export default function ArtistDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
