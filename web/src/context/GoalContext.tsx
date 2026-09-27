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
  INITIAL_USER_PROFILE,
  INITIAL_AUDIO_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INTEGRATIONS,
} from '../services/api'

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
  createGoal: (payload: Partial<Goal>) => Promise<Goal>
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

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ontrack_user_profile')
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE
  })

  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    const saved = localStorage.getItem('ontrack_audio_settings')
    return saved ? JSON.parse(saved) : INITIAL_AUDIO_SETTINGS
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('ontrack_notification_settings')
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS
  })

  const [integrations, setIntegrations] = useState<IntegrationItem[]>(() => {
    const saved = localStorage.getItem('ontrack_integrations')
    return saved ? JSON.parse(saved) : INITIAL_INTEGRATIONS
  })

  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null)

  const clearError = () => setError(null)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getGoals()
      setGoals(data)
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Failed to load goals', code: 'FETCH_ERROR' })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard()
      setDashboardData(data)
    } catch (err: any) {
      setError(err?.code ? err : { error: 'Failed to load dashboard', code: 'DASHBOARD_ERROR' })
    }
  }, [])

  useEffect(() => {
    fetchGoals()
    fetchDashboard()
  }, [fetchGoals, fetchDashboard])

  const selectGoal = async (id: string): Promise<Goal | null> => {
    try {
      setLoading(true)
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

  const createGoal = async (payload: Partial<Goal>): Promise<Goal> => {
    try {
      setLoading(true)
      const newGoal = await api.createGoal(payload)
      setGoals((prev) => [newGoal, ...prev])
      await fetchDashboard()
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
      await fetchDashboard()
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
      await fetchDashboard()
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
      await fetchDashboard()
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

  const updateAudioSettings = (settings: Partial<AudioSettings>) => {
    setAudioSettings((prev) => {
      const updated = { ...prev, ...settings }
      localStorage.setItem('ontrack_audio_settings', JSON.stringify(updated))
      return updated
    })
  }

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => {
      const updated = { ...prev, ...settings }
      localStorage.setItem('ontrack_notification_settings', JSON.stringify(updated))
      return updated
    })
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...profile }
      localStorage.setItem('ontrack_user_profile', JSON.stringify(updated))
      return updated
    })
  }

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected, status_label: !item.connected ? 'Connected successfully' : 'Not connected' } : item
      )
      localStorage.setItem('ontrack_integrations', JSON.stringify(updated))
      return updated
    })
  }

  // Web Speech API / TTS integration with audio wave state
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

        // Select voice if available
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          if (audioSettings.voice_type === 'calm-mentor') {
            const calm = voices.find((v) => v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'))
            if (calm) utterance.voice = calm
          } else if (audioSettings.voice_type === 'accountability-coach') {
            const coach = voices.find((v) => v.name.includes('Daniel') || v.name.includes('Google US English') || v.name.includes('David'))
            if (coach) utterance.voice = coach
          }
        }

        utterance.onstart = () => {
          setIsAudioPlaying(true)
          setCurrentSpeakingText(text)
        }
        utterance.onend = () => {
          setIsAudioPlaying(false)
          setCurrentSpeakingText(null)
        }
        utterance.onerror = () => {
          setIsAudioPlaying(false)
          setCurrentSpeakingText(null)
        }

        window.speechSynthesis.speak(utterance)
      } else {
        // Fallback simulation for browsers without Web Speech
        setIsAudioPlaying(true)
        setCurrentSpeakingText(text)
        const dur = Math.min(10000, Math.max(2000, text.length * 60))
        setTimeout(() => {
          setIsAudioPlaying(false)
          setCurrentSpeakingText(null)
        }, dur)
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
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider')
  }
  return context
}
