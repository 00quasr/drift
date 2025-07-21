'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, AuthUser, supabase } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (data: { email: string; password: string } | { provider: 'google' }) => Promise<void>
  signUp: (data: { email: string; password: string; role: string; fullName?: string } | { provider: 'google' }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Get initial user
    const initializeAuth = async () => {
      try {
        // First check if there's an active session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          const user = await authService.getCurrentUser()
          setUser(user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      console.log('AuthContext: Auth state change:', user)
      if (mounted) {
        setUser(user)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (data: { email: string; password: string } | { provider: 'google' }) => {
    setLoading(true)
    try {
      if ('provider' in data && data.provider === 'google') {
        await authService.signInWithGoogle()
        // OAuth redirect will handle the rest
        return
      } else {
        const emailData = data as { email: string; password: string }
        await authService.signIn(emailData.email, emailData.password)
        
        // Give more time for the auth state to settle
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to get the current user, but don't fail if it's not immediately available
        const user = await authService.getCurrentUser()
        
        // Set the user even if null - let the auth state change handle it
        setUser(user)
        setLoading(false)
        
        // The auth state change listener will update the user when it's ready
      }
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (data: { email: string; password: string; role: string; fullName?: string } | { provider: 'google' }) => {
    setLoading(true)
    try {
      if ('provider' in data && data.provider === 'google') {
        await authService.signUpWithGoogle()
        // OAuth redirect will handle the rest
        return
      } else {
        const emailData = data as { email: string; password: string; role: string; fullName?: string }
        await authService.signUp({
          email: emailData.email,
          password: emailData.password,
          role: emailData.role as any,
          full_name: emailData.fullName, // Map fullName to full_name
        })
        const user = await authService.getCurrentUser()
        setUser(user)
      }
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const refreshUser = async () => {
    try {
      console.log('AuthContext: Refreshing user...')
      const updatedUser = await authService.getCurrentUser()
      console.log('AuthContext: Refreshed user:', updatedUser)
      setUser(updatedUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 