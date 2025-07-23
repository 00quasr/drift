"use client"

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

interface MapboxMapProps {
  latitude?: number | null
  longitude?: number | null
  venueName?: string
  address?: string
  className?: string
}

export default function MapboxMap({ 
  latitude, 
  longitude, 
  venueName, 
  address, 
  className = "" 
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we have valid coordinates
    if (!latitude || !longitude || !mapContainer.current) {
      return
    }

    // Check for Mapbox access token
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    console.log('Mapbox token check:', {
      hasToken: !!accessToken,
      tokenStart: accessToken ? accessToken.substring(0, 10) + '...' : 'none',
      isPlaceholder: accessToken === 'your_mapbox_token_here'
    })
    
    if (!accessToken) {
      setError('Mapbox access token not configured in .env file')
      return
    }

    if (accessToken === 'your_mapbox_token_here') {
      setError('Please set a valid Mapbox access token in .env file')
      return
    }

    if (!accessToken.startsWith('pk.')) {
      setError('Invalid Mapbox token format. Token should start with "pk."')
      return
    }

    // Set the access token
    mapboxgl.accessToken = accessToken

    try {
      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark theme to match Drift design
        center: [longitude, latitude],
        zoom: 15,
        attributionControl: false // Remove attribution for cleaner look
      })

      // Add custom marker
      const marker = new mapboxgl.Marker({
        color: '#9B5DE5', // Primary purple color from Drift theme
        scale: 1.2
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current)

      // Add popup with venue info
      if (venueName || address) {
        const popup = new mapboxgl.Popup({
          offset: 25,
          className: 'mapbox-popup-drift'
        }).setHTML(`
          <div class="p-3 bg-black text-white border border-white/20">
            ${venueName ? `<h3 class="font-bold text-sm mb-1 tracking-wider uppercase">${venueName}</h3>` : ''}
            ${address ? `<p class="text-xs text-white/80 tracking-wide">${address}</p>` : ''}
          </div>
        `)
        
        marker.setPopup(popup)
      }

      // Handle map load
      map.current.on('load', () => {
        setMapLoaded(true)
      })

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setError('Failed to load map')
      })

    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Failed to initialize map')
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [latitude, longitude, venueName, address])

  // If no coordinates, show placeholder
  if (!latitude || !longitude) {
    return (
      <div className={`bg-white/5 border border-white/20 p-8 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-white/60 mx-auto mb-4" />
        <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
          LOCATION NOT AVAILABLE
        </div>
        <div className="text-white/60 font-medium tracking-wide text-xs mt-1">
          Coordinates not provided
        </div>
      </div>
    )
  }

  // If error occurred, show error state
  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/30 p-8 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
        <div className="text-red-400 font-bold tracking-wider uppercase text-sm">
          MAP UNAVAILABLE
        </div>
        <div className="text-red-400/80 font-medium tracking-wide text-xs mt-1">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-64 bg-black border border-white/20 rounded-none"
        style={{
          filter: 'contrast(1.1) brightness(0.9)' // Enhance the dark theme
        }}
      />
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
            LOADING MAP...
          </div>
        </div>
      )}
    </div>
  )
} 