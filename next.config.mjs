/** @type {import('next').NextConfig} */

// Only NEXT_PUBLIC_* vars belong in the client bundle, and Next inlines those
// automatically. Server-only secrets (service role key, OpenAI key) are read from
// process.env at runtime on the server and must never be listed here - an `env`
// block would inline them into any client component that referenced them.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    port: '',
    pathname: '/**',
  },
]

// Derive the storage host from the configured project rather than hardcoding it.
if (supabaseUrl) {
  remotePatterns.push({
    protocol: 'https',
    hostname: new URL(supabaseUrl).hostname,
    port: '',
    pathname: '/storage/v1/object/public/**',
  })
}

const nextConfig = {
  images: {
    remotePatterns,
  },
}

export default nextConfig
