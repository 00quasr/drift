'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, AuthUser } from '@/lib/auth'

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
    // Get initial user
    authService.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (data: { email: string; password: string }) => {
    setLoading(true)
    try {
      await authService.signIn(data.email, data.password)
      const user = await authService.getCurrentUser()
      setUser(user)
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