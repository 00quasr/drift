'use client'

import { useState } from 'react'
import { Music, ChevronDown, ChevronUp } from 'lucide-react'

interface Artist {
  id: string
  name: string
  genres?: string[]
  performance_order?: number
  performance_type?: string
}

interface EventLineupProps {
  artists: Artist[]
}

export default function EventLineup({ artists }: EventLineupProps) {
  const [showFullLineup, setShowFullLineup] = useState(false)
  
  // Sort artists by performance order
  const sortedArtists = [...artists].sort((a, b) => (a.performance_order || 999) - (b.performance_order || 999))
  
  // Show first 2 artists initially, or all if less than 3
  const displayedArtists = showFullLineup || artists.length <= 2 ? sortedArtists : sortedArtists.slice(0, 2)
  const hasMoreArtists = artists.length > 2

  return (
    <div className="relative bg-black border-2 border-white/20 p-6">
      <div className="absolute top-4 right-4 w-6 h-6 z-10">
        <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
      </div>
      
      <h2 className="text-2xl font-bold tracking-widest uppercase mb-6 text-white">
        LINEUP
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedArtists.map((artist) => (
          <div key={artist.id} className="bg-white/5 border border-white/20 p-4 hover:bg-white/10 transition-all duration-200">
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6 text-white" />
              <div className="flex-1">
                <div className="text-white font-bold tracking-wider uppercase">
                  {artist.name}
                </div>
                {artist.genres && artist.genres.length > 0 && (
                  <div className="text-white/60 text-sm font-bold tracking-widest uppercase">
                    {artist.genres.slice(0, 2).join(', ')}
                  </div>
                )}
                {artist.performance_type && (
                  <div className="text-white/40 text-xs font-bold tracking-widest uppercase mt-1">
                    {artist.performance_type}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMoreArtists && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowFullLineup(!showFullLineup)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 font-bold tracking-wider uppercase"
          >
            {showFullLineup ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Full Lineup ({artists.length} Artists)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}