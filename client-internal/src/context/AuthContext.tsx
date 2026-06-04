import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { internalApiClient } from '../services/api'
import type { LoginRequest, StaffUser } from '../types'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  user: StaffUser | null
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readSavedUser(): StaffUser | null {
  const savedUser = localStorage.getItem('internal_user')
  if (!savedUser) return null

  try {
    return JSON.parse(savedUser) as StaffUser
  } catch {
    localStorage.removeItem('internal_user')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(() => readSavedUser())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('internal_access_token'))
    if (!hasToken || user) return

    setIsLoading(true)
    internalApiClient
      .getMe()
      .then(setUser)
      .finally(() => setIsLoading(false))
  }, [user])

  const login = async (data: LoginRequest) => {
    const response = await internalApiClient.loginStaff(data)
    setUser(response.user)
  }

  const logout = async () => {
    await internalApiClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(user), isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
