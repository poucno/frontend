import { useEffect, useState } from 'react'
import { AUTH_EVENT, clearSession, getSession } from '../data/authApi'
import type { AuthSession } from '../data/authApi'

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => getSession())

  useEffect(() => {
    function sync() {
      setSession(getSession())
    }
    sync()
    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return {
    session,
    isLoggedIn: session !== null,
    logout: () => clearSession(),
  }
}
