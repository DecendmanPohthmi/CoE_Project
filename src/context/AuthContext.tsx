import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth'
import { authApi, toAppUser } from '@/lib/api'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Restore the session on mount and keep it in sync (login, logout, token refresh, other tabs)
  useEffect(() => {
    let isMounted = true

    authApi.getCurrentUser().then((current) => {
      if (!isMounted) return
      setUser(current)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      const next = session?.user ? toAppUser(session.user) : null
      // Keep the same object when nothing changed so token refreshes don't re-trigger task fetches
      setUser((prev) => (prev?.id === next?.id && prev?.name === next?.name ? prev : next))
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setError(null)
    try {
      setUser(await authApi.login(credentials))
    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setError(null)
    try {
      const created = await authApi.register(credentials)
      if (created) {
        setUser(created)
      } else {
        throw new Error('Account created! Check your email to confirm it, then log in.')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      throw err
    }
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
