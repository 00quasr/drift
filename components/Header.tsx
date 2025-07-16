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
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled 
          ? 'bg-black/95 border-b border-zinc-800/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold tracking-tight text-white">
              DRIFT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {[
              { href: '/events', label: 'Events' },
              { href: '/venues', label: 'Venues' },
              { href: '/artists', label: 'Artists' },
              { href: '/explore', label: 'Explore' }
            ].map(({ href, label }) => (
              <Link 
                key={href}
                href={href} 
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Notifications */}
            <button
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            <div className="hidden lg:flex items-center space-x-3">
              <Link 
                href="/auth/login" 
                className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors duration-200"
              >
                Register
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events, venues, artists..."
                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-600 transition-colors duration-200"
                autoFocus
              />
            </div>
            
            {/* Quick suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Techno Events', 'Berlin Venues', 'Top Artists', 'This Weekend'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm text-zinc-300 transition-colors duration-200"
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 border-b border-zinc-800">
          <nav className="max-w-7xl mx-auto px-6 py-6 space-y-1">
            {[
              { href: '/events', label: 'Events' },
              { href: '/venues', label: 'Venues' },
              { href: '/artists', label: 'Artists' },
              { href: '/explore', label: 'Explore' }
            ].map(({ href, label }) => (
              <Link 
                key={href}
                href={href} 
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t border-zinc-800 space-y-1">
              <Link 
                href="/auth/login" 
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="block px-3 py-2 text-sm font-medium bg-white text-black rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
} 