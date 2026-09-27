import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type {
  Goal,
  DashboardData,
  StandardError,
  AudioSettings,
  NotificationSettings,
  IntegrationItem,
  UserProfile,
} from '../types'
import {
  api,
  INITIAL_AUDIO_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INTEGRATIONS,
} from '../services/api'
import {
  emptyUserProfile,
  profileFromAccessToken,
  isStaleMockProfile,
} from '../utils/auth'

interface GoalContextType {
  goals: Goal[]
  activeGoal: Goal | null
  dashboardData: DashboardData | null
  loading: boolean
  error: StandardError | null
  user: UserProfile
  audioSettings: AudioSettings
  notificationSettings: NotificationSettings
  integrations: IntegrationItem[]
  isAudioPlaying: boolean
  currentSpeakingText: string | null
  fetchGoals: () => Promise<void>
  fetchDashboard: () => Promise<void>
  selectGoal: (id: string) => Promise<Goal | null>
  createGoal: (payload: Partial<Goal> & { text?: string }) => Promise<Goal>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>
  finalizeGoal: (id: string) => Promise<Goal>
  logProgress: (goalId: string, value: number | string, note?: string) => Promise<Goal>
  respondToCheckIn: (goalId: string, checkInId: string, response: string) => Promise<Goal>
  updateAudioSettings: (settings: Partial<AudioSettings>) => void
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  updateUserProfile: (profile: Partial<UserProfile>) => void
  toggleIntegration: (id: string) => void
  playTTS: (text: string) => void
  stopTTS: () => void
  clearError: () => void
}

