'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { UserRole } from '@/lib/auth'

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

interface HeroAuthProps {
  mode?: 'signin' | 'register'
  heroImageSrc: string
  onSignIn?: (data: SignInFormData) => void
  onRegister?: (data: RegisterFormData) => void
  onGoogleAuth?: () => void
  onResetPassword?: () => void
  onModeSwitch?: (mode: 'signin' | 'register') => void
  isLoading?: boolean
  error?: string
  success?: string
}

export const HeroAuth: React.FC<HeroAuthProps> = ({
  mode = 'signin',
  heroImageSrc,
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'fan' as UserRole
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'signin' && onSignIn) {
      onSignIn({
        email: formData.email,
        password: formData.password
      })
    } else if (mode === 'register' && onRegister) {
      onRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      })
    }
  }

  const isSignIn = mode === 'signin'

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="flex min-h-screen">
        {/* Left Side - Auth Form */}
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

            {/* Form Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold tracking-wider mb-4 uppercase">
                {isSignIn ? 'Welcome Back' : 'Join the Movement'}
              </h1>
              <p className="text-white/70 font-medium tracking-wider uppercase text-sm">
                {isSignIn 
                  ? 'Sign in to access the underground electronic music scene' 
                  : 'Create your account and dive into the scene'
                }
              </p>
            </motion.div>

            {/* Error/Success Messages */}
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
              {success && (
                <motion.div
                  className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <p className="text-green-400 font-bold tracking-wider uppercase text-sm">{success}</p>
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
              {/* Name Field (Register only) */}
              {!isSignIn && (
                <div className="space-y-2">
                  <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                      placeholder="Enter your full name"
                      required={!isSignIn}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                    placeholder={isSignIn ? "Enter your password" : "Create a password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Register only) */}
              {!isSignIn && (
                <div className="space-y-2">
                  <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                      placeholder="Confirm your password"
                      required={!isSignIn}
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
              )}

              {/* Role Selection (Register only) */}
              {!isSignIn && (
                <div className="space-y-2">
                  <label className="block text-white/80 font-bold tracking-wider uppercase text-sm">
                    Account Type
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 focus:bg-transparent transition-all duration-300 font-medium tracking-wider"
                    required={!isSignIn}
                  >
                    <option value="fan" className="bg-black text-white">FAN - Discover Events</option>
                    <option value="artist" className="bg-black text-white">ARTIST - Share Your Music</option>
                    <option value="promoter" className="bg-black text-white">PROMOTER - Create Events</option>
                    <option value="club_owner" className="bg-black text-white">VENUE OWNER - List Your Space</option>
                  </select>
                </div>
              )}

              {/* Forgot Password Link (Sign In only) */}
              {isSignIn && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={onResetPassword}
                    className="text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-white text-black font-bold tracking-wider uppercase text-sm rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  isSignIn ? 'Signing In...' : 'Creating Account...'
                ) : (
                  <>
                    {isSignIn ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Google Auth Button */}
              <motion.button
                type="button"
                onClick={onGoogleAuth}
                disabled={isLoading}
                className="w-full py-4 bg-transparent border border-white/20 text-white font-bold tracking-wider uppercase text-sm rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.button>
            </motion.form>

            {/* Mode Switch */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-white/60 font-medium tracking-wider uppercase text-sm">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => onModeSwitch?.(isSignIn ? 'register' : 'signin')}
                  className="ml-2 text-white/80 hover:text-white transition-colors font-bold"
                >
                  {isSignIn ? 'Join Now' : 'Sign In'}
                </button>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Hero Image */}
        <div className="hidden lg:flex lg:flex-1 relative p-8">
          {/* Background Image with rounded corners */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src={heroImageSrc}
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