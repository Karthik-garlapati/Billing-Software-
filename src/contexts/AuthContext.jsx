import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then(({ data: { session }, error }) => {
        if (error) {
          setAuthError(error?.message)
          setLoading(false)
          return
        }
        if (session?.user) {
          setUser(session?.user)
          fetchUserProfile(session?.user?.id)
        } else {
          setLoading(false)
        }
      })?.catch(error => {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('AuthRetryableFetchError')) {
          setAuthError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.')
        } else {
          setAuthError('Authentication initialization failed. Please refresh and try again.')
        }
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session?.user)
          fetchUserProfile(session?.user?.id)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
        setAuthError(null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()

      if (error) {
        setAuthError(`Profile fetch error: ${error?.message}`)
        return
      }

      setUserProfile(data)
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        setAuthError('Cannot connect to database. Your Supabase project may be paused or deleted.')
      } else {
        setAuthError('Failed to load user profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        setAuthError(error?.message)
        return { user: null, error }
      }

      return { user: data?.user, error: null };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        setAuthError('Cannot connect to authentication service. Please check your internet connection.')
      } else {
        setAuthError('Signup failed. Please try again.')
      }
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })

      if (error) {
        setAuthError(error?.message)
        return { user: null, error }
      }

      return { user: data?.user, error: null };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        setAuthError('Cannot connect to authentication service. Your Supabase project may be paused or inactive.')
      } else {
        setAuthError('Login failed. Please try again.')
      }
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase?.auth?.signOut()
      
      if (error) {
        setAuthError(error?.message)
        return { error }
      }

      setUser(null)
      setUserProfile(null)
      return { error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        setAuthError('Cannot connect to authentication service.')
      } else {
        setAuthError('Logout failed. Please try again.')
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      setAuthError(null)
      
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()

      if (error) {
        setAuthError(error?.message)
        return { data: null, error }
      }

      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        setAuthError('Cannot connect to database to update profile.')
      } else {
        setAuthError('Profile update failed. Please try again.')
      }
      return { data: null, error }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError: () => setAuthError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider