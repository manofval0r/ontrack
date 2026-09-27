import React, { useCallback, useEffect, useState } from 'react'
import { Calendar, MessageSquare, FileText, GitBranch, Check, X, ArrowRight } from 'lucide-react'
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
    kind: 'oauth',
    supabaseProvider: 'github',
    scopes: 'read:user public_repo',
  },
  {
    provider: 'google-cal',
    name: 'Google Calendar',
    description: 'Schedule daily check-ins and deadline milestones directly to your calendar.',
    icon: 'calendar',
    kind: 'oauth',
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
  const [credsFor, setCredsFor] = useState<'slack' | 'notion' | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [slackChannel, setSlackChannel] = useState('')
  const [notionToken, setNotionToken] = useState('')
  const [notionDb, setNotionDb] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await api.getIntegrations()
      setRows(data)
      setLoadError(null)
    } catch (err: any) {
      // Offline / logged out: tab renders empty (GoalContext keeps local demo list).
      setRows([])
      setLoadError(err?.code === 'AUTH_INVALID' ? 'Log in to manage integrations.' : 'Could not load integrations.')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // After OAuth returns, verify identity against the provider and enrich meta.
  useEffect(() => {
    const tokens = getProviderTokens()
    if (!tokens.github && !tokens['google-cal']) return
    let cancelled = false
    ;(async () => {
      try {
        if (tokens.github) {
          const login = await verifyGithubIdentity(tokens.github)
          await api.saveIntegration({ provider: 'github', access_token: tokens.github, meta: { login } })
        }
        if (tokens['google-cal']) {
          await verifyGoogleCalendar(tokens['google-cal'])
          await api.saveIntegration({ provider: 'google-cal', access_token: tokens['google-cal'] })
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
    const redirectTo = encodeURIComponent(`${window.location.origin}/settings`)
    window.location.href =
      `${SUPABASE_URL}/auth/v1/authorize?provider=${entry.supabaseProvider}` +
      `&scopes=${encodeURIComponent(entry.scopes ?? '')}&redirect_to=${redirectTo}`
  }

  const rowFor = (provider: string) => (rows ?? []).find((r) => r.provider === provider)

  const handleDisconnect = async (id: string) => {
    setBusy(id)
    setNotice(null)
    try {
      await api.deleteIntegration(id)
      const tokens = getProviderTokens()
      const row = (rows ?? []).find((r) => r.id === id)
      if (row && tokens[row.provider]) {
        delete tokens[row.provider]
        localStorage.setItem('ontrack_provider_tokens', JSON.stringify(tokens))
      }
      await refresh()
    } catch (err: any) {
      setNotice(err?.error ?? 'Disconnect failed.')
    } finally {
      setBusy(null)
      setConfirmId(null)
    }
  }

  const handleSlackSave = async () => {
    if (!webhookUrl.startsWith('https://')) {
      setNotice('Paste a valid https:// Slack webhook URL.')
      return
    }
    setBusy('slack-save')
    try {
      await api.saveIntegration({
        provider: 'slack',
        meta: { webhook_url: webhookUrl.trim(), channel: slackChannel.trim() || 'webhook' },
      })
      await refresh()
      setCredsFor(null)
      setNotice('Slack connected. Send a test nudge to verify delivery.')
    } catch (err: any) {
      setNotice(err?.error ?? 'Could not save Slack webhook.')
    } finally {
      setBusy(null)
    }
  }

  const handleSlackTest = async () => {
    setBusy('slack-test')
    try {
      await api.slackNotify('OnTrack test nudge — your accountability channel is live. Consistency beats intensity.')
      setNotice('Test nudge sent — check the channel.')
    } catch (err: any) {
      setNotice(err?.error ?? 'Slack post failed.')
    } finally {
      setBusy(null)
    }
  }

  const handleNotionSave = async () => {
    if (!notionToken.trim() || !notionDb.trim()) {
      setNotice('Both the integration token and database ID are required.')
      return
    }
    setBusy('notion-save')
    try {
      await api.saveIntegration({
        provider: 'notion',
        meta: { api_token: notionToken.trim(), database_id: notionDb.trim() },
      })
      await refresh()
      setCredsFor(null)
      setNotionToken('')
      setNotice('Notion connected. Export a verdict to verify.')
    } catch (err: any) {
      setNotice(err?.error ?? 'Could not save Notion credentials.')
    } finally {
      setBusy(null)
    }
  }

  const handleNotionExport = async () => {
    const goal = goals[0]
    if (!goal) {
      setNotice('Create a goal first, then export its verdict.')
      return
    }
    setBusy('notion-export')
    try {
      const res = await api.notionExport(goal.id)
      setNotice(`Verdict exported to Notion${res.page_id ? ` (page ${res.page_id.slice(0, 8)}…)` : ''}.`)
    } catch (err: any) {
      setNotice(err?.error ?? 'Notion export failed.')
    } finally {
      setBusy(null)
    }
  }

  const iconFor = (icon: CatalogEntry['icon']) =>
    icon === 'calendar' ? (
      <Calendar className="w-5 h-5 text-indigo-500" />
    ) : icon === 'slack' ? (
      <MessageSquare className="w-5 h-5 text-amber-500" />
    ) : icon === 'notion' ? (
      <FileText className="w-5 h-5 text-emerald-500" />
    ) : (
      <GitBranch className="w-5 h-5 text-violet-500" />
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
          Bridge OnTrack with your everyday productivity platforms to automate progress tracking.
        </p>
      </div>

      {notice && (
        <div role="status" className="text-xs font-medium text-[#071E2D] dark:text-white bg-[#ECFEFF] dark:bg-[#00C4B3]/10 border-2 border-[#00C4B3] rounded-xl px-3.5 py-2">
          {notice}
        </div>
      )}
      {loadError && (
        <div role="alert" className="text-xs font-medium text-red-600 bg-red-50/80 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 rounded-xl px-3.5 py-2">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATALOG.map((entry) => {
          const row = rowFor(entry.provider)
          const connected = !!row?.connected
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
                  {row?.status_label ?? 'Not connected'}
                </span>

                <span className="flex items-center gap-2">
                  {connected && entry.provider === 'slack' && (
                    <button
                      type="button"
                      onClick={handleSlackTest}
                      disabled={busy === 'slack-test'}
                      className="text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] underline underline-offset-2 disabled:opacity-50"
                    >
                      {busy === 'slack-test' ? 'Sending…' : 'Test nudge'}
                    </button>
                  )}
                  {connected && entry.provider === 'notion' && (
                    <button
                      type="button"
                      onClick={handleNotionExport}
                      disabled={busy === 'notion-export'}
                      className="text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] underline underline-offset-2 disabled:opacity-50"
                    >
                      {busy === 'notion-export' ? 'Exporting…' : 'Export verdict'}
                    </button>
                  )}
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => setConfirmId(row!.id)}
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
                      onClick={() =>
                        entry.kind === 'oauth'
                          ? startOAuth(entry)
                          : setCredsFor(entry.provider as 'slack' | 'notion')
                      }
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
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white"
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

      {/* Slack credentials */}
      <Modal isOpen={credsFor === 'slack'} onClose={() => setCredsFor(null)} title="Connect Slack">
        <div className="flex flex-col gap-3 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            Paste an incoming webhook URL (Slack → your channel → Integrations → Add → Incoming WebHooks).
          </p>
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/…"
            className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#0E202D] font-sans text-sm border-[#071E2D]/20 focus:border-[#00C4B3] outline-none"
          />
          <input
            value={slackChannel}
            onChange={(e) => setSlackChannel(e.target.value)}
            placeholder="Channel label, e.g. #accountability (optional)"
            className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#0E202D] font-sans text-sm border-[#071E2D]/20 focus:border-[#00C4B3] outline-none"
          />
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCredsFor(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white"
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
            Create an internal integration at notion.so/my-integrations, share a database with it, then paste both values.
          </p>
          <input
            value={notionToken}
            onChange={(e) => setNotionToken(e.target.value)}
            placeholder="Internal integration token (ntn_… / secret_…)"
            className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#0E202D] font-sans text-sm border-[#071E2D]/20 focus:border-[#00C4B3] outline-none"
          />
          <input
            value={notionDb}
            onChange={(e) => setNotionDb(e.target.value)}
            placeholder="Database ID to export verdicts into"
            className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#0E202D] font-sans text-sm border-[#071E2D]/20 focus:border-[#00C4B3] outline-none"
          />
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCredsFor(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white"
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
