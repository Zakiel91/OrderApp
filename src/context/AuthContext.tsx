import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { API_BASE, GOOGLE_CLIENT_ID } from '../lib/config'
import { onSessionExpired } from '../lib/session'
import { clearClientLookupCaches } from '../hooks/useClientLookup'

// ─── Google Identity Services typings ────────────────────────────────────────
// Replaces the `(window as any).google` casts this file used to be full of.

interface GooglePromptNotification {
  isDisplayMoment?: () => boolean
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string
    callback: (response: { credential: string }) => void
    auto_select?: boolean
  }): void
  prompt(callback?: (notification: GooglePromptNotification) => void): void
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void
  disableAutoSelect(): void
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } }
  }
}

function googleId(): GoogleIdApi | undefined {
  return window.google?.accounts?.id
}

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
  /** Set when the build is misconfigured (no Google client id) — login is impossible. */
  configError: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

const ALLOWED_ROLES: User['role'][] = ['admin', 'salesman']

/**
 * True when the JWT's `exp` is in the past. Tokens last 30 days; without this
 * check a stale session stayed "logged in" until the first API call failed.
 * A token we cannot parse is treated as valid — the server is the authority.
 */
function isJwtExpired(token: string | undefined): boolean {
  if (!token) return false
  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json) as { exp?: number }
    if (typeof exp !== 'number') return false
    return exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

function readStoredUser(): User | null {
  try {
    const saved = localStorage.getItem('user')
    if (!saved) return null
    const parsed = JSON.parse(saved)
    if (
      typeof parsed?.email !== 'string' ||
      typeof parsed?.token !== 'string' ||
      !ALLOWED_ROLES.includes(parsed?.role) ||
      isJwtExpired(parsed.token)
    ) {
      localStorage.removeItem('user')
      return null
    }
    return parsed as User
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  // Reported through the UI instead of throwing at module scope, which produced
  // a blank white screen with no explanation.
  const [configError] = useState<string | null>(
    GOOGLE_CLIENT_ID ? null : 'App is misconfigured: VITE_GOOGLE_CLIENT_ID is not set.'
  )

  const clearSession = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('order_draft')
    localStorage.removeItem('fix_draft')
    // Lookup results are cached per session; a different salesman must not see
    // the previous one's clients in autocomplete.
    clearClientLookupCaches()
    googleId()?.disableAutoSelect()
  }, [])

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
    // Captured locally so the narrowing survives into initGoogle's closure.
    const clientId = GOOGLE_CLIENT_ID
    if (!clientId) return

    let attempts = 0
    const MAX_ATTEMPTS = 30 // 6 seconds total
    let timerId: ReturnType<typeof setTimeout>

    const initGoogle = () => {
      const gid = googleId()
      if (!gid) {
        if (++attempts >= MAX_ATTEMPTS) {
          setAuthError('Google Sign-In failed to load. Please refresh the page.')
          return
        }
        timerId = setTimeout(initGoogle, 200)
        return
      }
      gid.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: true,
      })
    }

    initGoogle()
    return () => clearTimeout(timerId)
  }, [handleGoogleResponse])

  // Any 401 from the API means the 30-day JWT is gone. Drop the session and say
  // so, instead of leaving every screen showing an opaque error.
  useEffect(() => {
    return onSessionExpired(() => {
      clearSession()
      setAuthError('Your session expired. Please sign in again.')
    })
  }, [clearSession])

  const loginWithGoogle = useCallback(() => {
    setIsLoading(true)
    setAuthError(null)

    // LoginPage calls this ~500ms after mount, which can still be before the
    // GSI script has finished loading on a slow connection. Retry briefly
    // instead of silently doing nothing.
    let tries = 0
    const attempt = () => {
      const gid = googleId()
      if (!gid) {
        if (++tries > 25) { setIsLoading(false); return }
        setTimeout(attempt, 200)
        return
      }
      gid.prompt(notification => {
        // Render fallback button for any non-auto-select outcome
        if (!notification.isDisplayMoment?.()) {
          const btnDiv = document.getElementById('google-signin-btn')
          if (btnDiv) {
            gid.renderButton(btnDiv, {
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
    }
    attempt()

    // Safety timeout — if prompt never resolves, stop showing loading
    setTimeout(() => setIsLoading(false), 3000)
  }, [])

  const logout = useCallback(() => {
    setAuthError(null)
    clearSession()
  }, [clearSession])

  return (
    <AuthContext.Provider value={{
      user, loginWithGoogle, logout,
      isAdmin: user?.role === 'admin',
      isLoading, authError, configError,
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
