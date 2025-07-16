'use client'

import Link from 'next/link'
import { Search, Menu, X, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-md border-b-2 border-white/20' 
          : 'bg-black/90 border-b-2 border-white/10'
      }`}
    >

      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Name Only */}
          <Link href="/" className="group">
            <span className="text-xl font-bold tracking-widest text-white uppercase hover:text-white/80 transition-colors duration-200">
              DRIFT
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {[
              { href: '/', label: 'HOME' },
              { href: '/explore', label: 'EXPLORE' },
              { href: '/events', label: 'EVENTS' },
              { href: '/venues', label: 'VENUES' },
              { href: '/artists', label: 'ARTISTS' }
            ].map(({ href, label }) => (
              <Link 
                key={href}
                href={href} 
                className="relative group text-sm font-bold tracking-wider text-white/80 hover:text-white transition-colors duration-200 uppercase"
              >
                {label}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/50 transition-all duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Notifications */}
            <button
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/50 transition-all duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white border border-black animate-pulse" />
            </button>
            
            <div className="hidden lg:flex items-center space-x-3">
              <Link 
                href="/auth/login" 
                className="px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white border border-white/30 hover:border-white/60 transition-all duration-200 uppercase h-10 flex items-center"
              >
                SIGN IN
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 bg-white text-black text-sm font-bold tracking-wider hover:bg-cyan-400 hover:text-black transition-all duration-200 uppercase border-2 border-white hover:border-cyan-400 h-10 flex items-center"
              >
                REGISTER
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 border-b-2 border-white/20">
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
                <button
                  key={suggestion}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-sm text-white font-bold tracking-wider transition-all duration-200 uppercase"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 border-b-2 border-white/20">
          <div className="px-6 py-6 space-y-4">
            {[
              { href: '/', label: 'HOME' },
              { href: '/explore', label: 'EXPLORE' },
              { href: '/events', label: 'EVENTS' },
              { href: '/venues', label: 'VENUES' },
              { href: '/artists', label: 'ARTISTS' }
            ].map(({ href, label }) => (
              <Link 
                key={href}
                href={href} 
                className="block text-lg font-bold tracking-wider text-white/80 hover:text-cyan-400 transition-colors duration-200 uppercase py-2 border-l-2 border-transparent hover:border-cyan-400 pl-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-white/20 space-y-3">
              <Link 
                href="/auth/login" 
                className="block w-full text-center px-4 py-2 text-sm font-bold tracking-wider text-white/80 hover:text-white border border-white/30 hover:border-white/60 transition-all duration-200 uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                SIGN IN
              </Link>
              <Link 
                href="/auth/register" 
                className="block w-full text-center px-4 py-2 bg-white text-black text-sm font-bold tracking-wider hover:bg-cyan-400 hover:text-black transition-all duration-200 uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                REGISTER
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 