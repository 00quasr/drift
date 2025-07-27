"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  // Redirect to the new unified signin page
  router.push('/auth/signin')
  
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-white/80 font-bold tracking-wider uppercase">
          Redirecting to sign in...
        </p>
        <Link 
          href="/auth/signin"
          className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold tracking-wider uppercase"
        >
          Click here if not redirected automatically
        </Link>
      </div>
    </div>
  )
} 