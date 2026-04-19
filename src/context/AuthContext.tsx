import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
if (!GOOGLE_CLIENT_ID) throw new Error('VITE_GOOGLE_CLIENT_ID is not configured')
const API_BASE = 'https://innovation-diamonds-api.innovation-diamonds.workers.dev'

export interface User {
  email: string
  name: string
  picture: string
  prefix: string
  role: 'admin' | 'salesman'
  token?: string
}

interface AuthContextType {
  user: User | null
  loginWithGoogle: () => void
  logout: () => void
  isAdmin: boolean
  isLoading: boolean
  authError: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user')
      if (!saved) return null
      const parsed = JSON.parse(saved)
      const ALLOWED_ROLES: User['role'][] = ['admin', 'salesman']
      if (
        typeof parsed?.email !== 'string' ||
        typeof parsed?.token !== 'string' ||
        !ALLOWED_ROLES.includes(parsed?.role)
      ) {
        localStorage.removeItem('user')
        return null
      }
      return parsed as User
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/order-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json() as {
        allowed?: boolean
        email?: string
        name?: string
        picture?: string
        role?: string
        order_prefix?: string
        token?: string
        error?: string
      }

      if (!res.ok || !data.allowed) {
        const userMessage =
          res.status === 403 ? 'Access denied. Your account is not authorized.' :
          res.status === 429 ? 'Too many attempts. Please wait and try again.' :
          'Authentication failed. Please try again.'
        setAuthError(data.allowed === false ? userMessage : 'Authentication failed. Please try again.')
        setIsLoading(false)
        return
      }

      const ALLOWED_ROLES: User['role'][] = ['admin', 'salesman']
      const rawRole = data.role

      if (!rawRole || !ALLOWED_ROLES.includes(rawRole as User['role'])) {
        setAuthError('Invalid session data. Please contact support.')
        setIsLoading(false)
        return
      }

      const newUser: User = {
        email: data.email || '',
        name: data.name || '',
        picture: data.picture || '',
        prefix: data.order_prefix || 'INNO',
        role: rawRole as User['role'],
        token: data.token,
      }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch {
      setAuthError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 30 // 6 seconds total
    let timerId: ReturnType<typeof setTimeout>

    const initGoogle = () => {
      if (!(window as any).google?.accounts?.id) {
        if (++attempts >= MAX_ATTEMPTS) {
          setAuthError('Google Sign-In failed to load. Please refresh the page.')
          return
        }
        timerId = setTimeout(initGoogle, 200)
        return
      }
      ;(window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: true,
      })
    }

    initGoogle()
    return () => clearTimeout(timerId)
  }, [handleGoogleResponse])

  const loginWithGoogle = useCallback(() => {
    setIsLoading(true)
    setAuthError(null)
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const btnDiv = document.getElementById('google-signin-btn')
          if (btnDiv) {
            (window as any).google.accounts.id.renderButton(btnDiv, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'signin_with',
              width: 300,
            })
          }
          setIsLoading(false)
        }
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAuthError(null)
    localStorage.removeItem('user')
    localStorage.removeItem('order_draft')
    localStorage.removeItem('fix_draft')
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.disableAutoSelect()
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loginWithGoogle, logout,
      isAdmin: user?.role === 'admin',
      isLoading, authError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
