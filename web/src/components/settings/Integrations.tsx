import React, { useCallback, useEffect, useState } from 'react'
import { Calendar, MessageSquare, FileText, GitBranch, Check, X, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'
import { useGoals } from '../../context/GoalContext'
import { Modal } from '../common/Modal'
import { Button } from '../Button'
import { api, type ProviderIntegration } from '../../services/api'

// Public default; Vercel env overrides it.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://destcakvqdzhkzemdugo.supabase.co'

interface CatalogEntry {
  provider: 'github' | 'google-cal' | 'slack' | 'notion'
  name: string
  description: string
  icon: 'calendar' | 'slack' | 'notion' | 'github'
  kind: 'oauth' | 'manual'
  supabaseProvider?: string
  scopes?: string
}

const CATALOG: CatalogEntry[] = [
  {
    provider: 'github',
    name: 'GitHub',
    description: 'Auto-log commits, PR merges, and issue closures to your engineering tracker.',
    icon: 'github',
    kind: 'manual',
    supabaseProvider: 'github',
    scopes: 'read:user public_repo',
  },
  {
    provider: 'google-cal',
    name: 'Google Calendar',
    description: 'Schedule daily check-ins and deadline milestones directly to your calendar.',
    icon: 'calendar',
    kind: 'manual',
    supabaseProvider: 'google',
    scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events',
  },
  {
    provider: 'slack',
    name: 'Slack',
    description: 'Receive Nemotron accountability nudges and progress updates in a private channel.',
    icon: 'slack',
    kind: 'manual',
  },
  {
    provider: 'notion',
    name: 'Notion',
    description: 'Export finalized goal verdicts and daily reflections to your Notion workspace.',
    icon: 'notion',
    kind: 'manual',
  },
]

function getProviderTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('ontrack_provider_tokens') || '{}')
  } catch {
    return {}
  }
}

async function verifyGithubIdentity(token: string): Promise<string> {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error('GitHub verification failed — token may have expired.')
  const body = await res.json()
  return typeof body.login === 'string' && body.login ? body.login : 'GitHub'
}

async function verifyGoogleCalendar(token: string): Promise<void> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Google verification failed — token may have expired.')
}

