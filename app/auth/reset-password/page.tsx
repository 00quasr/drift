"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/auth"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasValidToken, setHasValidToken] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const hasInitialized = useRef(false)

  const router = useRouter()

  // Process recovery token and check session on mount
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const processToken = async () => {
      const hash = window.location.hash

      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1))

        // Check for errors first
        const errorParam = hashParams.get('error')
        const errorCode = hashParams.get('error_code')

        if (errorParam || errorCode) {
          console.error('Recovery link error:', errorParam, errorCode)
          setHasValidToken(false)
          setIsReady(true)
          window.history.replaceState(null, '', window.location.pathname)
          return
        }

        // Check for access token
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken) {
          console.log('Found access token, type:', type)
          // Store the token for use in password update
          setAccessToken(accessToken)
          setHasValidToken(true)
          setIsReady(true)
          // Clear hash from URL for security
          window.history.replaceState(null, '', window.location.pathname)
          return
        }
      }

      // No hash - check for existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('Existing session found')
        setHasValidToken(true)
      } else {
        console.log('No session found')
        setHasValidToken(false)
      }
      setIsReady(true)
    }

    processToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError("Password is required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter")
      return
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter")
      return
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Use API endpoint with access token
      const response = await fetch('/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          password
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password')
      }

      setSuccess(true)

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin")
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while initializing
  if (!isReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
            Verifying reset link...
          </div>
        </div>
      </div>
    )
  }

  // Show error if no valid token and no session
  if (!hasValidToken) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden">
        <div className="flex min-h-screen">
          <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
            <div className="w-full max-w-md text-center">
              {/* Logo */}
              <div className="mb-12">
                <Link href="/" className="inline-block">
                  <motion.div
                    className="text-3xl font-bold tracking-wider text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    DRIFT<span className="text-white/60 text-lg">®</span>
                  </motion.div>
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-bold tracking-wider mb-4 uppercase">
                  Invalid or Expired Link
                </h1>
                <p className="text-white/70 font-medium tracking-wider uppercase text-sm mb-8">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>

                <motion.button
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full py-4 bg-white text-black font-bold tracking-wider uppercase text-sm rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Request New Link
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-12">
              <Link href="/" className="inline-block">
                <motion.div
                  className="text-3xl font-bold tracking-wider text-white"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  DRIFT<span className="text-white/60 text-lg">®</span>
                </motion.div>
              </Link>
            </div>

            {!success ? (
              <>
                {/* Form Header */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="text-4xl font-bold tracking-wider mb-4 uppercase">
                    Create New Password
                  </h1>
                  <p className="text-white/70 font-medium tracking-wider uppercase text-sm">
                    Enter your new password below
                  </p>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <p className="text-red-400 font-bold tracking-wider uppercase text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                        placeholder="Enter new password"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-white/50 text-xs tracking-wider">
                      8+ characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-white text-black font-bold tracking-wider uppercase text-sm rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      "Updating..."
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="inline-block mb-6"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400" />
                  </motion.div>
                  <h1 className="text-4xl font-bold tracking-wider mb-4 uppercase">
                    Password Updated
                  </h1>
                  <p className="text-white/70 font-medium tracking-wider uppercase text-sm mb-6">
                    Your password has been successfully reset
                  </p>
                  <p className="text-white/60 font-medium tracking-wider text-sm">
                    Redirecting you to sign in...
                  </p>
                </div>

                <motion.button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full py-4 bg-white text-black font-bold tracking-wider uppercase text-sm rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In Now
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Side - Hero Image */}
        <div className="hidden lg:flex lg:flex-1 relative p-8">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1652397428376-c5e2e0506a50?q=80&w=927&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Electronic Music Scene"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
