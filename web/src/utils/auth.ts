import type { UserProfile } from '../types'

export function emptyUserProfile(): UserProfile {
  return {
    name: '',
    email: '',
    accountability_persona: 'Nemotron High-Accountability Coach',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  }
}

export function isStaleMockProfile(profile: UserProfile | null | undefined): boolean {
  if (!profile) return true
  return profile.email === 'israel@ontrack.app' || (profile.name === 'Israel' && !profile.email)
}

/** Persist OAuth tokens from the Supabase redirect hash/query, then clean the URL. */
export function captureAuthFromUrl(): void {
  if (typeof window === 'undefined') return
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
  const search = window.location.search.startsWith('?') ? window.location.search.slice(1) : ''
  const params = new URLSearchParams(hash.includes('access_token') ? hash : search)
  const access = params.get('access_token')
  const refresh = params.get('refresh_token')
  if (!access) return
  localStorage.setItem('ontrack_token', access)
  if (refresh) localStorage.setItem('ontrack_refresh_token', refresh)
  const profile = profileFromAccessToken()
  if (profile && (profile.name || profile.email)) {
    localStorage.setItem('ontrack_user_profile', JSON.stringify(profile))
  }
  const clean = `${window.location.pathname}${window.location.search && !search.includes('access_token') ? window.location.search : ''}`
  window.history.replaceState({}, '', clean || '/')
}


export function profileFromAccessToken(): UserProfile | null {
  const token = localStorage.getItem('ontrack_token')
  if (!token || token.startsWith('mock_')) return null
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null
    const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as Record<string, unknown>
    const meta = (payload.user_metadata as Record<string, unknown> | undefined) ?? {}
    const email =
      (typeof payload.email === 'string' && payload.email) ||
      (typeof meta.email === 'string' && meta.email) ||
      ''
    const name =
      (typeof meta.full_name === 'string' && meta.full_name) ||
      (typeof meta.name === 'string' && meta.name) ||
      (typeof payload.user_name === 'string' && payload.user_name) ||
      localStorage.getItem('ontrack_signup_name') ||
      (email ? email.split('@')[0] : '')
    return {
      ...emptyUserProfile(),
      name: name.trim(),
      email: email.trim(),
    }
  } catch {
    return null
  }
}

export function firstName(user: UserProfile): string {
  const name = user.name?.trim()
  if (name) return name.split(/\s+/)[0]
  if (user.email) return user.email.split('@')[0]
  return ''
}

export function initials(user: UserProfile): string {
  const name = user.name?.trim()
  if (name) return name[0].toUpperCase()
  if (user.email) return user.email[0].toUpperCase()
  return '?'
}
