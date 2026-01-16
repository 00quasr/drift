'use client'

import Link from 'next/link'
import { Search, Menu, X, Bell, User, LogOut, ArrowRight } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import ClassicLoader from '@/components/ui/loader'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { H3 } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ venues: [], events: [], artists: [] })
  const [isSearching, setIsSearching] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()

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

  const navigationItems = [
    {
      title: "EXPLORE",
      href: "/explore",
      description: "DISCOVER WHAT'S TRENDING IN ELECTRONIC MUSIC",
      items: [
        {
          title: "TRENDING",
          href: "/explore/trending",
          description: "Popular venues, events & artists"
        },
        {
          title: "THIS WEEKEND",
          href: "/explore/weekend",
          description: "Curated events this weekend"
        },
        {
          title: "LABELS & COLLECTIVES",
          href: "/explore/labels",
          description: "Music collectives and labels"
        }
      ],
    },
    {
      title: "EVENTS",
      href: "/events",
      description: "FIND YOUR NEXT ELECTRONIC MUSIC EXPERIENCE",
      items: [
        {
          title: "FESTIVALS",
          href: "/events/festivals",
          description: "Multi-day events with lineups"
        },
        {
          title: "MAP VIEW",
          href: "/events/map",
          description: "Browse events by location"
        }
      ],
    },
    {
      title: "ARTISTS",
      href: "/artists",
      description: "CONNECT WITH DJS AND PRODUCERS",
      items: [
        {
          title: "NEWCOMERS",
          href: "/artists/newcomers",
          description: "Recently added artists"
        },
        {
          title: "TRENDING ARTISTS",
          href: "/artists/trending",
          description: "Most followed and booked"
        }
      ],
    },
    {
      title: "VENUES",
      href: "/venues",
      description: "DISCOVER UNDERGROUND SPACES",
    },
  ]

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out bg-black border-b border-white/10"
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
            <NavigationMenu className="hidden md:flex h-full">
              <NavigationMenuList className="space-x-2">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger className="bg-transparent text-white/70 hover:text-white data-[state=open]:text-white font-bold tracking-wider uppercase text-sm">
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="!w-[450px] p-6">
                          <div className="flex flex-col gap-6">
                            <div className="flex flex-col">
                              <H3 variant="display" className="mb-2 text-white">{item.title}</H3>
                              <p className="text-white/60 text-sm font-bold tracking-wide uppercase leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            <div className="flex flex-col gap-3">
                              <NavigationMenuLink
                                href={item.href}
                                className="flex flex-row justify-between items-center hover:bg-white/10 py-3 px-4 rounded border border-white/20 hover:border-white/40 transition-all duration-200"
                              >
                                <div className="flex flex-col">
                                  <span className="text-white font-bold tracking-wider uppercase text-sm">VIEW ALL {item.title}</span>
                                  <span className="text-white/60 text-xs font-bold tracking-wide uppercase">Complete {item.title.toLowerCase()} section</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/60" />
                              </NavigationMenuLink>
                              {item.items?.map((subItem) => (
                                <NavigationMenuLink
                                  href={subItem.href}
                                  key={subItem.title}
                                  className="flex flex-row justify-between items-center hover:bg-white/10 py-3 px-4 rounded transition-all duration-200"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-white font-bold tracking-wider uppercase text-sm">{subItem.title}</span>
                                    <span className="text-white/60 text-xs font-bold tracking-wide uppercase">{subItem.description}</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-white/60" />
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        href={item.href}
                        className={cn(
                          "bg-transparent text-sm font-bold tracking-wider uppercase transition-all duration-300 px-4 py-2 rounded-md hover:bg-white/[0.04] inline-flex items-center justify-center",
                          pathname === item.href
                            ? 'text-white'
                            : 'text-white/70 hover:text-white'
                        )}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <motion.button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-3 md:p-2.5 text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            
            {/* Notifications - Only show when logged in */}
            {user && (
              <motion.button
                className="relative p-3 md:p-2.5 text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-90 animate-pulse" />
              </motion.button>
            )}
            
            {/* User Section */}
            <div className="hidden md:flex items-center space-x-3">
              {loading ? (
                <ClassicLoader />
              ) : user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <motion.button
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/[0.04] rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
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
                    <span className="max-w-[100px] truncate uppercase">
                      {user.display_name || user.email?.split('@')[0]}
                    </span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-4 w-64 bg-black border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, y: -15, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.92 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <div className="p-4">
                          {/* User info header */}
                          <Link href={`/profile/${user.id}`}>
                            <div className="flex items-center space-x-3 pb-4 mb-3 border-b border-white/[0.06] hover:bg-white/[0.02] rounded-lg p-2 -m-2 transition-colors duration-200 cursor-pointer">
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
                                <div className="text-sm font-medium text-white/95 truncate uppercase group-hover:text-white transition-colors">
                                  {user.display_name || user.email?.split('@')[0]}
                                </div>
                                <div className="text-xs text-white/50 uppercase group-hover:text-white/70 transition-colors">
                                  {user.role} {user.is_verified && '• VERIFIED'}
                                </div>
                              </div>
                            </div>
                          </Link>
                          
                          {/* Navigation links */}
                          <div className="space-y-1">
                                                         <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                              <Link 
                                href="/settings/profile" 
                                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300 group"
                              >
                                PROFILE
                              </Link>
                             </motion.div>
                            
                            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                              <Link 
                                href="/favorites" 
                                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300 group"
                              >
                                FAVORITES
                              </Link>
                            </motion.div>
                            
                            {/* Role-specific links */}
                            {user.role === 'artist' && (
                              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                <Link 
                                  href="/artist-profile" 
                                  className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300"
                                  >
                                  MY ARTIST PROFILE
                                </Link>
                              </motion.div>
                            )}
                            
                            {user.role === 'club_owner' && (
                              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                <Link 
                                  href="/my-venue" 
                                  className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300"
                                  >
                                  MY VENUE
                                </Link>
                              </motion.div>
                            )}
                            
                            {user.role === 'promoter' && (
                              <>
                                <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                  <Link 
                                    href="/events/manage" 
                                    className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300"
                                      >
                                    MY EVENTS
                                  </Link>
                                </motion.div>
                                <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                  <Link 
                                    href="/events/create" 
                                    className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300"
                                      >
                                    CREATE EVENT
                                  </Link>
                                </motion.div>
                              </>
                            )}
                            
                            {user.role === 'admin' && (
                              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                <Link 
                                  href="/dashboard" 
                                  className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300"
                                  >
                                  DASHBOARD
                                </Link>
                              </motion.div>
                            )}
                            
                            {/* Verification link for non-verified users */}
                            {user.role === 'fan' && (
                              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                                <Link 
                                  href="/verification" 
                                  className="block px-4 py-3 text-sm font-medium text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/[0.04] rounded-lg transition-all duration-300"
                                  >
                                  REQUEST VERIFICATION
                                </Link>
                              </motion.div>
                            )}
                            
                            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                              <Link 
                                href="/settings" 
                                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-300"
                              >
                                SETTINGS
                              </Link>
                            </motion.div>
                          </div>
                          
                          {/* Sign out */}
                          <div className="border-t border-white/[0.06] mt-3 pt-3">
                            <motion.button
                              onClick={signOut}
                              className="w-full text-left px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/[0.08] rounded-lg transition-all duration-300 flex items-center space-x-3 group"
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <LogOut className="w-4 h-4 text-white/50 group-hover:text-red-400 transition-colors" />
                              <span className="group-hover:text-red-400 transition-colors">SIGN OUT</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <motion.button
                      className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      SIGN IN
                    </motion.button>
                  </Link>
                  <Link href="/auth/signin?mode=register">
                    <motion.button
                      className="px-4 py-2 bg-white/95 hover:bg-white text-black text-sm font-medium rounded-lg transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      JOIN
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center"
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
            className="absolute top-full left-0 right-0 bg-black border-b border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, venues, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-base bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.05] transition-all duration-300"
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="scale-50">
                      <ClassicLoader />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Search Results */}
              {searchQuery && (
                <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
                  {/* Venues */}
                  {searchResults.venues.length > 0 && (
                    <div>
                      <H3 className="text-white/60 text-sm mb-3">VENUES</H3>
                      <div className="space-y-2">
                        {searchResults.venues.map((venue: any) => (
                          <motion.button
                            key={venue.id}
                            onClick={() => handleSearchSelect('venue', venue.slug)}
                            className="w-full text-left p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-300"
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
                      <H3 className="text-white/60 text-sm mb-3">EVENTS</H3>
                      <div className="space-y-2">
                        {searchResults.events.map((event: any) => (
                          <motion.button
                            key={event.id}
                            onClick={() => handleSearchSelect('event', event.slug)}
                            className="w-full text-left p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-300"
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
                      <H3 className="text-white/60 text-sm mb-3">ARTISTS</H3>
                      <div className="space-y-2">
                        {searchResults.artists.map((artist: any) => (
                          <motion.button
                            key={artist.id}
                            onClick={() => handleSearchSelect('artist', artist.slug)}
                            className="w-full text-left p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-300"
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
                      <div className="text-white/60">NO RESULTS FOUND</div>
                      <div className="text-white/40 text-sm mt-1">TRY DIFFERENT KEYWORDS</div>
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
            className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-6 py-6 space-y-4">
              {/* Main Navigation */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.title}>
                    {/* Main section link */}
                    <Link 
                      href={item.href} 
                      className="block px-4 py-4 text-lg font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                    
                    {/* Subsection links if they exist */}
                    {item.items && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.items.map((subItem) => (
                          <Link 
                            key={subItem.href}
                            href={subItem.href} 
                            className="block px-4 py-3 text-sm font-medium text-white/60 hover:text-white/80 hover:bg-white/[0.03] rounded-lg transition-all duration-200 min-h-[40px] flex items-center"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* User Section */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                {user ? (
                  <>
                    {/* User Profile Header */}
                    <Link href={`/profile/${user.id}`} onClick={() => setMobileMenuOpen(false)}>
                      <div className="px-4 py-3 text-white/60 text-sm flex items-center space-x-3 hover:bg-white/[0.02] rounded-lg transition-colors duration-200 cursor-pointer hover:text-white/80 min-h-[48px]">
                        {user.avatar_url ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/20">
                            <Image
                              src={user.avatar_url}
                              alt="Profile"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                            <User className="w-4 h-4 text-white/60" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-white/95 font-medium uppercase">
                            {user.display_name || user.email?.split('@')[0]}
                          </div>
                          <div className="text-xs text-white/50 uppercase">
                            {user.role} {user.is_verified && '• VERIFIED'}
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Role-specific navigation */}
                    {user.role === 'artist' && (
                      <Link href="/artist-profile">
                        <button 
                          className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          MY ARTIST PROFILE
                        </button>
                      </Link>
                    )}
                    
                    {user.role === 'club_owner' && (
                      <Link href="/my-venue">
                        <button 
                          className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          MY VENUE
                        </button>
                      </Link>
                    )}
                    
                    {user.role === 'promoter' && (
                      <>
                        <Link href="/events/manage">
                          <button 
                            className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            MY EVENTS
                          </button>
                        </Link>
                        <Link href="/events/create">
                          <button 
                            className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            CREATE EVENT
                          </button>
                        </Link>
                      </>
                    )}
                    
                    {user.role === 'admin' && (
                      <Link href="/dashboard">
                        <button 
                          className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          DASHBOARD
                        </button>
                      </Link>
                    )}
                    
                    {/* Verification link for non-verified users */}
                    {user.role === 'fan' && (
                      <Link href="/verification">
                        <button 
                          className="block w-full text-left px-4 py-4 text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          REQUEST VERIFICATION
                        </button>
                      </Link>
                    )}
                    
                    {/* Common user links */}
                    <Link href="/favorites">
                      <button 
                        className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        FAVORITES
                      </button>
                    </Link>
                    
                    <Link href="/settings/profile">
                      <button 
                        className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        PROFILE
                      </button>
                    </Link>
                    
                    <Link href="/settings">
                      <button 
                        className="block w-full text-left px-4 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        SETTINGS
                      </button>
                    </Link>
                    
                    {/* Sign out button */}
                    <div className="pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={async () => {
                          await signOut()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-4 text-white/70 hover:text-white hover:bg-red-500/[0.08] rounded-lg transition-all duration-200 flex items-center space-x-3 group min-h-[48px]"
                      >
                        <LogOut className="w-5 h-5 text-white/50 group-hover:text-red-400 transition-colors" />
                        <span className="group-hover:text-red-400 transition-colors">SIGN OUT</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <button 
                        className="block w-full text-center px-6 py-4 text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 font-medium min-h-[48px] flex items-center justify-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        SIGN IN
                      </button>
                    </Link>
                    <Link href="/auth/signin?mode=register">
                      <button 
                        className="block w-full text-center px-6 py-4 bg-white/95 hover:bg-white text-black rounded-lg transition-all duration-200 font-medium min-h-[48px] flex items-center justify-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        JOIN DRIFT
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