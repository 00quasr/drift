'use client'

import Link from 'next/link'
import { Search, Menu, X, Bell, User, LogOut } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ venues: [], events: [], artists: [] })
  const [isSearching, setIsSearching] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  
  const isLandingPage = pathname === '/' || pathname.startsWith('/auth/')

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

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setScrolled(scrollPosition > 20)
    }
    
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { href: '/explore', label: 'Explore' },
    { href: '/events', label: 'Events' },
    { href: '/artists', label: 'Artists' },
    { href: '/venues', label: 'Venues' }
  ]

  return (
    <motion.header 
      className={`
        fixed top-4 left-4 right-4 z-50 transition-all duration-500 ease-out rounded-3xl
        ${scrolled 
          ? 'bg-black/[0.2] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-3xl border border-white/[0.12] shadow-lg' 
          : isLandingPage 
            ? 'bg-transparent border border-transparent' 
            : 'bg-black/[0.2] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.1]'
        }
      `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="group">
              <motion.span 
                className="text-xl font-semibold text-white/95 hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
              >
                DRIFT<span className="text-white/60 text-sm">®</span>
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map(({ href, label }) => (
                <Link 
                  key={href} 
                  href={href}
                  className={`
                    text-sm font-medium transition-all duration-300
                    ${pathname === href 
                      ? 'text-white' 
                      : 'text-white/70 hover:text-white'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <motion.button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-white/70 hover:text-white hover:bg-white/[0.04] rounded-2xl backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            
            {/* Notifications */}
            <motion.button
              className="relative p-2.5 text-white/70 hover:text-white hover:bg-white/[0.04] rounded-2xl backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-90 animate-pulse" />
            </motion.button>
            
            {/* User Section */}
            <div className="hidden md:flex items-center space-x-3">
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
              ) : user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/[0.04] rounded-2xl backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {user.avatar_url ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20">
                        <Image
                          src={user.avatar_url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">
                      {user.display_name || user.email?.split('@')[0]}
                    </span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        className="absolute -right-12 top-14 w-64 bg-black/[0.3] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-3xl border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, y: -15, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.92 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <div className="p-4">
                          {/* User info header */}
                          <div className="flex items-center space-x-3 pb-4 mb-3 border-b border-white/[0.06]">
                            {user.avatar_url ? (
                              <div className="relative w-10 h-10 rounded-2xl overflow-hidden ring-1 ring-white/10">
                                <Image
                                  src={user.avatar_url}
                                  alt="Profile"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-white/[0.08] flex items-center justify-center">
                                <User className="w-5 h-5 text-white/60" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white/95 truncate">
                                {user.display_name || user.email?.split('@')[0]}
                              </div>
                              <div className="text-xs text-white/50 capitalize">
                                {user.role} {user.is_verified && '• Verified'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Navigation links */}
                          <div className="space-y-1">
                                                         <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                              <Link 
                                href="/profile/edit" 
                                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-300 group"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                Profile
                              </Link>
                             </motion.div>
                            
                            {/* Role-specific links */}
                            {user.role === 'artist' && (
                              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                <Link 
                                  href="/artist-profile" 
                                  className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-300"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  My Artist Profile
                                </Link>
                              </motion.div>
                            )}
                            
                            {user.role === 'club_owner' && (
                              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                <Link 
                                  href="/my-venue" 
                                  className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-300"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  My Venue
                                </Link>
                              </motion.div>
                            )}
                            
                            {user.role === 'promoter' && (
                              <>
                                <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                  <Link 
                                    href="/events/manage" 
                                    className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-300"
                                    onClick={() => setUserMenuOpen(false)}
                                  >
                                    My Events
                                  </Link>
                                </motion.div>
                                <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                  <Link 
                                    href="/events/create" 
                                    className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-300"
                                    onClick={() => setUserMenuOpen(false)}
                                  >
                                    Create Event
                                  </Link>
                                </motion.div>
                              </>
                            )}
                            
                            {user.role === 'admin' && (
                              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                <Link 
                                  href="/dashboard" 
                                  className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-300"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  Dashboard
                                </Link>
                              </motion.div>
                            )}
                            
                            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                              <Link 
                                href="/settings" 
                                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-300"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                Settings
                              </Link>
                            </motion.div>
                          </div>
                          
                          {/* Sign out */}
                          <div className="border-t border-white/[0.06] mt-3 pt-3">
                            <motion.button
                              onClick={async () => {
                                await signOut()
                                setUserMenuOpen(false)
                              }}
                              className="w-full text-left px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/[0.08] rounded-2xl transition-all duration-300 flex items-center space-x-3 group"
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <LogOut className="w-4 h-4 text-white/50 group-hover:text-red-400 transition-colors" />
                              <span className="group-hover:text-red-400 transition-colors">Sign Out</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <motion.button
                      className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign In
                    </motion.button>
                  </Link>
                  <Link href="/auth/register">
                    <motion.button
                      className="px-4 py-2 bg-white/95 hover:bg-white text-black text-sm font-medium rounded-2xl transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Join
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-white/70 hover:text-white hover:bg-white/[0.04] rounded-2xl backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-black/[0.3] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-3xl border border-white/[0.12] rounded-3xl mx-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, venues, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-3xl text-white placeholder-white/60 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.05] transition-all duration-300"
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Search Results */}
              {searchQuery && (
                <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
                  {/* Venues */}
                  {searchResults.venues.length > 0 && (
                    <div>
                      <h3 className="text-white/60 text-sm font-medium mb-3">Venues</h3>
                      <div className="space-y-2">
                        {searchResults.venues.map((venue: any) => (
                          <motion.button
                            key={venue.id}
                            onClick={() => handleSearchSelect('venue', venue.slug)}
                            className="w-full text-left p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-3xl border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-300"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="font-medium text-white">{venue.name}</div>
                            <div className="text-white/60 text-sm">{venue.location} • {venue.type}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {searchResults.events.length > 0 && (
                    <div>
                      <h3 className="text-white/60 text-sm font-medium mb-3">Events</h3>
                      <div className="space-y-2">
                        {searchResults.events.map((event: any) => (
                          <motion.button
                            key={event.id}
                            onClick={() => handleSearchSelect('event', event.slug)}
                            className="w-full text-left p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-3xl border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-300"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="font-medium text-white">{event.title}</div>
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
                      <h3 className="text-white/60 text-sm font-medium mb-3">Artists</h3>
                      <div className="space-y-2">
                        {searchResults.artists.map((artist: any) => (
                          <motion.button
                            key={artist.id}
                            onClick={() => handleSearchSelect('artist', artist.slug)}
                            className="w-full text-left p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-3xl border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-300"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="font-medium text-white">{artist.name}</div>
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
                      <div className="text-white/60">No results found</div>
                      <div className="text-white/40 text-sm mt-1">Try different keywords</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 mt-2 bg-black/[0.3] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-3xl border border-white/[0.12] rounded-3xl mx-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-6 py-6 space-y-4">
              {navigationItems.map(({ href, label }) => (
                <Link 
                  key={href}
                  href={href} 
                  className="block text-lg font-medium text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-white/60 text-sm flex items-center space-x-2">
                      {user.avatar_url && (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={user.avatar_url}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span>Welcome, {user.display_name || user.email?.split('@')[0]}</span>
                    </div>
                    
                    <Link href="/profile/edit">
                      <button 
                        className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </button>
                    </Link>
                    
                    <Link href="/settings">
                      <button 
                        className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Settings
                      </button>
                    </Link>
                    
                    <button
                      onClick={async () => {
                        await signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-200 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <button 
                        className="block w-full text-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </button>
                    </Link>
                    <Link href="/auth/register">
                      <button 
                        className="block w-full text-center px-4 py-3 bg-white/95 hover:bg-white text-black rounded-2xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Join
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
} 