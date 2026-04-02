import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

const GOOGLE_CLIENT_ID = '834868664035-f5kq50i6lb6etvm3v7bh63heft2tttja.apps.googleusercontent.com'
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
  loginWithDevCode: () => void
  logout: () => void
  isAdmin: boolean
  isLoading: boolean
  authError: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
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
        setAuthError(data.error || 'Access denied')
        setIsLoading(false)
        return
      }

      const newUser: User = {
        email: data.email || '',
        name: data.name || '',
        picture: data.picture || '',
        prefix: data.order_prefix || 'INNO',
        role: (data.role as User['role']) || 'salesman',
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
    const initGoogle = () => {
      if (!(window as any).google?.accounts?.id) {
        setTimeout(initGoogle, 200)
        return
      }
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: true,
      })
    }
    initGoogle()
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

  const loginWithDevCode = useCallback(() => {
    const devUser: User = {
      email: 'admin@innovationdia.com',
      name: 'Dev Admin',
      picture: '',
      prefix: 'INNO',
      role: 'admin',
    }
    setUser(devUser)
    localStorage.setItem('user', JSON.stringify(devUser))
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
      user, loginWithGoogle, loginWithDevCode, logout,
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
