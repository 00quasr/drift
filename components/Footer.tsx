import Link from 'next/link'
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-medium tracking-tight text-white">
                DRIFT
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              The underground music platform for discovering venues, events, and artists. 
              Connect with the global electronic music community.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { icon: Youtube, href: "https://youtube.com", label: "YouTube" }
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">
              Discover
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/events", label: "Events" },
                { href: "/venues", label: "Venues" },
                { href: "/artists", label: "Artists" },
                { href: "/explore", label: "Explore" }
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link 
                    href={href} 
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">
              Community
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/dashboard", label: "For Creators" },
                { href: "/support", label: "Support" }
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link 
                    href={href} 
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">
              Stay Connected
            </h4>
            <p className="text-slate-400 text-sm mb-6">
              Get the latest updates on events and artists in your area.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-l-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors duration-200"
                />
                <button className="px-6 py-3 bg-white text-black rounded-r-lg hover:bg-slate-100 transition-colors duration-200">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-3 text-slate-400">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p>Connecting the global</p>
                <p>electronic music scene</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Drift. Crafted with ❤️ for the underground music community.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-8">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/cookies", label: "Cookie Policy" }
              ].map(({ href, label }) => (
                <Link 
                  key={href}
                  href={href} 
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 