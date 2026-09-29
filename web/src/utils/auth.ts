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
  const providerToken = params.get('provider_token')
  const type = params.get('type')
  const error = params.get('error')
  const errorDescription = params.get('error_description')
  const errorCode = params.get('error_code')
  const pendingProvider = localStorage.getItem('ontrack_oauth_provider')

  // Handle OAuth errors returned by provider (e.g. Google unverified app access_denied or user cancel)
  if (error) {
    localStorage.removeItem('ontrack_oauth_provider')
    const cleanPath = window.location.pathname
    window.history.replaceState({}, '', cleanPath || '/')

    if (
      pendingProvider === 'google_calendar' ||
      error === 'access_denied' ||
      (errorDescription && errorDescription.toLowerCase().includes('access_denied'))
    ) {
      sessionStorage.setItem(
        'ontrack_integration_error',
        "Calendar access isn't available for this account yet. The Google integration is currently in testing mode."
      )
      window.location.href = '/dashboard/integrations'
      return
    }

    const readableMessage =
      errorDescription || errorCode || error || 'Authentication could not be completed. Please try again.'
    window.location.href = `/login?error=${encodeURIComponent(readableMessage)}`
    return
  }

  if (access) {
    // Validate JWT format (3 parts separated by dots)
    const jwtParts = access.split('.')
    if (jwtParts.length !== 3) {
      console.warn('[auth] Malformed access token received in URL hash')
      localStorage.removeItem('ontrack_token')
      const cleanPath = window.location.pathname
      window.history.replaceState({}, '', cleanPath || '/')
      window.location.href = '/login?error=' + encodeURIComponent('Malformed authentication token received. Please sign in again.')
      return
    }

    localStorage.setItem('ontrack_token', access)
    if (refresh) localStorage.setItem('ontrack_refresh_token', refresh)
    if (type === 'recovery') {
      localStorage.setItem('ontrack_recovery_token', access)
    }

    // Save provider token and integration marker if returning from provider OAuth with an actual provider token
    if (pendingProvider && providerToken && !providerToken.startsWith('eyJ')) {
      try {
        const stored = JSON.parse(localStorage.getItem('ontrack_provider_tokens') || '{}')
        stored[pendingProvider] = providerToken
        localStorage.setItem('ontrack_provider_tokens', JSON.stringify(stored))
        localStorage.setItem('ontrack_oauth_provider_completed', pendingProvider)
      } catch (err) {
        console.warn('[auth] Could not persist provider token:', err)
      }
      localStorage.removeItem('ontrack_oauth_provider')
    } else if (pendingProvider) {
      localStorage.removeItem('ontrack_oauth_provider')
    }

    const profile = profileFromAccessToken()
    if (profile && (profile.name || profile.email)) {
      localStorage.setItem('ontrack_user_profile', JSON.stringify(profile))
    }

    // Extract GitHub identity if available in JWT payload
    try {
      const payloadPart = access.split('.')[1]
      if (payloadPart) {
        const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')))
        const meta = (payload.user_metadata as Record<string, unknown> | undefined) ?? {}
        const ghUsername =
          (typeof meta.user_name === 'string' && meta.user_name) ||
          (typeof meta.preferred_username === 'string' && meta.preferred_username) ||
          null
        if (ghUsername) {
          localStorage.setItem('ontrack_github_login', ghUsername)
        }
      }
    } catch { /* storage unavailable — login still succeeds without the cache */ }
  }

  // Clean hash/query from URL
  const clean = `${window.location.pathname}${window.location.search && !search.includes('access_token') ? window.location.search : ''}`
  window.history.replaceState({}, '', clean || '/')

  if (access) {
    if (type === 'recovery' && window.location.pathname !== '/reset-password') {
      window.location.href = '/reset-password'
      return
    }
    if ((type === 'signup' || type === 'email_confirmation') && !localStorage.getItem('ontrack_onboarded')) {
      window.location.href = '/onboarding'
      return
    }
    if (pendingProvider) {
      window.location.href = '/dashboard/integrations'
      return
    }

    // Returning from OAuth login/auth: always redirect to /dashboard if currently on landing, login, or signup
    if (
      window.location.pathname === '/' ||
      window.location.pathname === '/login' ||
      window.location.pathname === '/signup'
    ) {
      window.location.href = '/dashboard'
      return
    }
    return
  }

  if (type === 'recovery' && window.location.pathname !== '/reset-password') {
    window.location.href = '/reset-password'
  } else if ((type === 'signup' || type === 'email_confirmation') && !localStorage.getItem('ontrack_onboarded')) {
    window.location.href = '/onboarding'
  }
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