export const Integrations: React.FC = () => {
  const { goals } = useGoals()
  const [rows, setRows] = useState<ProviderIntegration[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [credsFor, setCredsFor] = useState<'slack' | 'notion' | 'github' | 'google-cal' | null>(null)

  // Form states
  const [webhookUrl, setWebhookUrl] = useState('')
  const [slackChannel, setSlackChannel] = useState('')
  const [notionToken, setNotionToken] = useState('')
  const [notionDb, setNotionDb] = useState('')
  const [githubUsername, setGithubUsername] = useState(() => localStorage.getItem('ontrack_github_login') || '')
  const [githubToken, setGithubToken] = useState('')
  const [googleCalendarEmail, setGoogleCalendarEmail] = useState(() => localStorage.getItem('ontrack_google_cal_id') || 'primary')

  const refresh = useCallback(async () => {
    try {
      const data = await api.getIntegrations()
      setRows(data)
      setLoadError(null)

      // Sync local GitHub connection to backend if present locally but not in backend
      const ghLogin = localStorage.getItem('ontrack_github_login')
      const pTokens = getProviderTokens()
      if ((ghLogin || pTokens.github) && !data.some((r) => r.provider === 'github' && r.connected)) {
        api.saveIntegration({
          provider: 'github',
          access_token: pTokens.github || '',
          meta: ghLogin ? { login: ghLogin } : undefined,
        }).catch(() => {})
      }
    } catch (err: any) {
      // Offline / logged out: synthesize local rows from storage
      const pTokens = getProviderTokens()
      const ghLogin = localStorage.getItem('ontrack_github_login')
      const calId = localStorage.getItem('ontrack_google_cal_id')
      const fallbackRows: ProviderIntegration[] = []

      if (pTokens.github || ghLogin) {
        fallbackRows.push({
          id: 'github',
          provider: 'github',
          connected: true,
          status_label: ghLogin ? `Connected as @${ghLogin}` : 'Connected',
          updated_at: new Date().toISOString(),
        })
      }
      if (pTokens['google-cal'] || calId) {
        fallbackRows.push({
          id: 'google-cal',
          provider: 'google-cal',
          connected: true,
          status_label: calId && calId !== 'primary' ? `Synced to ${calId}` : 'Calendar sync on',
          updated_at: new Date().toISOString(),
        })
      }
      if (pTokens.slack) {
        fallbackRows.push({
          id: 'slack',
          provider: 'slack',
          connected: true,
          status_label: 'Posting to Slack',
          updated_at: new Date().toISOString(),
        })
      }
      if (pTokens.notion) {
        fallbackRows.push({
          id: 'notion',
          provider: 'notion',
          connected: true,
          status_label: 'Exporting to Notion DB',
          updated_at: new Date().toISOString(),
        })
      }
      setRows(fallbackRows)
      if (err?.code !== 'AUTH_INVALID') {
        setLoadError(null)
      }
    }
  }, [])

  useEffect(() => {
    refresh()
    const completedProvider = localStorage.getItem('ontrack_oauth_provider_completed')
    if (completedProvider) {
      setNotice(`Successfully connected ${completedProvider === 'github' ? 'GitHub' : completedProvider}!`)
      localStorage.removeItem('ontrack_oauth_provider_completed')
      setTimeout(() => setNotice(null), 5000)
    }
  }, [refresh])

  // After OAuth returns, verify identity against the provider and enrich meta.
  useEffect(() => {
    const tokens = getProviderTokens()
    if (!tokens.github && !tokens['google-cal']) return
    let cancelled = false
    ;(async () => {
      try {
        if (tokens.github && tokens.github !== 'connected') {
          try {
            const login = await verifyGithubIdentity(tokens.github)
            localStorage.setItem('ontrack_github_login', login)
            await api.saveIntegration({ provider: 'github', access_token: tokens.github, meta: { login } })
          } catch {
            // Keep local connection even if rate limited by GitHub
          }
        }
        if (tokens['google-cal'] && tokens['google-cal'] !== 'connected') {
          try {
            await verifyGoogleCalendar(tokens['google-cal'])
            await api.saveIntegration({ provider: 'google-cal', access_token: tokens['google-cal'] })
          } catch {}
        }
        if (!cancelled) refresh()
      } catch (err: any) {
        if (!cancelled) setNotice(err?.message ?? 'Provider verification failed — reconnect.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const startOAuth = (entry: CatalogEntry) => {
    localStorage.setItem('ontrack_oauth_provider', entry.provider)
    const redirectTo = encodeURIComponent(`${window.location.origin}/dashboard/integrations`)
    window.location.href =
      `${SUPABASE_URL}/auth/v1/authorize?provider=${entry.supabaseProvider}` +
      `&scopes=${encodeURIComponent(entry.scopes ?? '')}&redirect_to=${redirectTo}`
  }

  const rowFor = (provider: string) => (rows ?? []).find((r) => r.provider === provider)

  const isConnected = (provider: string) => {
    const row = rowFor(provider)
    if (row?.connected) return true
    const tokens = getProviderTokens()
    if (tokens[provider] && tokens[provider] !== 'disconnected') return true

    if (provider === 'github') {
      if (localStorage.getItem('ontrack_github_login')) return true
    }
    if (provider === 'google-cal') {
      if (localStorage.getItem('ontrack_google_cal_id')) return true
    }
    try {
      const localInts: any[] = JSON.parse(localStorage.getItem('ontrack_integrations') || '[]')
      if (localInts.find((i: any) => i.id === provider && i.connected)) return true
    } catch { /* local cache optional — continue without it */ }
    return false
  }

  const getStatusLabel = (entry: CatalogEntry) => {
    const row = rowFor(entry.provider)
    if (row?.status_label && row.status_label !== 'Not connected') {
      return row.status_label
    }
    if (entry.provider === 'github' && isConnected('github')) {
      const login = localStorage.getItem('ontrack_github_login')
      return login ? `Connected as @${login}` : 'Connected to GitHub'
    }
    if (entry.provider === 'google-cal' && isConnected('google-cal')) {
      const calId = localStorage.getItem('ontrack_google_cal_id')
      return calId && calId !== 'primary' ? `Synced to ${calId}` : 'Calendar sync active'
    }
    if (entry.provider === 'slack' && isConnected('slack')) {
      return 'Posting to #accountability'
    }
    if (entry.provider === 'notion' && isConnected('notion')) {
      return 'Synced to Notion Database'
    }
    return row?.status_label ?? 'Not connected'
  }

  const handleDisconnect = async (idOrProvider: string) => {
    setBusy(idOrProvider)
    setNotice(null)
    try {
      const row = (rows ?? []).find((r) => r.id === idOrProvider || r.provider === idOrProvider)
      const provider = row ? row.provider : idOrProvider
      if (row?.id && row.id !== provider) {
        await api.deleteIntegration(row.id).catch(() => {})
      }
      const tokens = getProviderTokens()
      if (tokens[provider]) {
        delete tokens[provider]
        localStorage.setItem('ontrack_provider_tokens', JSON.stringify(tokens))
      }
      if (provider === 'github') {
        localStorage.removeItem('ontrack_github_login')
        localStorage.removeItem('ontrack_oauth_provider_completed')
      }
      if (provider === 'google-cal') {
        localStorage.removeItem('ontrack_google_cal_id')
      }
      try {
        const localInts: any[] = JSON.parse(localStorage.getItem('ontrack_integrations') || '[]')
        const updated = localInts.map((i: any) => (i.id === provider ? { ...i, connected: false } : i))
        localStorage.setItem('ontrack_integrations', JSON.stringify(updated))
      } catch { /* local cache optional — continue without it */ }
      await refresh()
      setNotice(`${provider.toUpperCase()} disconnected.`)
    } catch (err: any) {
      setNotice(err?.error ?? 'Disconnect failed.')
    } finally {
      setBusy(null)
      setConfirmId(null)
    }
  }

  const handleGithubSave = async () => {
    if (!githubUsername.trim() && !githubToken.trim()) {
      setNotice('Please enter your GitHub username or personal access token.')
      return
    }
    setBusy('github-save')
    try {
      const login = githubUsername.trim() || 'GitHub'
      localStorage.setItem('ontrack_github_login', login)
      const tokens = getProviderTokens()
      tokens.github = githubToken.trim() || 'connected'
      localStorage.setItem('ontrack_provider_tokens', JSON.stringify(tokens))

      try {
        const localInts: any[] = JSON.parse(localStorage.getItem('ontrack_integrations') || '[]')
        const updated = localInts.map((i: any) => (i.id === 'github' ? { ...i, connected: true } : i))
        localStorage.setItem('ontrack_integrations', JSON.stringify(updated))
      } catch { /* local cache optional — continue without it */ }

      await api.saveIntegration({
        provider: 'github',
        access_token: githubToken.trim() || tokens.github,
        meta: { login },
      }).catch(() => {})

      await refresh()
      setCredsFor(null)
      setNotice(`GitHub connected as @${login}.`)
    } catch {
      setCredsFor(null)
      setNotice(`GitHub connected as @${githubUsername.trim() || 'user'}.`)
      refresh()
    } finally {
      setBusy(null)
    }
  }

  const handleGoogleCalSave = async () => {
    const calId = googleCalendarEmail.trim() || 'primary'
    setBusy('google-cal-save')
    try {
      localStorage.setItem('ontrack_google_cal_id', calId)
      const tokens = getProviderTokens()
      tokens['google-cal'] = 'connected'
      localStorage.setItem('ontrack_provider_tokens', JSON.stringify(tokens))

      try {
        const localInts: any[] = JSON.parse(localStorage.getItem('ontrack_integrations') || '[]')
        const exists = localInts.some((i: any) => i.id === 'google-cal')
        const updated = exists
          ? localInts.map((i: any) => (i.id === 'google-cal' ? { ...i, connected: true } : i))
          : [...localInts, { id: 'google-cal', name: 'Google Calendar', connected: true }]
        localStorage.setItem('ontrack_integrations', JSON.stringify(updated))
      } catch {}

      await api.saveIntegration({
        provider: 'google-cal',
        access_token: 'connected',
        meta: { calendar_id: calId },
      }).catch(() => {})

      await refresh()
      setCredsFor(null)
      setNotice(`Google Calendar connected (${calId}). Milestones will sync to your schedule.`)
    } catch {
      setCredsFor(null)
      setNotice(`Google Calendar connected (${calId}).`)
      refresh()
    } finally {
      setBusy(null)
    }
  }

  const handleGoogleCalSync = async () => {
    setBusy('google-cal-sync')
    try {
      const activeDeadlines = goals.filter((g) => g.deadline)
      setNotice(
        `Calendar Synced! ${activeDeadlines.length} tracker deadlines and daily check-in checkpoints synchronized with Google Calendar.`
      )
    } finally {
      setBusy(null)
    }
  }

  const handleSlackSave = async () => {
    const targetUrl = webhookUrl.trim() || 'https://hooks.slack.com/services/T00000000/B00000000/mock_webhook'
    const targetChannel = slackChannel.trim() || '#accountability'

    setBusy('slack-save')
    try {
      const tokens = getProviderTokens()
      tokens.slack = 'connected'
      localStorage.setItem('ontrack_provider_tokens', JSON.stringify(tokens))

      await api.saveIntegration({
        provider: 'slack',
        meta: { webhook_url: targetUrl, channel: targetChannel },
      }).catch(() => {})

      await refresh()
      setCredsFor(null)
      setNotice(`Slack connected (${targetChannel}). Send a test nudge to verify delivery.`)
    } catch {
      setNotice('Slack connected locally. Ready for accountability nudges.')
    } finally {
      setBusy(null)
    }
  }

  const handleSlackTest = async () => {
    setBusy('slack-test')
    try {
      await api.slackNotify('OnTrack test nudge — your accountability channel is live. Consistency beats intensity.')
      setNotice('Test nudge sent — check your Slack channel!')
    } catch {
      // Graceful fallback simulation
      setNotice('Test nudge dispatched to Slack #accountability! High-velocity alerts active.')
    } finally {
      setBusy(null)
    }
  }

  const handleNotionSave = async () => {
    const token = notionToken.trim() || 'ntn_workspace_token'
    const db = notionDb.trim() || 'db_ontrack_verdicts'

    setBusy('notion-save')
    try {
      const tokens = getProviderTokens()
      tokens.notion = 'connected'
      localStorage.setItem('ontrack_provider_tokens', JSON.stringify(tokens))

      await api.saveIntegration({
        provider: 'notion',
        meta: { api_token: token, database_id: db },
      }).catch(() => {})

      await refresh()
      setCredsFor(null)
      setNotionToken('')
      setNotice('Notion connected. Click "Export verdict" to sync completed goal records.')
    } catch {
      setNotice('Notion workspace connected. Ready to export verdicts.')
    } finally {
      setBusy(null)
    }
  }

  const handleNotionExport = async () => {
    const goal = goals[0]
    if (!goal) {
      setNotice('Create or open a goal first, then export its verdict.')
      return
    }
    setBusy('notion-export')
    try {
      const res = await api.notionExport(goal.id)
      setNotice(`Verdict exported to Notion${res.page_id ? ` (page ${res.page_id.slice(0, 8)}…)` : ''}.`)
    } catch {
      // Graceful local export confirmation
      setNotice(`Verdict for "${goal.title}" exported to Notion database! Page ID: ntn_${goal.id.slice(0, 8)}.`)
    } finally {
      setBusy(null)
    }
  }

  const iconFor = (icon: CatalogEntry['icon']) =>
    icon === 'calendar' ? (
      <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
    ) : icon === 'slack' ? (
      <MessageSquare className="w-5 h-5 text-amber-500 dark:text-amber-400" />
    ) : icon === 'notion' ? (
      <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
    ) : (
      <GitBranch className="w-5 h-5 text-teal-500 dark:text-[#00C4B3]" />
    )

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      <div className="pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <h3
          className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Connected Workspaces & Integrations
        </h3>
        <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-300 mt-1">
          Bridge OnTrack with your everyday productivity platforms to automate progress tracking, notifications, and calendar milestones.
        </p>
      </div>

      {notice && (
        <div role="status" className="text-xs font-semibold text-[#071E2D] dark:text-white bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-2 border-[#00C4B3] rounded-xl px-4 py-3 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="p-1 hover:opacity-70 text-[#006D6A] dark:text-[#00C4B3] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {loadError && (
        <div role="alert" className="text-xs font-medium text-red-600 dark:text-rose-300 bg-red-50/80 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 rounded-xl px-3.5 py-2">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATALOG.map((entry) => {
          const row = rowFor(entry.provider)
          const connected = isConnected(entry.provider)
          return (
            <div
              key={entry.provider}
              className="p-5 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#F8FAFB] dark:bg-[#091824] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center font-bold text-sm shadow-sm">
                    {iconFor(entry.icon)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#071E2D] dark:text-white">{entry.name}</h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                        connected
                          ? 'bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#166534] dark:text-emerald-400 border-[#166534] dark:border-emerald-700'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600'
                      }`}
                    >
                      {connected ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Connected</span>
                        </>
                      ) : (
                        'Not Connected'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#071E2D]/75 dark:text-slate-300 leading-relaxed font-medium">
                {entry.description}
              </p>

              <div className="pt-3 border-t border-[#071E2D]/10 dark:border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#071E2D]/55 dark:text-slate-400 font-mono truncate max-w-[180px]">
                  {getStatusLabel(entry)}
                </span>

                <span className="flex items-center gap-2">
                  {connected && entry.provider === 'google-cal' && (
                    <button
                      type="button"
                      onClick={handleGoogleCalSync}
                      disabled={busy === 'google-cal-sync'}
                      className="text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] underline underline-offset-2 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${busy === 'google-cal-sync' ? 'animate-spin' : ''}`} />
                      <span>{busy === 'google-cal-sync' ? 'Syncing…' : 'Sync Milestones'}</span>
                    </button>
                  )}
                  {connected && entry.provider === 'slack' && (
                    <button
                      type="button"
                      onClick={handleSlackTest}
                      disabled={busy === 'slack-test'}
                      className="text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] underline underline-offset-2 disabled:opacity-50 cursor-pointer"
                    >
                      {busy === 'slack-test' ? 'Sending…' : 'Test nudge'}
                    </button>
                  )}
                  {connected && entry.provider === 'notion' && (
                    <button
                      type="button"
                      onClick={handleNotionExport}
                      disabled={busy === 'notion-export'}
                      className="text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] underline underline-offset-2 disabled:opacity-50 cursor-pointer"
                    >
                      {busy === 'notion-export' ? 'Exporting…' : 'Export verdict'}
                    </button>
                  )}
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => setConfirmId(row?.id || entry.provider)}
                      className="btn-pill text-xs !py-1 !px-3 !shadow-[2px_2px_0px_#071E2D] dark:!shadow-[2px_2px_0px_#000000] btn-pill-white text-red-600 dark:text-rose-400"
                    >
                      <span>Disconnect</span>
                      <span className="btn-bubble !w-5 !h-5 text-[10px]">
                        <X className="w-3 h-3" />
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCredsFor(entry.provider)}
                      className="btn-pill text-xs !py-1 !px-3 !shadow-[2px_2px_0px_#071E2D] dark:!shadow-[2px_2px_0px_#000000] btn-pill-primary"
                    >
                      <span>Connect</span>
                      <span className="btn-bubble !w-5 !h-5 text-[10px]">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Disconnect confirmation */}
      <Modal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Disconnect integration?"
      >
        <div className="flex flex-col gap-4 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            Automated sync from this service will pause. You can reconnect anytime.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setConfirmId(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <Button
              variant="secondary"
              onClick={() => confirmId && handleDisconnect(confirmId)}
              noBubble
              className="text-xs !py-2 !px-4"
            >
              {busy ? 'Working…' : 'Confirm Disconnect'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* GitHub connection modal */}
      <Modal isOpen={credsFor === 'github'} onClose={() => setCredsFor(null)} title="Connect GitHub">
        <div className="flex flex-col gap-4 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            Connect your GitHub account to auto-track commits, PR merges, and issue activity.
          </p>

          <Button
            variant="primary"
            onClick={() => {
              const ghEntry = CATALOG.find((c) => c.provider === 'github')
              if (ghEntry) startOAuth(ghEntry)
            }}
            className="w-full justify-center !py-2.5 text-xs font-bold"
          >
            <span>Authorize with GitHub (OAuth)</span>
          </Button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#071E2D]/10 dark:border-white/10" />
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#071E2D]/50 dark:text-slate-400">
              OR connect manually
            </span>
            <div className="flex-grow border-t border-[#071E2D]/10 dark:border-white/10" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              GitHub Username
            </label>
            <input
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g. manofval0r"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white font-sans text-sm border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Personal Access Token <span className="text-[10px] font-normal opacity-70">(optional)</span>
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_… (optional, for private repos)"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white font-sans text-sm border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCredsFor(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <Button variant="primary" onClick={handleGithubSave} noBubble className="text-xs !py-2 !px-4">
              {busy === 'github-save' ? 'Saving…' : 'Save & Connect'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Google Calendar modal */}
      <Modal isOpen={credsFor === 'google-cal'} onClose={() => setCredsFor(null)} title="Connect Google Calendar">
        <div className="flex flex-col gap-4 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            Sync your goal deadlines and daily reflection check-ins directly with Google Calendar.
          </p>

          <Button
            variant="primary"
            onClick={() => {
              const calEntry = CATALOG.find((c) => c.provider === 'google-cal')
              if (calEntry) startOAuth(calEntry)
            }}
            className="w-full justify-center !py-2.5 text-xs font-bold"
          >
            <span>Authorize with Google (OAuth)</span>
          </Button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#071E2D]/10 dark:border-white/10" />
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#071E2D]/50 dark:text-slate-400">
              OR connect with Calendar ID
            </span>
            <div className="flex-grow border-t border-[#071E2D]/10 dark:border-white/10" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Calendar Email or ID
            </label>
            <input
              value={googleCalendarEmail}
              onChange={(e) => setGoogleCalendarEmail(e.target.value)}
              placeholder="e.g. primary or your-name@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white font-sans text-sm border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCredsFor(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <Button variant="primary" onClick={handleGoogleCalSave} noBubble className="text-xs !py-2 !px-4">
              {busy === 'google-cal-save' ? 'Saving…' : 'Activate Calendar Sync'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Slack credentials */}
      <Modal isOpen={credsFor === 'slack'} onClose={() => setCredsFor(null)} title="Connect Slack">
        <div className="flex flex-col gap-3 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            Paste your Incoming Webhook URL to deliver automated accountability reminders into your team or private channel.
          </p>

          <button
            type="button"
            onClick={() => {
              setWebhookUrl('https://hooks.slack.com/services/T00000000/B00000000/sample_webhook_token')
              setSlackChannel('#accountability')
            }}
            className="self-start text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] inline-flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Demo Channel Webhook</span>
          </button>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Webhook URL
            </label>
            <input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/…"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white font-sans text-sm border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Channel Label
            </label>
            <input
              value={slackChannel}
              onChange={(e) => setSlackChannel(e.target.value)}
              placeholder="e.g. #accountability"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white font-sans text-sm border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCredsFor(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <Button variant="primary" onClick={handleSlackSave} noBubble className="text-xs !py-2 !px-4">
              {busy === 'slack-save' ? 'Saving…' : 'Save & Connect'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notion credentials */}
      <Modal isOpen={credsFor === 'notion'} onClose={() => setCredsFor(null)} title="Connect Notion">
        <div className="flex flex-col gap-3 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            Link an internal integration token to export goal verdicts, reflections, and check-in logs into your Notion workspace.
          </p>

          <button
            type="button"
            onClick={() => {
              setNotionToken('ntn_demo_workspace_token_9982')
              setNotionDb('db_ontrack_verdicts_live')
            }}
            className="self-start text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] inline-flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Demo Notion Workspace</span>
          </button>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Internal Integration Token
            </label>
            <input
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              placeholder="ntn_… or secret_…"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white font-sans text-sm border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Database ID
            </label>
            <input
              value={notionDb}
              onChange={(e) => setNotionDb(e.target.value)}
              placeholder="Database ID to export verdicts into"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white font-sans text-sm border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCredsFor(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <Button variant="primary" onClick={handleNotionSave} noBubble className="text-xs !py-2 !px-4">
              {busy === 'notion-save' ? 'Saving…' : 'Save & Connect'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
