import Link from 'next/link'
import { Instagram, Twitter, Facebook, Youtube, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-black border-t-2 border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <span className="text-2xl font-bold tracking-widest text-white uppercase">
                DRIFT
              </span>
            </div>
            <p className="text-white/80 leading-relaxed mb-6 max-w-sm font-medium tracking-wide">
              THE UNDERGROUND MUSIC PLATFORM FOR DISCOVERING VENUES, EVENTS, AND ARTISTS. 
              CONNECT WITH THE GLOBAL ELECTRONIC MUSIC COMMUNITY.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 tracking-widest uppercase">DISCOVER</h3>
            <div className="space-y-3">
              {[
                { href: '/events', label: 'EVENTS' },
                { href: '/venues', label: 'VENUES' },
                { href: '/artists', label: 'ARTISTS' },
                { href: '/explore', label: 'EXPLORE' }
              ].map(({ href, label }) => (
                <Link 
                  key={href}
                  href={href} 
                  className="block text-white/80 hover:text-white transition-colors duration-200 font-bold tracking-wider uppercase text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 tracking-widest uppercase">COMMUNITY</h3>
            <div className="space-y-3">
              {[
                { href: '/about', label: 'ABOUT US' },
                { href: '/contact', label: 'CONTACT' },
                { href: '/blog', label: 'BLOG' },
                { href: '/help', label: 'HELP CENTER' }
              ].map(({ href, label }) => (
                <Link 
                  key={href}
                  href={href} 
                  className="block text-white/80 hover:text-white transition-colors duration-200 font-bold tracking-wider uppercase text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 tracking-widest uppercase">LEGAL</h3>
            <div className="space-y-3">
              {[
                { href: '/privacy', label: 'PRIVACY POLICY' },
                { href: '/terms', label: 'TERMS OF SERVICE' },
                { href: '/cookies', label: 'COOKIE POLICY' },
                { href: '/guidelines', label: 'COMMUNITY GUIDELINES' }
              ].map(({ href, label }) => (
                <Link 
                  key={href}
                  href={href} 
                  className="block text-white/80 hover:text-white transition-colors duration-200 font-bold tracking-wider uppercase text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t-2 border-white/20 pt-12 mb-12">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold text-white mb-4 tracking-widest uppercase">
                STAY IN THE LOOP
              </h3>
              <p className="text-white/80 mb-6 font-medium tracking-wide">
                GET THE LATEST EVENTS, VENUE OPENINGS, AND UNDERGROUND MUSIC NEWS DELIVERED TO YOUR INBOX.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                  <input
                    type="email"
                    placeholder="YOUR EMAIL ADDRESS"
                    className="w-full pl-12 pr-4 py-3 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors duration-200 font-bold tracking-wider uppercase"
                  />
                </div>
                <button className="px-6 py-3 bg-white text-black font-bold tracking-widest hover:bg-white/90 transition-all duration-200 uppercase border-2 border-white">
                  SUBSCRIBE
                </button>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-6 lg:pt-12">
              {[
                { href: "https://instagram.com", label: "INSTAGRAM" },
                { href: "https://twitter.com", label: "TWITTER" },
                { href: "https://facebook.com", label: "FACEBOOK" },
                { href: "https://youtube.com", label: "YOUTUBE" }
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-200 font-bold tracking-wider uppercase text-sm"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t-2 border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <p className="text-white/60 text-sm font-bold tracking-widest uppercase">
                © 2024 DRIFT. ALL RIGHTS RESERVED.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm font-bold tracking-widest uppercase">
                  GLOBAL UNDERGROUND
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white animate-pulse" />
                <span className="text-white/60 text-sm font-bold tracking-widest uppercase">
                  SYSTEM STATUS: ONLINE
                </span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <span className="text-white/60 text-sm font-bold tracking-widest uppercase">
                v2.0.24
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 