'use client'

import Link from 'next/link'
import { Search, Menu, X, Bell, User, LogOut, MapPin, Calendar, Music } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ venues: [], events: [], artists: [] })
  const [isSearching, setIsSearching] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  
  const isLandingPage = pathname === '/'

  // Debounced search function
  const searchContent = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ venues: [], events: [], artists: [] })
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search calls
  useEffect(() => {
    const timer = setTimeout(() => {
      searchContent(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchContent])

  const handleSearchSelect = (type: string, slug: string) => {
    setSearchOpen(false)
    setSearchQuery('')
    router.push(`/${type}/${slug}`)
  }

  // Simplified scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setScrolled(scrollPosition > 100)
    }
    
    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { href: '/', label: 'HOME' },
    { href: '/explore', label: 'EXPLORE' },
    { href: '/events', label: 'EVENTS' },
    { href: '/venues', label: 'VENUES' },
    { href: '/artists', label: 'ARTISTS' }
  ]

  const GeometricBorder = ({ isActive }: { isActive: boolean }) => (
    <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${isActive ? 'opacity-60' : 'opacity-0'}`}>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/80" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/80" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/80" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/80" />
    </div>
  )

  const ScanLine = ({ isActive }: { isActive: boolean }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className={`absolute top-0 left-0 h-px bg-white transition-opacity duration-200 ${isActive ? 'opacity-30' : 'opacity-0'}`}
        style={{ width: '100%' }}
        animate={isActive ? { 
          x: ['-100%', '0%', '100%'],
          scaleX: [0, 1, 0]
        } : { 
          x: '-100%',
          scaleX: 0
        }}
        transition={{ 
          duration: 1.2, 
          ease: 'easeInOut',
          times: [0, 0.5, 1]
        }}
      />
    </div>
  )

  // Determine header visibility and styling
  const shouldShowHeader = !isLandingPage || scrolled

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
        ${shouldShowHeader ? 'translate-y-0' : '-translate-y-full'}
        ${scrolled 
          ? 'bg-black/95 backdrop-blur-md border-b-2 border-white/20' 
          : 'bg-black/90 border-b-2 border-white/10'
        }
      `}
    >
      {/* Scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(255,255,255,0.02)_100%)] bg-[length:100%_2px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Name Only */}
          <Link href="/" className="group">
            <span className="text-xl font-bold tracking-widest text-white uppercase hover:text-white/80 transition-colors duration-200">
              DRIFT
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map(({ href, label }) => (
              <div 
                key={href}
                className="relative"
                onMouseEnter={() => setHoveredItem(label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link href={href}>
                  <motion.div
                    className={`
                      relative px-4 py-2 font-mono text-sm font-bold tracking-wider text-white/80 uppercase
                      border border-white/20 bg-black/50 backdrop-blur-sm
                      transition-all duration-300 ease-out overflow-hidden
                      ${hoveredItem === label 
                        ? 'border-white text-white bg-black/80' 
                        : 'hover:border-white/60 hover:bg-black/70 hover:text-white'
                      }
                    `}
                    style={{
                      clipPath: hoveredItem === label 
                        ? 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                        : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">{label}</span>
                    
                    {/* Geometric corners */}
                    <GeometricBorder isActive={hoveredItem === label} />
                    
                    {/* Scan line effect */}
                    <ScanLine isActive={hoveredItem === label} />
                    
                    {/* Subtle glow effect */}
                    <div className={`absolute inset-0 bg-white/5 transition-opacity duration-200 ${hoveredItem === label ? 'opacity-20' : 'opacity-0'}`} />
                  </motion.div>
                </Link>
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <motion.button
              onClick={() => setSearchOpen(!searchOpen)}
              className="relative p-2 text-white/80 hover:text-white border border-white/20 hover:border-white/50 bg-black/50 backdrop-blur-sm transition-all duration-200 overflow-hidden"
              aria-label="Search"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5 relative z-10" />
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
            
            {/* Notifications */}
            <motion.button
              className="relative p-2 text-white/80 hover:text-white border border-white/20 hover:border-white/50 bg-black/50 backdrop-blur-sm transition-all duration-200 overflow-hidden"
              aria-label="Notifications"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 relative z-10" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white border border-black animate-pulse" />
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
            
            <div className="hidden lg:flex items-center space-x-3">
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="relative px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white border border-white/30 hover:border-white/60 bg-black/50 backdrop-blur-sm transition-all duration-200 uppercase h-10 flex items-center space-x-2 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{user.email}</span>
                    <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </motion.button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-black border border-white/20 shadow-lg z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs text-white/60 uppercase tracking-wider border-b border-white/10">
                          {user.role} {user.is_verified && '• VERIFIED'}
                        </div>
                        <Link 
                          href="/profile" 
                          className="block px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors uppercase tracking-wider"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        {(user.role !== 'fan' && user.is_verified) && (
                          <Link 
                            href="/dashboard" 
                            className="block px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors uppercase tracking-wider"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                        )}
                        {user.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            className="block px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors uppercase tracking-wider"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Admin
                          </Link>
                        )}
                        <button
                          onClick={async () => {
                            await signOut()
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors uppercase tracking-wider flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <motion.div
                      className="relative px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white border border-white/30 hover:border-white/60 bg-black/50 backdrop-blur-sm transition-all duration-200 uppercase h-10 flex items-center overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">SIGN IN</span>
                      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                    </motion.div>
                  </Link>
                  <Link href="/auth/register">
                    <motion.div
                      className="relative px-4 py-2 bg-white text-black text-sm font-bold tracking-wider hover:bg-white/90 transition-all duration-200 uppercase border-2 border-white h-10 flex items-center overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">REGISTER</span>
                    </motion.div>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative p-2 text-white/80 hover:text-white border border-white/20 bg-black/50 backdrop-blur-sm transition-all duration-200 overflow-hidden"
              aria-label="Menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 relative z-10" /> : <Menu className="w-5 h-5 relative z-10" />}
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <motion.div
          className="absolute top-full left-0 right-0 bg-black/95 border-b-2 border-white/20 backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
              <input
                type="text"
                placeholder="SEARCH EVENTS, VENUES, ARTISTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors duration-200 font-bold tracking-wider uppercase"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className={`w-2 h-2 ${isSearching ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
              </div>
            </div>
            
            {/* Search Results */}
            {searchQuery && (
              <div className="mt-4 space-y-4">
                {/* Venues */}
                {searchResults.venues.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-sm font-bold tracking-wider uppercase">
                        VENUES ({searchResults.venues.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.venues.map((venue: any) => (
                        <motion.button
                          key={venue.id}
                          onClick={() => handleSearchSelect('venue', venue.slug)}
                          className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="font-bold tracking-wider uppercase text-white">
                            {venue.name}
                          </div>
                          <div className="text-white/60 text-sm">
                            {venue.location} • {venue.type}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {searchResults.events.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-sm font-bold tracking-wider uppercase">
                        EVENTS ({searchResults.events.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.events.map((event: any) => (
                        <motion.button
                          key={event.id}
                          onClick={() => handleSearchSelect('event', event.slug)}
                          className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="font-bold tracking-wider uppercase text-white">
                            {event.title}
                          </div>
                          <div className="text-white/60 text-sm">
                            {new Date(event.start_date).toLocaleDateString()} • {event.venue?.name}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Artists */}
                {searchResults.artists.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-sm font-bold tracking-wider uppercase">
                        ARTISTS ({searchResults.artists.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.artists.map((artist: any) => (
                        <motion.button
                          key={artist.id}
                          onClick={() => handleSearchSelect('artist', artist.slug)}
                          className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="font-bold tracking-wider uppercase text-white">
                            {artist.name}
                          </div>
                          <div className="text-white/60 text-sm">
                            {artist.genres?.join(', ')} • {artist.origin}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {!isSearching && searchQuery && 
                 searchResults.venues.length === 0 && 
                 searchResults.events.length === 0 && 
                 searchResults.artists.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-white/60 font-bold tracking-wider uppercase">
                      NO RESULTS FOUND
                    </div>
                    <div className="text-white/40 text-sm mt-1">
                      Try different keywords or browse our categories
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </motion.div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          className="lg:hidden absolute top-full left-0 right-0 bg-black/95 border-b-2 border-white/20 backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-6 py-6 space-y-4">
            {navigationItems.map(({ href, label }) => (
              <motion.div key={href} whileHover={{ x: 4 }}>
                <Link 
                  href={href} 
                  className="block text-lg font-bold tracking-wider text-white/80 hover:text-white transition-colors duration-200 uppercase py-2 border-l-2 border-transparent hover:border-white pl-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
            
            <div className="pt-4 border-t border-white/20 space-y-3">
              {user ? (
                <>
                  <div className="px-4 py-2 text-white/60 text-sm uppercase tracking-wider">
                    Welcome, {user.email}
                  </div>
                  <Link href="/profile">
                    <motion.div 
                      className="block w-full text-left px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white transition-all duration-200 uppercase"
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Profile
                    </motion.div>
                  </Link>
                  {(user.role !== 'fan' && user.is_verified) && (
                    <Link href="/dashboard">
                      <motion.div 
                        className="block w-full text-left px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white transition-all duration-200 uppercase"
                        onClick={() => setMobileMenuOpen(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Dashboard
                      </motion.div>
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin">
                      <motion.div 
                        className="block w-full text-left px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white transition-all duration-200 uppercase"
                        onClick={() => setMobileMenuOpen(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Admin
                      </motion.div>
                    </Link>
                  )}
                  <motion.button
                    onClick={async () => {
                      await signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white transition-all duration-200 uppercase flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <motion.div 
                      className="block w-full text-center px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white border border-white/30 hover:border-white/60 transition-all duration-200 uppercase"
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      SIGN IN
                    </motion.div>
                  </Link>
                  <Link href="/auth/register">
                    <motion.div 
                      className="block w-full text-center px-4 py-2 bg-white text-black text-sm font-bold tracking-wider hover:bg-white/90 transition-all duration-200 uppercase"
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      REGISTER
                    </motion.div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
} 