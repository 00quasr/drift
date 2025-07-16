"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react"
import Link from "next/link"

const roles = [
  { id: "fan", name: "Fan", description: "Discover and review venues and events" },
  { id: "artist", name: "Artist", description: "Manage your artist profile and gigs", requiresVerification: true },
  { id: "promoter", name: "Promoter", description: "Create and manage events", requiresVerification: true },
  { id: "club_owner", name: "Venue Owner", description: "Manage venue listings", requiresVerification: true }
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "fan"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      setIsLoading(false)
      return
    }
    
    console.log("Registration attempt:", formData)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Register with ${provider}`)
    // TODO: Implement social registration
  }

  const selectedRole = roles.find(role => role.id === formData.role)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      {/* Neon accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-400 opacity-60" />
      
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase mb-6">
            JOIN DRIFT
          </h1>
          <p className="text-white/80 text-lg font-medium tracking-wider uppercase">
            CREATE YOUR ACCOUNT AND DISCOVER ELECTRONIC MUSIC
          </p>
        </div>

        {/* Register Card */}
        <Card className="bg-white/5 border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-white font-bold tracking-widest uppercase text-sm">
                FULL NAME
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="ENTER YOUR FULL NAME"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-12 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  required
                />
              </div>
            </div>

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
                  placeholder="CREATE A PASSWORD"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-12 pr-12 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-white font-bold tracking-widest uppercase text-sm">
                CONFIRM PASSWORD
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="CONFIRM YOUR PASSWORD"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-12 pr-12 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-cyan-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <Label className="text-white font-bold tracking-widest uppercase text-sm">
                ACCOUNT TYPE
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`relative flex items-start p-4 rounded border cursor-pointer transition-all ${
                      formData.role === role.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-white/30 bg-black hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={formData.role === role.id}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white tracking-wider uppercase">{role.name}</span>
                        {role.requiresVerification && (
                          <Badge variant="secondary" className="text-xs bg-yellow-400/20 text-yellow-400 border-yellow-400/30 font-bold tracking-wider uppercase">
                            VERIFICATION REQUIRED
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/60 font-medium tracking-wider uppercase">{role.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.role === role.id
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-white/40'
                    }`}>
                      {formData.role === role.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              {selectedRole?.requiresVerification && (
                <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded">
                  <p className="text-sm text-yellow-400 font-bold tracking-wider uppercase">
                    THIS ACCOUNT TYPE REQUIRES VERIFICATION. YOU'LL NEED TO PROVIDE DOCUMENTATION AFTER REGISTRATION.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-cyan-400 font-bold tracking-wider uppercase transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  CREATING ACCOUNT...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  CREATE ACCOUNT
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/5 text-white/60 font-bold tracking-widest uppercase">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="h-12 border-2 border-white/30 bg-black text-white hover:bg-white/10 hover:border-cyan-400/60 transition-all font-bold tracking-wider uppercase"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              GOOGLE
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              className="h-12 border-2 border-white/30 bg-black text-white hover:bg-white/10 hover:border-yellow-400/60 transition-all font-bold tracking-wider uppercase"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              FACEBOOK
            </Button>
          </div>
        </Card>

        {/* Terms and Privacy */}
        <div className="text-center mt-6 text-xs text-white/60">
          <p className="font-bold tracking-widest uppercase">
            BY CREATING AN ACCOUNT, YOU AGREE TO OUR{" "}
            <Link href="/terms" className="text-cyan-400 hover:text-white transition-colors font-bold">
              TERMS OF SERVICE
            </Link>{" "}
            AND{" "}
            <Link href="/privacy" className="text-cyan-400 hover:text-white transition-colors font-bold">
              PRIVACY POLICY
            </Link>
          </p>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-white/60 font-bold tracking-widest uppercase text-sm">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link 
              href="/auth/login" 
              className="text-cyan-400 hover:text-white font-bold transition-colors"
            >
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 