import type { Goal } from '../types'
import { isIntegrationQuery } from '../services/integrationsAssistant'

export type ClassifiedIntent =
  | { type: 'greeting'; responseText: string }
  | { type: 'acknowledgment'; responseText: string }
  | { type: 'status_query'; responseText?: string }
  | { type: 'help_query'; responseText: string }
  | { type: 'coaching_advice'; topic: 'motivation' | 'habits' | 'burnout' | 'general'; responseText: string }
  | { type: 'progress_log'; delta: number; rawText: string; matchedGoal?: Goal }
  | { type: 'goal_creation'; cleanTitle: string; suggestedType: Goal['goal_type'] }
  | { type: 'integration_query'; service: 'github' | 'calendar' | 'all'; rawText: string }
  | { type: 'general_chat'; responseText: string; rawText?: string }

// Words that typically indicate a greeting
const GREETING_REGEX = /^(hi|hello|hey|heya|howdy|yo|sup|hiya|greetings|good\s+(morning|afternoon|evening|day))(\s+.*)?$/i

// Conversational affirmations/acknowledgments
const ACK_REGEX = /^(ok|okay|cool|nice|thanks|thank you|ok,?\s*thank you|ok,?\s*thanks|thx|ty|got it|awesome|great|sure|alright|perfect|sounds good|understood|noted|yes|no|yep|nope|k|thank u)(\.|!)*$/i

