import type { Metadata } from 'next'
import { buildEntityMetadata } from '@/lib/seo'

// The page itself is a client component, so metadata is generated here.
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  return buildEntityMetadata('event', params.id)
}

export default function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
