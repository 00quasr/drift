'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from './badge'
import { UserRole } from '@/lib/auth'

// Google Icon Component
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
)

// Type Definitions
export interface Testimonial {
  avatarSrc: string
  name: string
  handle: string
  text: string
}

interface SignInFormData {
  email: string
  password: string
}

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

interface DriftAuthProps {
  mode?: 'signin' | 'register'
  heroImageSrc?: string
  testimonials?: Testimonial[]
  onSignIn?: (data: SignInFormData) => Promise<void>
  onRegister?: (data: RegisterFormData) => Promise<void>
  onGoogleAuth?: () => Promise<void>
  onResetPassword?: () => void
  onModeSwitch?: (mode: 'signin' | 'register') => void
  isLoading?: boolean
  error?: string
  success?: string
}

// Glass Input Wrapper with Drift styling
const DriftInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
  </div>
)

// Testimonial Card Component
const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-bold text-white tracking-wider uppercase">{testimonial.name}</p>
      <p className="text-white/60 font-medium tracking-wider uppercase text-xs">{testimonial.handle}</p>
      <p className="mt-1 text-white/80 text-xs font-medium tracking-wider">{testimonial.text}</p>
    </div>
  </div>
)

// Role definitions
const roles = [
  { id: "fan", name: "Fan", description: "Discover and review venues and events" },
  { id: "artist", name: "Artist", description: "Manage your artist profile and gigs", requiresVerification: true },
  { id: "promoter", name: "Promoter", description: "Create and manage events", requiresVerification: true },
  { id: "club_owner", name: "Venue Owner", description: "Manage venue listings", requiresVerification: true }
]

