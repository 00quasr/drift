"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HeroAuth } from "@/components/ui/hero-auth"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/auth"

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

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Set mode based on URL parameter
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'register') {
      setMode('register')
    } else {
      setMode('signin')
    }
  }, [searchParams])

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      await signIn({
        email: data.email,
        password: data.password
      })

      setSuccess("Login successful! Redirecting...")
      router.push('/explore')
      router.refresh()
      
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

  const handleRegister = async (data: RegisterFormData) => {
    // Validation
    if (!data.name.trim()) {
      setError("Full name is required")
      return
    }
    if (!data.email.trim()) {
      setError("Email is required")
      return
    }
    if (!data.email.includes('@')) {
      setError("Please enter a valid email address")
      return
    }
    if (data.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.name,
        role: data.role
      })

      if (data.role === 'fan') {
        setSuccess("Registration successful! Welcome to Drift!")
        setTimeout(() => {
          router.push('/explore')
        }, 2000)
      } else {
        setSuccess("Registration successful! Your account has been created as a Fan. You will be redirected to request verification for " + data.role.replace('_', ' ') + " role.")
        setTimeout(() => {
          router.push(`/verification?role=${data.role}`)
        }, 3000)
      }
      
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true)
      setError("")
      await signIn({ provider: 'google' })
    } catch (error: any) {
      console.error('Google auth error:', error)
      setError(error.message || 'Google authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = () => {
    router.push('/auth/forgot-password')
  }

  const handleModeSwitch = (newMode: 'signin' | 'register') => {
    setMode(newMode)
    setError("")
    setSuccess("")
    
    // Update URL to reflect mode change
    const newUrl = newMode === 'register' ? '/auth/signin?mode=register' : '/auth/signin'
    router.replace(newUrl)
  }

  return (
    <HeroAuth
      mode={mode}
      heroImageSrc="https://images.unsplash.com/photo-1652397428376-c5e2e0506a50?q=80&w=927&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      onSignIn={handleSignIn}
      onRegister={handleRegister}
      onGoogleAuth={handleGoogleAuth}
      onResetPassword={handleResetPassword}
      onModeSwitch={handleModeSwitch}
      isLoading={isLoading}
      error={error}
      success={success}
    />
  )
}