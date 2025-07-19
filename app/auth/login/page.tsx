"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Mail, LogIn, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // Clear errors when user types
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.password.trim()) {
      setError("Password is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      await signIn({
        email: formData.email,
        password: formData.password
      })

      setSuccess("Login successful! Redirecting...")
      // Redirect immediately after successful sign in
      router.push('/explore')
      router.refresh() // Force a refresh of the page
      
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.message.includes('Invalid login credentials')) {
        setError("Invalid email or password. Please try again.")
      } else if (error.message.includes('Email not confirmed')) {
        setError("Please check your email and confirm your account before signing in.")
      } else {
        setError(error.message || "Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      try {
        setIsLoading(true)
        setError("")
        await signIn({ provider: 'google' })
      } catch (error: any) {
        console.error('Social login error:', error)
        setError(error.message || 'Social login failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    } else {
      console.log(`${provider} login not implemented yet`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-widest uppercase text-white">
            SIGN IN
          </h1>
          <p className="text-white/80 text-lg font-medium tracking-wider uppercase">
            ACCESS YOUR DRIFT ACCOUNT
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/5 border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 font-bold tracking-wider uppercase text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 p-4 rounded">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 font-bold tracking-wider uppercase text-sm">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white font-bold tracking-widest uppercase text-sm">
                EMAIL
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-12 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-white font-bold tracking-widest uppercase text-sm">
                PASSWORD
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ENTER YOUR PASSWORD"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-12 pr-12 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                className="text-cyan-400 hover:text-cyan-300 font-bold tracking-wider uppercase text-sm transition-colors"
              >
                FORGOT PASSWORD?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-white/90 border-2 border-white font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  SIGNING IN...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  SIGN IN
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-white/60 font-bold tracking-widest uppercase">
                  OR
                </span>
              </div>
            </div>

            {/* Social Login Options */}
            <Button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full h-12 bg-white/10 border border-white/30 hover:bg-white/20 text-white font-bold tracking-wider uppercase transition-all duration-200"
            >
              CONTINUE WITH GOOGLE
            </Button>
          </form>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-white/60 font-bold tracking-wider uppercase text-sm">
            DON'T HAVE AN ACCOUNT?{" "}
            <Link 
              href="/auth/register" 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              SIGN UP
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 