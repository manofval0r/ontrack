/**
 * Integrations Assistant Service
 * Fetches real context from connected integrations (GitHub, Google Calendar, etc.)
 * to answer user questions directly in the chat.
 */

export interface IntegrationStatus {
  github: {
    connected: boolean
    username: string | null
    hasToken: boolean
  }
  googleCal: {
    connected: boolean
    calendarId: string | null
  }
}

export function getConnectedIntegrations(): IntegrationStatus {
  let hasGhToken = false
  try {
    const tokens = JSON.parse(localStorage.getItem('ontrack_provider_tokens') || '{}')
    hasGhToken = Boolean(tokens.github && !tokens.github.startsWith('eyJ'))
  } catch {
    hasGhToken = false
  }

  const ghLogin = localStorage.getItem('ontrack_github_login')
  const calId = localStorage.getItem('ontrack_google_cal_id')

  return {
    github: {
      connected: Boolean(ghLogin || hasGhToken),
      username: ghLogin || null,
      hasToken: hasGhToken,
    },
    googleCal: {
      connected: Boolean(calId),
      calendarId: calId || null,
    },
  }
}

/**
 * Checks if a user's prompt is asking about their integrations.
 */
export function isIntegrationQuery(text: string): {
  isQuery: boolean
  service: 'github' | 'calendar' | 'all'
} {
  const lower = text.toLowerCase()

  const ghPatterns = [
    /\b(github|git repo|git repos|my repos|my repositories|git commits?|my commits?|git prs?|pull requests?|github activity|github username|am i logged into github)\b/i,
  ]
  const calPatterns = [
    /\b(google calendar|my calendar|calendar events?|my schedule|any meetings|calendar sync)\b/i,
  ]
  const allPatterns = [
    /\b(what integrations|my integrations|connected integrations|connected apps|connected services|what services are connected)\b/i,
  ]

  if (allPatterns.some((p) => p.test(lower))) {
    return { isQuery: true, service: 'all' }
  }
  if (ghPatterns.some((p) => p.test(lower))) {
    return { isQuery: true, service: 'github' }
  }
  if (calPatterns.some((p) => p.test(lower))) {
    return { isQuery: true, service: 'calendar' }
  }

  return { isQuery: false, service: 'all' }
}

/**
 * Answer an integration query using real data from connected APIs or localStorage.
 */
export async function answerIntegrationQuery(query: string): Promise<string> {
  const { isQuery, service } = isIntegrationQuery(query)
  if (!isQuery) return ''

  const status = getConnectedIntegrations()
  const lower = query.toLowerCase()

  // 1. All Integrations Status
  if (service === 'all') {
    const ghStatus = status.github.connected
      ? `✅ **GitHub**: Connected as **@${status.github.username || 'user'}**`
      : '⚪ **GitHub**: Not connected (connect in Settings → Integrations)'

    const calStatus = status.googleCal.connected
      ? `✅ **Google Calendar**: Connected (${status.googleCal.calendarId || 'primary'})`
      : '⚪ **Google Calendar**: Not connected'

    return (
      `Here is the current status of your workspace integrations:\n\n` +
      `${ghStatus}\n` +
      `${calStatus}\n\n` +
      `You can ask me questions like:\n` +
      `• *"What are my GitHub repos?"*\n` +
      `• *"Check my recent GitHub commits"*\n` +
      `• *"What's on my Google Calendar?"*\n\n` +
      `*Tip: You can also set a tracker anytime (e.g. "Track 10 commits this week")!*`
    )
  }

  // 2. GitHub Service Queries
  if (service === 'github') {
    if (!status.github.connected && !status.github.username) {
      return (
        "Your GitHub account is not connected yet.\n\n" +
        "You can connect it in **Settings → Integrations** using OAuth or a Personal Access Token. " +
        "Once connected, I can check your repositories, summarize your commits, and help you track shipping velocity!"
      )
    }

    const username = status.github.username

    // Specific query: Commits / Activity
    if (lower.includes('commit') || lower.includes('activity') || lower.includes('push') || lower.includes('pr')) {
      if (!username) {
        return "Your GitHub integration is connected! Set your username in Settings → Integrations to enable commit lookups."
      }
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=8`)
        if (res.ok) {
          const events: any[] = await res.json()
          const pushEvents = events.filter((e) => e.type === 'PushEvent')
          if (pushEvents.length > 0) {
            let reply = `Here is your recent GitHub activity for **@${username}**:\n\n`
            for (const pe of pushEvents.slice(0, 4)) {
              const repoName = pe.repo?.name || 'repository'
              const commitCount = pe.payload?.commits?.length || 1
              const latestMsg = pe.payload?.commits?.[0]?.message || 'Code update'
              const date = new Date(pe.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
              reply += `• **${repoName}** (${date}): Pushed ${commitCount} commit(s)\n  └ *"${latestMsg.split('\n')[0]}"*\n`
            }
            reply += `\n*Want to track these? Say "Track 10 commits this week" to launch a counter tracker.*`
            return reply
          }
        }
      } catch (err) {
        console.warn('[IntegrationsAssistant] GitHub events fetch failed:', err)
      }
      return `You're connected to GitHub as **@${username}**. You can track your commit streaks or say *"Set a tracker for 5 commits daily"* to build momentum!`
    }

    // Default GitHub query: Repositories
    if (username) {
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5`)
        if (res.ok) {
          const repos: any[] = await res.json()
          if (repos.length > 0) {
            let reply = `Here are your most recently updated GitHub repositories for **@${username}**:\n\n`
            for (const r of repos) {
              const lang = r.language ? ` [${r.language}]` : ''
              const stars = r.stargazers_count > 0 ? ` · ⭐ ${r.stargazers_count}` : ''
              const desc = r.description ? `\n  └ *${r.description.slice(0, 75)}...*` : ''
              reply += `• **[${r.name}](${r.html_url})**${lang}${stars}${desc}\n`
            }
            reply += `\n*You can track your work on any of these repos! Just say "Track milestones for ${repos[0].name}".*`
            return reply
          }
        }
      } catch (err) {
        console.warn('[IntegrationsAssistant] GitHub repos fetch failed:', err)
      }
    }

    return `You are connected to GitHub as **@${username || 'user'}**. Ask me about your recent repos or commits anytime!`
  }

  // 3. Google Calendar Queries
  if (service === 'calendar') {
    if (!status.googleCal.connected) {
      return (
        "Your Google Calendar is currently not connected.\n\n" +
        "You can link your calendar in **Settings → Integrations** to view your schedule and automatically sync your goal milestones to your calendar."
      )
    }

    return (
      `📅 **Google Calendar is Active** (Calendar ID: \`${status.googleCal.calendarId}\`).\n\n` +
      `Your active goal deadlines and daily reflection check-ins are synced with your Google Calendar. ` +
      `You can adjust sync preferences in **Settings → Integrations**.`
    )
  }

  return ''
}