const GoalContext = createContext<GoalContextType | undefined>(undefined)

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<StandardError | null>(null)

  // ── User profile: real profile from token or localStorage, fallback to empty ──────
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const fromJwt = profileFromAccessToken()
      if (fromJwt && (fromJwt.name || fromJwt.email)) return fromJwt
      const saved = localStorage.getItem('ontrack_user_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!isStaleMockProfile(parsed)) return parsed
      }
      return emptyUserProfile()
    } catch {
      return emptyUserProfile()
    }
  })

  // ── Audio / Notification settings: localStorage-persisted ───────────────────
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem('ontrack_audio_settings')
      return saved ? JSON.parse(saved) : INITIAL_AUDIO_SETTINGS
    } catch {
      return INITIAL_AUDIO_SETTINGS
    }
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('ontrack_notification_settings')
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS
    } catch {
      return INITIAL_NOTIFICATIONS
    }
  })

  const [integrations, setIntegrations] = useState<IntegrationItem[]>(() => {
    try {
      const saved = localStorage.getItem('ontrack_integrations')
      return saved ? JSON.parse(saved) : INITIAL_INTEGRATIONS
    } catch {
      return INITIAL_INTEGRATIONS
    }
  })

  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null)

  const clearError = () => setError(null)

  /** Returns true when there is a token — the user is authenticated */
  const isAuthenticated = () => !!localStorage.getItem('ontrack_token')

  // ── OAuth callback: Supabase redirects here with #access_token=… ────────
  // Captures session + provider tokens, persists any pending integration
  // (stash `ontrack_oauth_provider` before redirecting to authorize),
  // then scrubs the fragment so tokens never linger in history.
  const consumeOAuthCallback = useCallback(async () => {
    if (!window.location.hash) return
    const frag = new URLSearchParams(window.location.hash.slice(1))
    const access = frag.get('access_token')
    if (!access) return
    try {
      localStorage.setItem('ontrack_token', access)
      const refresh = frag.get('refresh_token')
      if (refresh) localStorage.setItem('ontrack_refresh_token', refresh)
      const pendingProvider = localStorage.getItem('ontrack_oauth_provider')
      const providerToken = frag.get('provider_token')
      if (pendingProvider && providerToken) {
        try {
          await api.saveIntegration({ provider: pendingProvider, access_token: providerToken })
          // Local copy lets the Integrations tab verify identity (hackathon
          // tradeoff — same sensitivity class as the session token).
          const stored = JSON.parse(localStorage.getItem('ontrack_provider_tokens') || '{}')
          stored[pendingProvider] = providerToken
          localStorage.setItem('ontrack_provider_tokens', JSON.stringify(stored))
        } catch (err) {
          console.warn('[GoalContext] Could not persist OAuth integration', err)
        }
      }
    } finally {
      localStorage.removeItem('ontrack_oauth_provider')
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  // ── Bootstrap: fetch user profile + settings from real API ───────────────────
  const bootstrapUser = useCallback(async () => {
    await consumeOAuthCallback()
    if (!isAuthenticated()) return
    try {
      const jwtProfile = profileFromAccessToken()
      const [me, settings] = await Promise.all([
        api.getMe().catch(() => null),
        api.getSettings().catch(() => null),
      ])

      const realName =
        (me?.name && me.name.trim()) ||
        (jwtProfile?.name && jwtProfile.name.trim()) ||
        localStorage.getItem('ontrack_signup_name') ||
        (jwtProfile?.email ? jwtProfile.email.split('@')[0] : '')

      const realEmail = (me?.email && me.email.trim()) || jwtProfile?.email || ''

      const profile: UserProfile = {
        ...emptyUserProfile(),
        ...me,
        name: realName,
        email: realEmail,
      }
      if (realName || realEmail) {
        setUser(profile)
        localStorage.setItem('ontrack_user_profile', JSON.stringify(profile))
      }

      if (settings) {
        if (settings.audio) {
          setAudioSettings(settings.audio)
          localStorage.setItem('ontrack_audio_settings', JSON.stringify(settings.audio))
        }
        if (settings.notifications) {
          setNotificationSettings(settings.notifications)
          localStorage.setItem('ontrack_notification_settings', JSON.stringify(settings.notifications))
        }
        if (settings.integrations?.length) {
          setIntegrations(settings.integrations)
          localStorage.setItem('ontrack_integrations', JSON.stringify(settings.integrations))
        }
      }
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        localStorage.removeItem('ontrack_token')
        localStorage.removeItem('ontrack_refresh_token')
        localStorage.removeItem('ontrack_user_profile')
      }
      console.warn('[GoalContext] Could not bootstrap user from API', err)
    }
  }, [consumeOAuthCallback])

  // ── Goals ────────────────────────────────────────────────────────────────────

  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await api.getGoals()
      setGoals(data)
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        localStorage.removeItem('ontrack_token')
        localStorage.removeItem('ontrack_refresh_token')
        localStorage.removeItem('ontrack_user_profile')
      }
      setError(err?.code ? err : { error: 'Failed to load goals', code: 'FETCH_ERROR' })
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Dashboard ────────────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated()) return
    try {
      const data = await api.getDashboard()
      setDashboardData(data)
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        localStorage.removeItem('ontrack_token')
        localStorage.removeItem('ontrack_refresh_token')
        localStorage.removeItem('ontrack_user_profile')
      }
      console.warn('[GoalContext] Dashboard fetch failed', err)
    }
  }, [])

  // ── Initial load ─────────────────────────────────────────────────────────────

  useEffect(() => {
    bootstrapUser()
    fetchGoals()
    fetchDashboard()
  }, [bootstrapUser, fetchGoals, fetchDashboard])


  // ── Goal operations ───────────────────────────────────────────────────────────

  const selectGoal = async (id: string): Promise<Goal | null> => {
    try {
      setLoading(true)
      // Try local cache first to avoid a round-trip
      const cached = goals.find((g) => g.id === id)
      if (cached) {
        setActiveGoal(cached)
        setLoading(false)
        return cached
      }
      const goal = await api.getGoal(id)
      setActiveGoal(goal)
      return goal
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Goal not found', code: 'NOT_FOUND' })
      return null
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (payload: Partial<Goal> & { text?: string }): Promise<Goal> => {
    try {
      setLoading(true)
      const newGoal = await api.createGoal(payload)
      setGoals((prev) => [newGoal, ...prev])
      fetchDashboard()
      return newGoal
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Failed to create goal', code: 'CREATE_ERROR' })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    try {
      const updated = await api.updateGoal(id, updates)
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
      if (activeGoal?.id === id) setActiveGoal(updated)
      fetchDashboard()
      return updated
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Failed to update goal', code: 'UPDATE_ERROR' })
      throw err
    }
  }

  const finalizeGoal = async (id: string): Promise<Goal> => {
    try {
      setLoading(true)
      const finalized = await api.finalizeGoal(id)
      setGoals((prev) => prev.map((g) => (g.id === id ? finalized : g)))
      if (activeGoal?.id === id) setActiveGoal(finalized)
      fetchDashboard()
      return finalized
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Failed to finalize goal', code: 'FINALIZE_ERROR' })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logProgress = async (goalId: string, value: number | string, note?: string): Promise<Goal> => {
    try {
      const updated = await api.logProgress({ goal_id: goalId, value, note })
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      if (activeGoal?.id === goalId) setActiveGoal(updated)
      fetchDashboard()
      return updated
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Failed to log progress', code: 'PROGRESS_ERROR' })
      throw err
    }
  }

  const respondToCheckIn = async (goalId: string, checkInId: string, responseText: string): Promise<Goal> => {
    try {
      const updated = await api.respondToCheckIn(goalId, checkInId, responseText)
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      if (activeGoal?.id === goalId) setActiveGoal(updated)
      return updated
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Failed to send check-in response', code: 'CHECKIN_ERROR' })
      throw err
    }
  }

  // ── Settings mutations ────────────────────────────────────────────────────────

  const updateAudioSettings = (settings: Partial<AudioSettings>) => {
    setAudioSettings((prev) => {
      const updated = { ...prev, ...settings }
      localStorage.setItem('ontrack_audio_settings', JSON.stringify(updated))
      // Best-effort sync to backend
      api.updateSettings({ audio: updated }).catch(() => {})
      return updated
    })
  }

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => {
      const updated = { ...prev, ...settings }
      localStorage.setItem('ontrack_notification_settings', JSON.stringify(updated))
      api.updateSettings({ notifications: updated }).catch(() => {})
      return updated
    })
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...profile }
      localStorage.setItem('ontrack_user_profile', JSON.stringify(updated))
      api.updateSettings({ profile: updated }).catch(() => {})
      return updated
    })
  }

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, connected: !item.connected, status_label: !item.connected ? 'Connected' : 'Not connected' }
          : item
      )
      localStorage.setItem('ontrack_integrations', JSON.stringify(updated))
      api.updateSettings({ integrations: updated }).catch(() => {})
      return updated
    })
  }

  // ── Web Speech TTS ────────────────────────────────────────────────────────────

  const stopTTS = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsAudioPlaying(false)
    setCurrentSpeakingText(null)
  }, [])

  const playTTS = useCallback(
    (text: string) => {
      if (!audioSettings.tts_enabled) return
      stopTTS()

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = audioSettings.voice_speed || 1.0

        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          if (audioSettings.voice_type === 'calm-mentor') {
            const calm = voices.find((v) =>
              v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('UK English Female')
            )
            if (calm) utterance.voice = calm
          } else if (audioSettings.voice_type === 'accountability-coach') {
            const coach = voices.find((v) =>
              v.name.includes('Daniel') || v.name.includes('US English') || v.name.includes('David')
            )
            if (coach) utterance.voice = coach
          }
        }

        utterance.onstart = () => { setIsAudioPlaying(true); setCurrentSpeakingText(text) }
        utterance.onend = () => { setIsAudioPlaying(false); setCurrentSpeakingText(null) }
        utterance.onerror = () => { setIsAudioPlaying(false); setCurrentSpeakingText(null) }
        window.speechSynthesis.speak(utterance)
      } else {
        setIsAudioPlaying(true)
        setCurrentSpeakingText(text)
        const dur = Math.min(10000, Math.max(2000, text.length * 60))
        setTimeout(() => { setIsAudioPlaying(false); setCurrentSpeakingText(null) }, dur)
      }
    },
    [audioSettings, stopTTS]
  )

  return (
    <GoalContext.Provider
      value={{
        goals,
        activeGoal,
        dashboardData,
        loading,
        error,
        user,
        audioSettings,
        notificationSettings,
        integrations,
        isAudioPlaying,
        currentSpeakingText,
        fetchGoals,
        fetchDashboard,
        selectGoal,
        createGoal,
        updateGoal,
        finalizeGoal,
        logProgress,
        respondToCheckIn,
        updateAudioSettings,
        updateNotificationSettings,
        updateUserProfile,
        toggleIntegration,
        playTTS,
        stopTTS,
        clearError,
      }}
    >
      {children}
    </GoalContext.Provider>
  )
}

export const useGoals = () => {
  const context = useContext(GoalContext)
  if (!context) throw new Error('useGoals must be used within a GoalProvider')
  return context
}
