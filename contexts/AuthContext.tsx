'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, AuthUser, supabase } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (data: { email: string; password: string }) => Promise<void>
  signUp: (data: { email: string; password: string; role: string; fullName?: string }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
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

  const signIn = async (data: { email: string; password: string }) => {
    setLoading(true)
    try {
      const result = await authService.signIn(data.email, data.password)
      
      // Give more time for the auth state to settle
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Try to get the current user, but don't fail if it's not immediately available
      const user = await authService.getCurrentUser()
      
      // Set the user even if null - let the auth state change handle it
      setUser(user)
      setLoading(false)
      
      // The auth state change listener will update the user when it's ready
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (data: { email: string; password: string; role: string; fullName?: string }) => {
    setLoading(true)
    try {
      await authService.signUp({
        email: data.email,
        password: data.password,
        role: data.role as any,
        full_name: data.fullName, // Map fullName to full_name
      })
      const user = await authService.getCurrentUser()
      setUser(user)
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

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
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