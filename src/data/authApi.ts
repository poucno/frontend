export type AuthSession = {
  email: string
  tokenType: string
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt: number
}

export const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://api.poucno.study').replace(/\/$/, '')
const SESSION_KEY = 'otok-znanja.auth.session'
export const AUTH_EVENT = 'otok-znanja:auth'

function notify(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EVENT))
}

export class AuthError extends Error {}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getSession(): AuthSession | null {
  const store = storage()
  if (!store) return null
  const raw = store.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (typeof parsed.accessToken !== 'string' || typeof parsed.refreshToken !== 'string') return null
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      tokenType: typeof parsed.tokenType === 'string' ? parsed.tokenType : 'Bearer',
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresIn: typeof parsed.expiresIn === 'number' ? parsed.expiresIn : 0,
      expiresAt: typeof parsed.expiresAt === 'number' ? parsed.expiresAt : 0,
    }
  } catch {
    return null
  }
}

function saveSession(session: AuthSession): void {
  storage()?.setItem(SESSION_KEY, JSON.stringify(session))
  notify()
}

export function clearSession(): void {
  storage()?.removeItem(SESSION_KEY)
  notify()
}

export function isLoggedIn(): boolean {
  return getSession() !== null
}

async function readError(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object') {
      const errors = (data as { errors?: Record<string, string[]> }).errors
      const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined
      if (firstError) return firstError
      const detail = (data as { detail?: unknown }).detail
      if (typeof detail === 'string' && detail) return detail
      const title = (data as { title?: unknown }).title
      if (typeof title === 'string' && title) return title
    }
  } catch {
    // Ignore non-JSON error bodies.
  }
  return response.status === 401 ? 'Napačna e-pošta ali geslo.' : 'Prišlo je do napake. Poskusi znova.'
}

export async function register(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new AuthError(await readError(response))
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new AuthError(await readError(response))
  const data = await response.json() as { tokenType?: string; accessToken: string; refreshToken: string; expiresIn: number }
  const session: AuthSession = {
    email,
    tokenType: data.tokenType ?? 'Bearer',
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    expiresAt: Date.now() + data.expiresIn * 1000,
  }
  saveSession(session)
  return session
}

export async function refreshSession(session: AuthSession | null = getSession()): Promise<AuthSession | null> {
  if (!session) return null
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })
  if (!response.ok) {
    clearSession()
    return null
  }
  const data = await response.json() as { tokenType?: string; accessToken: string; refreshToken: string; expiresIn: number }
  const next: AuthSession = {
    email: session.email,
    tokenType: data.tokenType ?? 'Bearer',
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    expiresAt: Date.now() + data.expiresIn * 1000,
  }
  saveSession(next)
  return next
}

export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let session = getSession()
  if (session && session.expiresAt <= Date.now() + 15_000) {
    session = await refreshSession(session)
  }

  const headers = new Headers(init.headers)
  if (session) headers.set('Authorization', `${session.tokenType} ${session.accessToken}`)

  let response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (response.status === 401) {
    const refreshed = await refreshSession()
    if (refreshed) {
      headers.set('Authorization', `${refreshed.tokenType} ${refreshed.accessToken}`)
      response = await fetch(`${API_BASE}${path}`, { ...init, headers })
    }
  }
  return response
}
