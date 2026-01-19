"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
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

            {/* Back Link */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <button
                onClick={() => router.push("/auth/signin")}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </motion.div>

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
                    Reset Password
                  </h1>
                  <p className="text-white/70 font-medium tracking-wider uppercase text-sm">
                    Enter your email and we&apos;ll send you a link to reset your password
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
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                        placeholder="Enter your email"
                        required
                        autoFocus
                      />
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
                      "Sending..."
                    ) : (
                      <>
                        Send Reset Link
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
              >
                <div className="mb-8">
                  <h1 className="text-4xl font-bold tracking-wider mb-4 uppercase">
                    Check Your Email
                  </h1>
                  <p className="text-white/70 font-medium tracking-wider uppercase text-sm mb-6">
                    We&apos;ve sent a password reset link to
                  </p>
                  <p className="text-white font-bold tracking-wider text-lg mb-6">
                    {email}
                  </p>
                  <p className="text-white/60 font-medium tracking-wider text-sm">
                    Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
                  </p>
                </div>

                <motion.button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full py-4 bg-white text-black font-bold tracking-wider uppercase text-sm rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Sign In
                </motion.button>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail("")
                    }}
                    className="text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm"
                  >
                    Didn&apos;t receive the email? Try again
                  </button>
                </div>
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