// Casual non-goal statements that should be answered conversationally, never turned into trackers
const CASUAL_PHRASES: { pattern: RegExp; reply: string }[] = [
  {
    pattern: /\b(im|i'm|i am)\s+(hungry|starving|famished)\b/i,
    reply: "Sounds like a good time to fuel up! Take a quick food break to recharge, and let me know when you're ready to get back on track.",
  },
  {
    pattern: /\b(im|i'm|i am)\s+(tired|sleepy|exhausted|drained)\b/i,
    reply: "Rest and recovery are crucial for high performance. Take a quick break or power nap so you can return to your goals with clear focus.",
  },
  {
    pattern: /\b(im|i'm|i am)\s+(bored|doing nothing)\b/i,
    reply: "Boredom is the perfect cue to build momentum! You can ask me any question, or say *\"Track 20 mins reading\"* to set a tracker.",
  },
  {
    pattern: /^(test|testing|test ontrack|test 123|hello test|check|ping)(\s+.*)?$/i,
    reply: "OnTrack AI Assistant is active, synchronized, and ready! You can ask me questions, check your integrations, or say a target (e.g. *\"Sell 4 books today\"* or *\"Run 5km weekly\"*) to launch a tracker.",
  },
  {
    pattern: /\b(how are you|how're you|hows it going|how's it going|what's up|whats up)\b/i,
    reply: "I'm doing great and ready to assist! What are you working on today, or would you like to set a new tracker?",
  },
  {
    pattern: /\b(who are you|what do you do|what are you)\b/i,
    reply: "I'm your OnTrack AI Assistant. I can answer questions, connect with your integrations (like GitHub and Google Calendar), and set up trackers (Counter, Checklist, or Reflection) whenever you're ready.",
  },
]

// Queries asking about status, review, streak
const STATUS_REGEX = /(how am i doing|my status|shipping rate|progress report|how is my week|my summary|overall stats|show my stats|my streak|how am i tracking)/i

// Help and instructions
const HELP_REGEX = /^(help|how does this work|what can you do|who are you|how to use|commands|features)(\?|\.|!)?$/i

// Motivational or emotional coaching triggers
const COACHING_TRIGGERS: { [key: string]: 'motivation' | 'habits' | 'burnout' } = {
  lazy: 'motivation',
  'unmotivated': 'motivation',
  'no motivation': 'motivation',
  'procrastinat': 'motivation',
  'hard to start': 'motivation',
  'cant focus': 'motivation',
  "can't focus": 'motivation',
  'distracted': 'motivation',
  "don't feel like": 'motivation',
  "dont feel like": 'motivation',
  "not feeling it": 'motivation',
  "no drive": 'motivation',
  'habit': 'habits',
  'routine': 'habits',
  'consistency': 'habits',
  'discipline': 'habits',
  'tired': 'burnout',
  'burned out': 'burnout',
  'burnout': 'burnout',
  'overwhelmed': 'burnout',
  'stressed': 'burnout',
}

// Action verbs frequently paired with targets/quantities for personal habit or performance tracking
const GOAL_ACTION_VERBS = [
  'read', 'run', 'walk', 'sell', 'write', 'ship', 'close', 'study',
  'code', 'save', 'drink', 'do', 'lift', 'bench', 'meditate', 'practice',
  'workout', 'exercise', 'publish', 'earn', 'eat'
]

// Progress logging verbs (past or action)
const LOG_VERBS = [
  'did', 'logged', 'finished', 'sold', 'read', 'ran', 'completed',
  'done', 'hit', 'added', 'checked off', 'closed', 'wrote'
]

/**
 * Checks if a string represents an explicit goal creation intent.
 * Strict differentiator: general chat, questions, coding requests, and casual talk NEVER make trackers.
 */
export function isGoalCreationPrompt(text: string): { isGoal: boolean; cleanTitle: string; suggestedType: Goal['goal_type'] } {
  const trimmed = text.trim()
  if (trimmed.length < 4) {
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  const lower = trimmed.toLowerCase()

  // 1. Guard against ALL questions and conversational inquiries
  // (e.g. "what is python?", "how do I center a div?", "can you write code for me?", "explain async/await")
  const questionWordsRegex = /^(what|why|how|who|whom|when|where|which|whose|can|could|would|will|should|is|are|am|was|were|does|did|tell|explain|summarize|give me|help|suggest|recommend|compare|show|list)\b/i
  if (trimmed.endsWith('?') || questionWordsRegex.test(trimmed)) {
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  // 2. Guard against integrations queries (e.g., "what are my repos?", "check my github commits")
  if (isIntegrationQuery(trimmed).isQuery) {
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  // 3. Guard against greetings like "hi", "hello"
  if (GREETING_REGEX.test(trimmed) && !lower.includes('i want to') && !lower.includes('goal:')) {
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  // 4. Guard against acknowledgments
  if (ACK_REGEX.test(trimmed)) {
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  // 5. Guard against casual statements (feelings, testing, eating, tiredness)
  if (CASUAL_PHRASES.some((cp) => cp.pattern.test(trimmed))) {
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  if (/^(i am|i'm|im|i feel|i need food|i want food|im sleepy|im starving|i just|just saying|whats up)\b/i.test(trimmed)) {
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  // 6. Explicit goal keyword prefixes (e.g. "track 50 pushups", "create a goal to read 5 books", "set tracker for...")
  const explicitPrefixRegex = /^(new goal|set a goal|create a goal|goal|i want to track|track my|track|build a tracker for|set tracker for|tracker for):?\s*/i
  if (explicitPrefixRegex.test(trimmed)) {
    const cleanTitle = trimmed.replace(explicitPrefixRegex, '').trim() || trimmed
    if (cleanTitle.length >= 3 && !/\b(hungry|tired|sleep|bored|test|eat food|chill)\b/i.test(cleanTitle)) {
      return { isGoal: true, cleanTitle, suggestedType: inferGoalType(cleanTitle) }
    }
    return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
  }

  // 7. Action verb + quantity pattern (e.g., "sell 4 books today", "run 5 miles", "read 20 pages", "do 50 pushups")
  const verbList = GOAL_ACTION_VERBS.join('|')
  const actionWithQuantityRegex = new RegExp(`^(${verbList})\\s+(\\d+)\\s*(.*)$`, 'i')
  if (actionWithQuantityRegex.test(trimmed)) {
    return { isGoal: true, cleanTitle: trimmed, suggestedType: inferGoalType(trimmed) }
  }

  // 8. Actionable Checklist format (e.g., "tasks: buy groceries, clean room", "checklist: step 1, step 2")
  if (/^(tasks?|checklist|todo|milestones?):/i.test(trimmed) || (trimmed.startsWith('- ') && trimmed.includes('\n- ')) || (trimmed.startsWith('* ') && trimmed.includes('\n* '))) {
    const cleanTitle = trimmed.replace(/^(tasks?|checklist|todo|milestones?):?\s*/i, '').trim() || trimmed
    return { isGoal: true, cleanTitle, suggestedType: 'checklist' }
  }

  // 9. Habit / Temporal commitments with explicit habit words (e.g. "meditate 10 mins daily", "journal every night", "drink 2L water daily")
  if (/(daily|every day|every night|each week|weekly|every morning|nightly)/i.test(lower)) {
    if (new RegExp(`(${verbList}|habit|journal|reflect|water|workout|meditat|pushup)`, 'i').test(lower)) {
      return { isGoal: true, cleanTitle: trimmed, suggestedType: inferGoalType(trimmed) }
    }
  }

  // 10. Explicit project milestone goals with deadline (e.g. "launch portfolio by Friday", "deploy v1 by next week")
  if (/^(launch|deploy|publish|ship)\s+(my|a|an|the)?\s*([a-zA-Z0-9_\-\s]+)\s+(by|before)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|end of month)$/i.test(trimmed)) {
    return { isGoal: true, cleanTitle: trimmed, suggestedType: 'checklist' }
  }

  return { isGoal: false, cleanTitle: trimmed, suggestedType: 'counter' }
}

function stemWord(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (w === 'ran' || w === 'running') return 'run'
  if (w === 'calls' || w === 'calling' || w === 'called') return 'call'
  if (w === 'pushups' || w === 'pushup') return 'pushup'
  if (w === 'books' || w === 'booking') return 'book'
  if (w === 'sold' || w === 'selling' || w === 'sales') return 'sell'
  if (w === 'pages') return 'page'
  if (w === 'wrote' || w === 'writing') return 'write'
  if (w === 'miles') return 'mile'
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y'
  if (w.endsWith('es')) return w.slice(0, -2)
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  if (w.endsWith('ing')) return w.slice(0, -3)
  if (w.endsWith('ed')) return w.slice(0, -2)
  return w
}

/**
 * Parse relative expressions like 'before Saturday', 'by Friday', 'tomorrow', 'next week'
 * into an accurate ISO date string (YYYY-MM-DD) based on current reference date.
 */
export function parseRelativeDeadline(text: string, referenceDate: Date = new Date()): string | null {
  if (!text) return null
  const lower = text.toLowerCase()

  // Weekday mapping (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const weekdays: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }

  // 1. Weekday detection (e.g., "before saturday", "by saturday", "this saturday", "saturday")
  for (const [dayName, targetDay] of Object.entries(weekdays)) {
    const regex = new RegExp(`\\b(before|by|on|this|coming)?\\s*${dayName}\\b`, 'i')
    if (regex.test(lower)) {
      const currentDay = referenceDate.getDay()
      let daysAhead = (targetDay - currentDay + 7) % 7
      if (daysAhead === 0) {
        // If it's Saturday today and they say "before Saturday" or "by Saturday", target next Saturday
        daysAhead = 7
      }
      const target = new Date(referenceDate)
      target.setDate(referenceDate.getDate() + daysAhead)
      return target.toISOString().split('T')[0]
    }
  }

  // 2. Tomorrow
  if (/\btomorrow\b/i.test(lower)) {
    const target = new Date(referenceDate)
    target.setDate(referenceDate.getDate() + 1)
    return target.toISOString().split('T')[0]
  }

  // 3. Day after tomorrow
  if (/\bday after tomorrow\b/i.test(lower)) {
    const target = new Date(referenceDate)
    target.setDate(referenceDate.getDate() + 2)
    return target.toISOString().split('T')[0]
  }

  // 4. This weekend / End of week
  if (/\b(this weekend|end of (this )?week)\b/i.test(lower)) {
    const currentDay = referenceDate.getDay()
    let daysAhead = (0 - currentDay + 7) % 7 // Next Sunday
    if (daysAhead === 0) daysAhead = 7
    const target = new Date(referenceDate)
    target.setDate(referenceDate.getDate() + daysAhead)
    return target.toISOString().split('T')[0]
  }

  // 5. Next week
  if (/\bnext week\b/i.test(lower)) {
    const target = new Date(referenceDate)
    target.setDate(referenceDate.getDate() + 7)
    return target.toISOString().split('T')[0]
  }

  // 6. In X days / weeks / months
  const inDaysMatch = lower.match(/\bin (\d+)\s+days?\b/)
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10)
    const target = new Date(referenceDate)
    target.setDate(referenceDate.getDate() + days)
    return target.toISOString().split('T')[0]
  }

  const inWeeksMatch = lower.match(/\bin (\d+)\s+weeks?\b/)
  if (inWeeksMatch) {
    const weeks = parseInt(inWeeksMatch[1], 10)
    const target = new Date(referenceDate)
    target.setDate(referenceDate.getDate() + weeks * 7)
    return target.toISOString().split('T')[0]
  }

  // 7. End of month
  if (/\bend of (the )?month\b/i.test(lower)) {
    const target = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)
    return target.toISOString().split('T')[0]
  }

  return null
}

export function extractTargetAndUnit(text: string): { target: number; unit: string } {
  // Support expressions like "sell 2 of Israel's laptop", "run 5 km", "read 20 pages", "buy 3 phones"
  const numberMatch = text.match(/(?:^|\s)(\d+)(?:\s+(?:of\s+)?(?:the\s+|my\s+|our\s+|a\s+|an\s+|[a-zA-Z0-9'’]+'s\s+)*([a-zA-Z]+))?/i)
  if (numberMatch && numberMatch[1]) {
    const target = parseInt(numberMatch[1], 10)
    const rawUnit = (numberMatch[2] || '').trim().toLowerCase()
    const ignoredWords = [
      'days', 'weeks', 'months', 'hours', 'minutes', 'today', 'daily', 'times',
      'before', 'by', 'until', 'of', 'the', 'a', 'an', 'my', 'our', 'israel', 'israels'
    ]
    let unit = rawUnit && !ignoredWords.includes(rawUnit) ? rawUnit : ''

    // If unit was not cleanly extracted in the first pass, scan remaining words for the actual object noun
    if (!unit) {
      const idx = text.indexOf(numberMatch[1])
      if (idx !== -1) {
        const afterNum = text.slice(idx + numberMatch[1].length).trim()
        const words = afterNum.split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
        for (const w of words) {
          if (w && !ignoredWords.includes(w) && w.length > 2) {
            unit = w
            break
          }
        }
      }
    }

    return { target: Math.max(1, target), unit: unit || 'units' }
  }
  return { target: 10, unit: 'units' }
}

/**
 * Infer domain from text
 */
export function inferGoalDomain(text: string): Goal['domain'] {
  const lower = text.toLowerCase()
  if (/\b(sale|sales|sell|deal|deals|revenue|client|clients|close|customer|customers|mrr|arr|ticket|tickets)\b/.test(lower)) return 'sales'
  if (/\b(code|build|app|deploy|ship|feature|bug|refactor|test|api|backend|frontend|git|github|site|portfolio)\b/.test(lower)) return 'engineering'
  if (/\b(run|workout|gym|exercise|lift|pushup|pushups|water|sleep|diet|calorie|weight|walk|km|miles)\b/.test(lower)) return 'fitness'
  if (/\b(read|book|books|study|course|learn|pages|exam|cert|practice|write|article)\b/.test(lower)) return 'learning'
  if (/\b(meditate|journal|reflect|mindset|focus|habit|habits|gratitude|peace|calm)\b/.test(lower)) return 'mindset'
  return 'general'
}

/**
 * Infer whether tracker should be counter, checklist, or manual reflection
 */
export function inferGoalType(text: string): Goal['goal_type'] {
  const lower = text.toLowerCase()
  if (
    lower.includes('task') ||
    lower.includes('checklist') ||
    lower.includes('step') ||
    lower.includes('ship') ||
    lower.includes('deploy') ||
    lower.includes('launch') ||
    lower.includes('portfolio') ||
    lower.includes('site') ||
    lower.includes('website') ||
    lower.includes('app') ||
    lower.includes('feature') ||
    lower.includes(',')
  ) {
    return 'checklist'
  }
  if (
    lower.includes('reflect') ||
    lower.includes('journal') ||
    lower.includes('meditat') ||
    lower.includes('mood') ||
    lower.includes('habit') ||
    lower.includes('gratitude')
  ) {
    return 'manual'
  }
  return 'counter'
}

/**
 * Create a full optimistic goal proposal from any prompt
 */
export function extractGoalProposal(text: string, referenceDate: Date = new Date()): Partial<Goal> {
  const trimmed = text.trim()
  const cleanTitle = trimmed
    .replace(/^(i need to|i want to|i plan to|i aim to|i will|create a goal to|set a goal to|track my|track)\s*/i, '')
    .trim()
  const capitalizedTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : trimmed

  const { target, unit } = extractTargetAndUnit(trimmed)
  const inferredType = inferGoalType(trimmed)
  const deadline = parseRelativeDeadline(trimmed, referenceDate) || new Date(referenceDate.getTime() + 7 * 86400000).toISOString().split('T')[0]
  const domain = inferGoalDomain(trimmed)

  return {
    title: capitalizedTitle,
    goal_type: inferredType,
    target: inferredType === 'counter' ? target : inferredType === 'checklist' ? 5 : 7,
    unit: inferredType === 'counter' ? unit : inferredType === 'checklist' ? 'milestones' : 'days',
    domain,
    deadline,
  }
}

/**
 * Classify any incoming user message in the context of active goals.
 */
export function classifyUserMessage(text: string, activeGoals: Goal[]): ClassifiedIntent {
  const trimmed = text.trim()
  const lower = trimmed.toLowerCase()

  // 1. Integrations Query Check (GitHub repos, commits, Google calendar)
  const integrationCheck = isIntegrationQuery(trimmed)
  if (integrationCheck.isQuery) {
    return {
      type: 'integration_query',
      service: integrationCheck.service,
      rawText: trimmed,
    }
  }

  // 2. Status / Summary Queries
  if (STATUS_REGEX.test(lower)) {
    return { type: 'status_query' }
  }

  // 3. Help queries
  if (HELP_REGEX.test(trimmed)) {
    return {
      type: 'help_query',
      responseText:
        "I'm your OnTrack AI Assistant. Here is what I can do:\n\n" +
        "• **General Chat & Questions**: Ask any questions about your code, workflow, strategy, or learning.\n" +
        "• **Integrations**: Inquire about your GitHub activity (*\"What are my repos?\"*, *\"Check my commits\"*) or Google Calendar.\n" +
        "• **Set Trackers**: Say *\"Track 50 pushups daily\"*, *\"Read 20 pages\"*, or *\"Launch portfolio by Friday\"*.\n" +
        "• **Log Progress**: Say *\"Did 20 pushups\"* or *\"Sold 2 books\"* to update your active counters.\n" +
        "• **Check Velocity**: Ask *\"How am I doing?\"* anytime for your shipping rate and streak.",
    }
  }

  // 4. Conversational Acknowledgments (ok, thanks, got it)
  if (ACK_REGEX.test(trimmed)) {
    const ackReplies = [
      "You got this! Keep the momentum high. Tell me whenever you have progress to log or want to set another tracker.",
      "Locked in. Let's make today count. Let me know when you have questions or want to log an update!",
      "Great energy. Keep moving forward, and remember you can set a tracker for any milestone whenever you need.",
    ]
    const chosen = ackReplies[Math.floor(Math.random() * ackReplies.length)]
    return { type: 'acknowledgment', responseText: chosen }
  }

  // 5. Greetings (hi, hello, hey, good morning)
  if (GREETING_REGEX.test(trimmed) && trimmed.length < 35 && !lower.includes('i want to') && !lower.includes('goal')) {
    if (activeGoals.length > 0) {
      const primaryGoal = activeGoals[0]
      const goalCountStr = activeGoals.length === 1 ? '1 active goal' : `${activeGoals.length} active goals`
      return {
        type: 'greeting',
        responseText: `Hey there! Ready to make moves today? You have **${goalCountStr}** in motion—including **"${primaryGoal.title}"**.\n\nAsk me anything, check your integrations, or let me know if you have progress to log!`,
      }
    } else {
      return {
        type: 'greeting',
        responseText: "Hey there! I'm your OnTrack AI Assistant. Ask me any question, check your integrations, or say what you'd like to achieve (e.g. *\"Sell 4 books today\"* or *\"Read 20 pages every night\"*) to set a tracker.",
      }
    }
  }

  // 6. Casual conversations (im hungry, test ontrack, how are you, etc.)
  for (const casual of CASUAL_PHRASES) {
    if (casual.pattern.test(trimmed)) {
      return { type: 'general_chat', responseText: casual.reply, rawText: trimmed }
    }
  }

  // 7. Coaching Advice (motivation, procrastination, habits)
  for (const [trigger, topic] of Object.entries(COACHING_TRIGGERS)) {
    if (lower.includes(trigger)) {
      let advice: string
      if (topic === 'motivation') {
        advice =
          "Action precedes motivation! The secret to breaking inertia is the **2-minute rule**: pick the absolute smallest sub-task on your goal and do it for just two minutes. What is one tiny thing you can knock out right now?"
      } else if (topic === 'habits') {
        advice =
          "Consistency beats intensity every time. Anchor your new target to an existing daily routine (habit stacking). When you finish one routine, trigger your goal immediately."
      } else {
        advice =
          "High performers protect their recovery. If you're feeling overwhelmed, pare your list down to the single most critical task for today and pause the rest. What's the #1 priority right now?"
      }
      return { type: 'coaching_advice', topic, responseText: advice }
    }
  }

  // 8. Explicit Goal Creation Check (strict check, questions never pass)
  const goalCheck = isGoalCreationPrompt(trimmed)
  if (goalCheck.isGoal) {
    return {
      type: 'goal_creation',
      cleanTitle: goalCheck.cleanTitle,
      suggestedType: goalCheck.suggestedType,
    }
  }

  // 9. Progress Logging on Existing Goals
  // Must have a number, plus either a logging verb, a '+' prefix, or directly reference an active goal's title or unit
  const numberMatch = trimmed.match(/(?:\+|\b)(\d+)/)
  const startsWithPlus = trimmed.startsWith('+')
  const hasLogVerb = LOG_VERBS.some((v) => lower.includes(v))

  if (numberMatch && activeGoals.length > 0) {
    const delta = parseInt(numberMatch[1], 10)
    // Separate numbers from adjacent units like '5km' -> '5 km' for accurate tokenization
    const normalizedText = lower.replace(/(\d+)([a-zA-Z]+)/g, '$1 $2')
    const msgWords = normalizedText.split(/\s+/).map(stemWord)

    // Check if message references any active goal's title or unit using word stems
    const matched = activeGoals.filter((g) => {
      const titleLower = g.title.toLowerCase()
      const unitLower = (g.unit || '').toLowerCase()
      const titleStems = titleLower.split(/\s+/).filter((w) => w.length > 2).map(stemWord)
      const unitStem = stemWord(unitLower)

      const hasTitleKeyword = titleStems.some((ts) => msgWords.includes(ts))
      const hasUnitKeyword = unitStem && msgWords.includes(unitStem)
      return hasTitleKeyword || hasUnitKeyword
    })

    if (startsWithPlus || hasLogVerb || matched.length > 0) {
      return {
        type: 'progress_log',
        delta,
        rawText: trimmed,
        matchedGoal: matched.length === 1 ? matched[0] : undefined,
      }
    }
  }

  // 10. General conversational chat (NOT a goal creation prompt)
  return {
    type: 'general_chat',
    rawText: trimmed,
    responseText:
      "I'm here to help. You can ask me any question, query your connected integrations (GitHub, Calendar), or create a tracker whenever you want to set a target (Counter, Checklist, or Reflection)!",
  }
}
