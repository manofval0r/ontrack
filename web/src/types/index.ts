export type TrackerType = 'counter' | 'checklist' | 'manual'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'failed'
export type GoalDomain = 'sales' | 'engineering' | 'fitness' | 'learning' | 'mindset' | 'general'

export interface GoalItem {
  id: string
  title: string
  completed: boolean
  order: number
}

export interface ProgressLog {
  id: string
  goal_id: string
  value: number | string
  note: string
  timestamp: string
}

export interface CheckIn {
  id: string
  goal_id: string
  ai_message: string
  user_response?: string
  timestamp: string
  status: 'pending' | 'responded'
  verdict_preview?: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  goal_type: TrackerType
  target: number
  current_value: number
  unit?: string
  domain: GoalDomain
  deadline: string
  status: GoalStatus
  result_value?: string
  items?: GoalItem[]
  progress_logs?: ProgressLog[]
  check_ins?: CheckIn[]
  verdict?: {
    score: number
    summary: string
    recommendation: string
    passed: boolean
    date: string
  }
  created_at: string
  finished_at?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
  goal_proposal?: Partial<Goal>
  isAudioPlaying?: boolean
  retrieved_context?: string[]
  rag_active?: boolean
}

export interface DashboardStats {
  active_goals_count: number
  completed_goals_count: number
  streak_days: number
  accountability_score: number
  velocity_pace: string
}

export interface WeeklyActivityDay {
  day: string
  date: string
  completed_count: number
  logged_count: number
  isToday?: boolean
}

export interface DashboardData {
  stats: DashboardStats
  active_goals: Goal[]
  recent_activity: ProgressLog[]
  weekly_chart: WeeklyActivityDay[]
}

export interface AudioSettings {
  voice_type: 'nemotron-direct' | 'accountability-coach' | 'calm-mentor'
  voice_speed: number // 0.75 - 1.5
  tts_enabled: boolean
  asr_enabled: boolean
}

export interface NotificationSettings {
  master_enabled: boolean
  goal_reminders: boolean
  check_ins: boolean
  goal_updates: boolean
  streak_alerts: boolean
  sound_enabled: boolean
}

export interface IntegrationItem {
  id: string
  name: string
  description: string
  icon: string
  connected: boolean
  status_label: string
}

export interface UserProfile {
  name: string
  email: string
  accountability_persona: string
  avatar_url?: string
  timezone: string
}

export interface StandardError {
  error: string
  code: string
}