// Main Component
export const DriftAuth: React.FC<DriftAuthProps> = ({
  mode = 'signin',
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onRegister,
  onGoogleAuth,
  onResetPassword,
  onModeSwitch,
  isLoading = false,
  error = '',
  success = ''
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: '',
    password: ''
  })
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'fan'
  })

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSignIn) {
      await onSignIn(signInData)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onRegister) {
      await onRegister(registerData)
    }
  }

  const selectedRole = roles.find(role => role.id === registerData.role)

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-black">
      {/* Left column: auth form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-bold tracking-widest uppercase text-white mb-4">
                {mode === 'signin' ? 'SIGN IN' : 'JOIN DRIFT'}
              </h1>
              <p className="animate-element animate-delay-200 text-white/80 text-lg font-medium tracking-wider uppercase">
                {mode === 'signin' 
                  ? 'ACCESS YOUR DRIFT ACCOUNT'
                  : 'CREATE YOUR ACCOUNT AND DISCOVER ELECTRONIC MUSIC'
                }
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded animate-element animate-delay-100">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 font-bold tracking-wider uppercase text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 p-4 rounded animate-element animate-delay-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 font-bold tracking-wider uppercase text-sm">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form className="space-y-5" onSubmit={handleSignInSubmit}>
                <div className="animate-element animate-delay-300">
                  <label className="block text-sm font-bold tracking-widest uppercase text-white mb-3">Email</label>
                  <DriftInputWrapper>
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5 z-10" />
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="ENTER YOUR EMAIL" 
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase rounded focus:outline-none" 
                    />
                  </DriftInputWrapper>
                </div>

                <div className="animate-element animate-delay-400">
                  <label className="block text-sm font-bold tracking-widest uppercase text-white mb-3">Password</label>
                  <DriftInputWrapper>
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5 z-10" />
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="ENTER YOUR PASSWORD" 
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-12 pr-12 py-4 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase rounded focus:outline-none" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center z-10">
                      {showPassword ? 
                        <EyeOff className="w-5 h-5 text-white/60 hover:text-cyan-400 transition-colors" /> : 
                        <Eye className="w-5 h-5 text-white/60 hover:text-cyan-400 transition-colors" />
                      }
                    </button>
                  </DriftInputWrapper>
                </div>

                <div className="animate-element animate-delay-500 text-right">
                  <button 
                    type="button" 
                    onClick={onResetPassword} 
                    className="text-cyan-400 hover:text-cyan-300 font-bold tracking-wider uppercase text-sm transition-colors"
                  >
                    FORGOT PASSWORD?
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="animate-element animate-delay-600 w-full h-12 bg-white text-black hover:bg-cyan-400 font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      SIGNING IN...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      SIGN IN
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                <div className="animate-element animate-delay-300">
                  <label className="block text-sm font-bold tracking-widest uppercase text-white mb-3">Full Name</label>
                  <DriftInputWrapper>
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5 z-10" />
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="ENTER YOUR FULL NAME" 
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase rounded focus:outline-none" 
                    />
                  </DriftInputWrapper>
                </div>

                <div className="animate-element animate-delay-400">
                  <label className="block text-sm font-bold tracking-widest uppercase text-white mb-3">Email</label>
                  <DriftInputWrapper>
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5 z-10" />
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="ENTER YOUR EMAIL" 
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase rounded focus:outline-none" 
                    />
                  </DriftInputWrapper>
                </div>

                <div className="animate-element animate-delay-500">
                  <label className="block text-sm font-bold tracking-widest uppercase text-white mb-3">Password</label>
                  <DriftInputWrapper>
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5 z-10" />
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="CREATE A PASSWORD" 
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-12 pr-12 py-4 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase rounded focus:outline-none" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center z-10">
                      {showPassword ? 
                        <EyeOff className="w-5 h-5 text-white/60 hover:text-cyan-400 transition-colors" /> : 
                        <Eye className="w-5 h-5 text-white/60 hover:text-cyan-400 transition-colors" />
                      }
                    </button>
                  </DriftInputWrapper>
                </div>

                <div className="animate-element animate-delay-600">
                  <label className="block text-sm font-bold tracking-widest uppercase text-white mb-3">Confirm Password</label>
                  <DriftInputWrapper>
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5 z-10" />
                    <input 
                      name="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="CONFIRM YOUR PASSWORD" 
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-12 pr-12 py-4 h-12 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-cyan-400 transition-colors font-bold tracking-wider uppercase rounded focus:outline-none" 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center z-10">
                      {showConfirmPassword ? 
                        <EyeOff className="w-5 h-5 text-white/60 hover:text-cyan-400 transition-colors" /> : 
                        <Eye className="w-5 h-5 text-white/60 hover:text-cyan-400 transition-colors" />
                      }
                    </button>
                  </DriftInputWrapper>
                </div>

                {/* Role Selection */}
                <div className="animate-element animate-delay-700 space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase text-white">Account Type</label>
                  <div className="grid grid-cols-1 gap-3">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className={`relative flex items-start p-4 rounded border cursor-pointer transition-all ${
                          registerData.role === role.id
                            ? 'border-cyan-400 bg-cyan-400/10'
                            : 'border-white/30 bg-black hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={registerData.role === role.id}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, role: e.target.value as UserRole }))}
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
                          registerData.role === role.id
                            ? 'border-cyan-400 bg-cyan-400'
                            : 'border-white/40'
                        }`}>
                          {registerData.role === role.id && (
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

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="animate-element animate-delay-800 w-full h-12 bg-white text-black hover:bg-cyan-400 font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      CREATING ACCOUNT...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      CREATE ACCOUNT
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-white/20"></span>
              <span className="px-4 text-sm text-white/60 bg-black absolute font-bold tracking-widest uppercase">Or continue with</span>
            </div>

            {/* Google Auth */}
            <button 
              onClick={onGoogleAuth} 
              disabled={isLoading}
              className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border-2 border-white/30 h-12 hover:bg-white/10 hover:border-cyan-400/60 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
            >
              <GoogleIcon />
              CONTINUE WITH GOOGLE
            </button>

            {/* Mode Switch */}
            <p className="animate-element animate-delay-900 text-center text-sm text-white/60 font-bold tracking-wider uppercase">
              {mode === 'signin' ? "New to our platform? " : "Already have an account? "}
              <button 
                onClick={() => onModeSwitch?.(mode === 'signin' ? 'register' : 'signin')} 
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {mode === 'signin' ? 'CREATE ACCOUNT' : 'SIGN IN'}
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  )
}