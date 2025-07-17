'use client'

import Link from 'next/link'
import { Search, Menu, X, Bell, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  
  const isLandingPage = pathname === '/'

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
    <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />
    </div>
  )

  const ScanLine = ({ isActive }: { isActive: boolean }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className={`absolute top-0 left-0 h-px bg-white transition-opacity duration-200 ${isActive ? 'opacity-60' : 'opacity-0'}`}
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
                        ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                        : 'hover:border-white/40 hover:bg-white/5 hover:text-white'
                      }
                    `}
                    style={{
                      clipPath: hoveredItem === label 
                        ? 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
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
                    
                    {/* Glitch background */}
                    <div className={`absolute inset-0 bg-white/5 transition-opacity duration-200 ${hoveredItem === label ? 'opacity-100' : 'opacity-0'}`} />
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
                    <span className="relative z-10">{user.full_name || user.email}</span>
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
                className="w-full pl-12 pr-4 py-3 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors duration-200 font-bold tracking-wider uppercase"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-white animate-pulse" />
              </div>
            </div>
            
            {/* Quick suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['TECHNO EVENTS', 'BERLIN VENUES', 'TOP ARTISTS', 'THIS WEEKEND'].map((suggestion) => (
                <motion.button
                  key={suggestion}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-sm text-white font-bold tracking-wider transition-all duration-200 uppercase"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
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
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
} 