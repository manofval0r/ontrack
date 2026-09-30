/** M6 Chat — the conversational main screen.
 * Client intent router (greeting / clarify / status / progress / goal) keeps
 * every input answered sensibly; the model (server parse) handles goal
 * structuring. Offline/fallback paths are badged, never disguised. */
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Brand } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { api } from '../../lib/api';
import { useDictation } from '../../lib/useDictation';
import { useReduceMotion } from '../../lib/useReduceMotion';
import { useGoals } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { rescheduleReminders, requestReminderPermission } from '../../lib/reminders';
import { useTheme } from '../../lib/theme';
import { displayProgress } from '../../lib/templates';
import { speakText } from '../../lib/speech';
import { ChatBubble, type ChatMsg } from '../../components/ChatBubble';
import { ChatComposer } from '../../components/ChatComposer';

const now = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const STARTERS = [
  { title: 'Close deals', prompt: 'I want to close 5 deals this month' },
  { title: 'Get fit', prompt: 'I want to do 50 pushups every morning' },
  { title: 'Read more', prompt: 'I want to read 3 books this month' },
  { title: 'Reflect daily', prompt: 'I want to journal every evening for 2 weeks' },
];

const GREETING = /^(hi|hey|hello|yo|sup|howdy|good\s?(morning|afternoon|evening)|how\s?.?s\s?it\s?going)\b/;
const STATUS_Q = /(how am i doing|how('| i)s my (week|progress)|status|shipping rate|progress report|summary)/;
const VAGUE = /^(get better|be (better|productive|consistent)|i need motivation|help me|i'?m stuck|i don'?t know)/;
const LOG_VERBS = /(did|logged|finished|sold|read|ran|completed|hit|shipped|closed|worked out|meditated|wrote)\b|\+/;
const CLARIFY_CHIPS = ['Fitness', 'Study', 'Work', 'Just chatting'];

/** How close is this text to a trackable goal prompt? 0..1.
 * Drives the "Set as a goal" escape hatch: mid-band scores get the offer
 * instead of a dead-end clarify or a pure conversational reply. */
export function trackerScore(text: string): number {
  const lower = text.toLowerCase();
  let s = 0;
  if (/\d/.test(text)) s += 0.35;
  if (/(week|month|day|morning|evening|daily|friday|monday|deadline|by |before |until )/i.test(lower)) s += 0.25;
  if (/(sell|run|read|ship|close|journal|workout|pushup|meditat|write|save|learn|exercise|call|visit)/i.test(lower)) s += 0.2;
  if (text.trim().split(/\s+/).length > 6) s += 0.1;
  if (/(want|goal|target|track|achieve|plan)/i.test(lower)) s += 0.1;
  return Math.min(1, Math.round(s * 100) / 100);
}
const SET_AS_GOAL_MIN = 0.35;

/** Staged thinking indicator — procedural status phases (threejs-animation
 * timing principles: one Clock, eased loop) with a UI-thread dot pulse.
 * Purpose: state indication. 900ms ease-in-out, instant under reduced motion. */
const THINK_STAGES = ['Reading that…', 'Shaping the answer…', 'Polishing…'];

function ThinkingIndicator() {
  const t = useTheme();
  const reduce = useReduceMotion();
  const [stage, setStage] = useState(0);
  const pulse = useSharedValue(0.35);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % THINK_STAGES.length), 1600);
    pulse.value = reduce
      ? 1
      : withRepeat(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
    return () => {
      clearInterval(id);
      cancelAnimation(pulse);
    };
  }, [pulse, reduce]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.lg }}>
      <Animated.View style={[{ flexDirection: 'row', gap: 3 }, dotStyle]} accessibilityElementsHidden>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: Brand.turquoise }} />
        ))}
      </Animated.View>
      <Text style={{ color: t.teal, fontWeight: '600' }}>{THINK_STAGES[stage]}</Text>
    </View>
  );
}

export default function Chat() {
  const { goals, dashboard, createGoal, logProgress, updateGoal } = useGoals();
  const toast = useToast();
  const t = useTheme();
  const { theme, setTheme } = t;
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'welcome', sender: 'ai', content: 'Tell me what you want to make progress on.', timestamp: now() },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [activating, setActivating] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  // When the keyboard is up the dock is covered, so the composer needs only
  // ~10px clearance; when hidden it needs full dock clearance (~108px).
  const [keyboardUp, setKeyboardUp] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const briefedRef = useRef(false);
  const listRef = useRef<FlatList>(null);

  const dictation = useDictation((transcript) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, 500));
    setDictError(null);
  });

  // Persist + restore TTS autoplay preference (backend settings audio bag).
  useEffect(() => {
    api.getSettings().then((s) => {
      setAutoplay(!!s?.audio?.tts_autoplay);
      const nm = s?.profile?.name ?? '';
      setUserName(typeof nm === 'string' ? nm.split(' ')[0] : '');
    }).catch(() => {});
  }, []);

  // Autoplay is read from settings and controlled from chat commands
  // ("turn auto-play on") — no local toggle needed.

  // Daily brief: greet returning users with today's focus (once per mount).
  useEffect(() => {
    if (briefedRef.current) return;
    briefedRef.current = true;
    const active = goals.filter((g) => g.status === 'active');
    if (active.length === 0) return;
    const first = active[0];
    const prog = displayProgress(first);
    const streak = dashboard?.streak_days ?? 0;
    push({
      id: `brief-${Date.now()}`,
      sender: 'ai',
      content: `Morning brief: "${first.title}" sits at ${prog.current} of ${prog.target ?? '—'}${
        streak > 0 ? `, and you're on a ${streak}-day streak.` : '.'
      } What's today's move?`,
      timestamp: now(),
      chips: ['Log progress', 'New goal', 'How am I doing'],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const push = (m: ChatMsg) => {
    setMessages((prev) => [...prev, m]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const speakAi = (text: string) => {
    if (autoplay) speakText(text).catch(() => {});
  };

  const ai = (content: string, extra?: Partial<ChatMsg>) => {
    const m: ChatMsg = { id: `ai-${Date.now()}`, sender: 'ai', content, timestamp: now(), source: 'ai', ...extra };
    push(m);
    speakAi(content);
  };

  const busy = thinking || activating || dictation.recording || dictation.transcribing;

  const matchGoal = (text: string) => {
    const lower = text.toLowerCase();
    const active = goals.filter((g) => g.status === 'active');
    const hit = active.find((g) => {
      const t = `${g.title} ${(g as any).unit ?? ''}`.toLowerCase();
      return lower.split(/\s+/).some((w) => w.length > 3 && t.includes(w));
    });
    return hit ?? (active.length === 1 ? active[0] : null);
  };

  const logFlow = async (text: string) => {
    const num = text.match(/\b(\d+)\b/);
    if (!num) return false;
    const delta = parseInt(num[1], 10);
    const target = matchGoal(text);
    if (!target) {
      const counters = goals.filter((g) => g.status === 'active' && g.goal_type === 'counter');
      if (counters.length > 1) {
        ai(`You logged ${delta} — which tracker should I update?`, {
          chips: counters.slice(0, 3).map((g) => `Log to: ${g.title}`),
        });
        return true;
      }
      if (counters.length === 0) return false;
      return logTo(counters[0], delta, text);
    }
    return logTo(target, delta, text);
  };

  const logTo = async (goal: any, delta: number, text: string) => {
    try {
      const prog = displayProgress(goal);
      const next = prog.current + delta;
      const updated = await logProgress(String(goal.id), next, text);
      const uprog = displayProgress({ ...goal, ...updated, progress_pct: goal.progress_pct });
      const doneNow = (uprog.target ?? 0) > 0 && uprog.current >= (uprog.target ?? 0);
      if (doneNow) {
        await updateGoal(String(goal.id), { status: 'completed' }).catch(() => {});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        ai(`Shipped it! "${goal.title}" is complete at ${uprog.current}. Take the win — want to set the next target?`, {
          chips: ['New goal', 'See verdict'],
          proposal: { title: goal.title },
        });
      } else {
        ai(`Logged +${delta} on "${goal.title}" — now ${uprog.current} of ${uprog.target ?? '—'}.`, {
          proposal: { title: goal.title },
        });
      }
      return true;
    } catch {
      ai(`Couldn't save that — connection hiccup. Your words are kept above; tap send to retry.`);
      return true;
    }
  };

  /** Settings + navigation commands — the whole app obeys chat.
   * "Turn off reminders" flips the real setting + reschedules alarms, no
   * Settings screen visit required. Returns true when handled. */
  const commandFlow = async (raw: string): Promise<boolean> => {
    const lower = raw.toLowerCase().trim();
    const say = (content: string, chips?: string[]) => ai(content, chips ? { chips } : undefined);

    const applyNotifications = async (patch: any, confirm: string, revertHint: string) => {
      setThinking(true);
      try {
        const s = await api.getSettings().catch(() => null);
        const cadence = s?.notifications?.checkin_cadence ?? '30min';
        const quiet = s?.notifications?.quiet_hours?.enabled ?? false;
        const master = patch?.notifications?.master_enabled ?? s?.notifications?.master_enabled ?? true;
        if (patch?.notifications?.master_enabled === true) {
          const granted = await requestReminderPermission().catch(() => false);
          if (!granted) {
            say(`I can't enable reminders — the system permission is off. Enable notifications for OnTrack in system settings, then say "turn on reminders".`);
            return true;
          }
        }
        await api.updateSettings(patch);
        await rescheduleReminders({ master, cadence, quiet, goals }).catch(() => {});
        say(`${confirm} Say "${revertHint}" any time to flip it back.`, ['Open settings']);
      } catch {
        say(`That didn't stick — connection hiccup. Try again in a moment.`);
      } finally {
        setThinking(false);
      }
      return true;
    };

    if (/(turn off|disable|mute|stop).*(reminder|notification)/.test(lower) && !/quiet/.test(lower)) {
      return applyNotifications({ notifications: { master_enabled: false } }, `Reminders are off. No nudges, no alarms.`, 'turn on reminders');
    }
    if (/(turn on|enable|unmute|start).*(reminder|notification)/.test(lower)) {
      return applyNotifications({ notifications: { master_enabled: true } }, `Reminders are on. Check-ins and deadline alarms are scheduled.`, 'turn off reminders');
    }
    if (/(quiet hours|mute at night|do not disturb|dnd).*(on|enable|start)/.test(lower) || /^(enable|turn on) quiet/.test(lower)) {
      return applyNotifications({ notifications: { quiet_hours: { enabled: true, start: '22:00', end: '07:00' } } }, `Quiet hours on — nothing pings you between 10pm and 7am.`, 'turn off quiet hours');
    }
    if (/(quiet hours|mute at night|do not disturb|dnd).*(off|disable|stop)/.test(lower) || /^(disable|turn off) quiet/.test(lower)) {
      return applyNotifications({ notifications: { quiet_hours: { enabled: false, start: '22:00', end: '07:00' } } }, `Quiet hours off — reminders come through any time.`, 'turn on quiet hours');
    }
    if (/check.?ins? off|stop check.?ins|disable check.?ins/.test(lower)) {
      return applyNotifications({ notifications: { checkin_cadence: 'off' } }, `Check-in nudges off. Deadlines still alarm.`, 'check in every 30 minutes');
    }
    if (/every 30 min|30 min|half.?hour|half hourly/.test(lower) && /check/.test(lower)) {
      return applyNotifications({ notifications: { checkin_cadence: '30min' } }, `Check-ins every 30 minutes, daytime only.`, 'turn off check-ins');
    }
    if (/(every|each) (1 hour|hour)|hourly/.test(lower) && /check/.test(lower)) {
      return applyNotifications({ notifications: { checkin_cadence: '1hour' } }, `Check-ins every hour, daytime only.`, 'turn off check-ins');
    }
    if (/(turn off|disable|mute).*(voice|tts|speech|sound)/.test(lower)) {
      setThinking(true);
      try {
        await api.updateSettings({ audio: { tts_enabled: false, tts_autoplay: false } });
        setAutoplay(false);
        say(`Voice off — no speech, no auto-play. Text only from here.`, ['Turn voice back on']);
      } catch {
        say(`That didn't stick — connection hiccup. Try again in a moment.`);
      } finally {
        setThinking(false);
      }
      return true;
    }
    if (/(turn on|enable|unmute).*(voice|tts|speech|sound)/.test(lower) || lower === 'turn voice back on') {
      setThinking(true);
      try {
        await api.updateSettings({ audio: { tts_enabled: true } });
        say(`Voice on — tap the speaker on any reply to hear it.`, ['Turn voice off']);
      } catch {
        say(`That didn't stick — connection hiccup. Try again in a moment.`);
      } finally {
        setThinking(false);
      }
      return true;
    }
    if (/dictation|voice input|mic|microphone/.test(lower) && /(off|disable|stop)/.test(lower)) {
      setThinking(true);
      try {
        await api.updateSettings({ audio: { asr_enabled: false } });
        say(`Voice input off — the mic button stands down. Type everything for now.`, ['Turn voice input on']);
      } catch {
        say(`That didn't stick — connection hiccup. Try again in a moment.`);
      } finally {
        setThinking(false);
      }
      return true;
    }
    if (/dictation|voice input/.test(lower) && /(on|enable)/.test(lower)) {
      setThinking(true);
      try {
        await api.updateSettings({ audio: { asr_enabled: true } });
        say(`Voice input on — dictate goals and check-ins with the mic.`, ['Turn voice input off']);
      } catch {
        say(`That didn't stick — connection hiccup. Try again in a moment.`);
      } finally {
        setThinking(false);
      }
      return true;
    }
    if (/auto.?play|read .* aloud|read .* out loud/.test(lower)) {
      const on = !/(off|disable|stop|mute)/.test(lower);
      setThinking(true);
      try {
        await api.updateSettings({ audio: { tts_autoplay: on } });
        setAutoplay(on);
        say(on ? `Auto-play on — every reply reads itself aloud.` : `Auto-play off — replies stay silent until you tap the speaker.`, [on ? 'Turn auto-play off' : 'Turn auto-play on']);
      } catch {
        say(`That didn't stick — connection hiccup. Try again in a moment.`);
      } finally {
        setThinking(false);
      }
      return true;
    }
    if (/dark (mode|theme)/.test(lower)) {
      setTheme('dark');
      say(`Dark mode on — easy on the eyes. Say "light mode" or "teal theme" to switch.`, ['Light mode', 'Teal theme']);
      return true;
    }
    if (/light (mode|theme)/.test(lower)) {
      setTheme('light');
      say(`Light mode on — classic OnTrack.`, ['Dark mode', 'Teal theme']);
      return true;
    }
    if (/teal (theme|mode|harmony)/.test(lower)) {
      setTheme('teal');
      say(`Teal harmony on — the whole app, dipped in teal.`, ['Dark mode', 'Light mode']);
      return true;
    }
    if (/open settings|go to settings|show settings|app settings/.test(lower)) {
      say(`Opening Settings — everything's tappable in there too.`);
      setTimeout(() => router.push('/(tabs)/settings'), 600);
      return true;
    }
    if (/open (my )?goals|go to goals|show goals/.test(lower)) {
      say(`Opening Goals.`);
      setTimeout(() => router.push('/(tabs)/goals'), 600);
      return true;
    }
    if (/open (my )?profile|show profile|my stats/.test(lower)) {
      say(`Opening your profile.`);
      setTimeout(() => router.push('/(tabs)/you'), 600);
      return true;
    }
    if (/go home|open home|back home/.test(lower)) {
      say(`Opening Home.`);
      setTimeout(() => router.push('/(tabs)'), 600);
      return true;
    }
    return false;
  };

  const statusFlow = () => {    const active = goals.filter((g) => g.status === 'active');
    const done = goals.filter((g) => g.status === 'completed').length;
    const streak = dashboard?.streak_days ?? 0;
    const lines = active.slice(0, 3).map((g) => {
      const p = displayProgress(g);
      return `• ${g.title}: ${p.current}/${p.target ?? '—'} (${p.pct}%)`;
    });
    ai(
      `Here's your board: ${active.length} active, ${done} shipped${
        streak > 0 ? `, ${streak}-day streak alive` : ''
      }.\n${lines.join('\n') || 'No active trackers yet — say the word and I will build one.'}`,
      { chips: active.length ? ['Log progress', 'New goal'] : ['New goal'] }
    );
  };

  const goalFlow = async (raw: string, opts?: { force?: boolean }) => {
    setThinking(true);
    try {
      const parsed: any = await api.parseGoal(raw);
      const { ai_response_text, goal_proposal } = parsed;
      const references: string[] | undefined =
        (Array.isArray(goal_proposal?.references) && goal_proposal.references) ||
        (Array.isArray(parsed?.references) && parsed.references) ||
        undefined;
      const score = trackerScore(raw);
      // Answer first, track second. A proposal only becomes a tracker card
      // when the server explicitly flags it a goal OR the client agrees it's
      // goal-shaped (score gate). Anything else is a conversational answer —
      // never a tracker ambush. Tracker-ish answers carry a Y/N follow-up.
      const serverSaysGoal = parsed.is_goal === true;
      const serverSaysChat = parsed.is_goal === false;
      // Forced (user tapped Yes) with no server proposal: build the manual
      // tracker from their own words rather than dead-ending.
      const effectiveProposal = goal_proposal ?? (opts?.force
        ? {
            title: raw.length > 80 ? `${raw.slice(0, 77)}…` : raw,
            goal_type: 'manual',
            goal_template: 'reflection_manual',
            target: 1,
            domain: 'general',
          }
        : null);
      if (!effectiveProposal || (!opts?.force && (serverSaysChat || (!serverSaysGoal && score < 0.3)))) {
        ai(
          ai_response_text,
          score >= SET_AS_GOAL_MIN && score < 0.9
            ? { references, trackable: { prompt: raw, score } }
            : references?.length ? { references } : undefined
        );
        return;
      }
      const proposal = effectiveProposal;
      const canned = ai_response_text.includes('I set this up as a manual goal');
      ai(ai_response_text, {
        source: canned ? 'fallback' : 'ai',
        chips: canned ? ['Try again'] : undefined,
        proposal: {
          title: proposal.title || raw,
          goal_type: proposal.goal_type || 'manual',
          goal_template: proposal.goal_template,
          target: proposal.target ?? 1,
          items: proposal.items,
          domain: proposal.domain || 'general',
          deadline: proposal.deadline,
        },
      });
    } catch (e: any) {
      // Honest errors: a dead/timed-out network is not the same as the
      // server or AI being down. Never cry "offline" for a server hiccup.
      const offline = e?.code === 'NETWORK_ERROR';
      ai(
        offline
          ? `Couldn't reach OnTrack HQ — check your connection, or the server may be waking up. Your words are saved above; send again in a few seconds.`
          : `OnTrack's brain hiccuped and couldn't answer that. Your words are saved above — send again to retry.`,
        { source: offline ? 'offline' : 'fallback', chips: ['Try again'] }
      );
    } finally {
      setThinking(false);
    }
  };

  const send = async (text?: string) => {
    const raw = (text ?? input).trim();
    if (!raw || busy) return;
    // Handle "Log to: <title>" disambiguation chips
    if (raw.startsWith('Log to: ')) {
      const title = raw.replace('Log to: ', '');
      const g = goals.find((x) => x.title === title);
      setInput('');
      if (g) {
        ai(`Which amount should I log to "${title}"? Reply like "did 15".`);
      } else {
        ai(`I couldn't find "${title}" anymore. Pick an active tracker from the Goals tab.`);
      }
      return;
    }
    if (raw === 'See verdict') {
      ai(`Open the goal and tap "Finalize & get verdict" — OnTrack will score it and read it aloud.`);
      setInput('');
      return;
    }
    if (raw === 'Try again') {
      setInput('');
      const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
      if (lastUser) send(lastUser.content);
      return;
    }
    // "Set as a goal" escape hatch: re-run the user's own last message
    // straight through goal structuring, skipping the clarify gate.
    if (raw === 'Set as a goal') {
      setInput('');
      const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
      if (lastUser) {
        push({ id: `u-${Date.now()}`, sender: 'user', content: lastUser.content, timestamp: now() });
        await goalFlow(lastUser.content);
      } else {
        ai(`Tell me the goal first — then I'll track it.`);
      }
      return;
    }
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    push({ id: `u-${Date.now()}`, sender: 'user', content: raw, timestamp: now() });
    const lower = raw.toLowerCase();

    // 1. Greeting / small talk — personality, never a tracker.
    if (GREETING.test(lower) && raw.split(/\s+/).length <= 6) {
      ai(`Hey, good to see you. ${goals.filter((g) => g.status === 'active').length > 0 ? 'Your trackers are warm — log something or set something new.' : 'No trackers yet — tell me one thing you want to achieve.'}`, {
        chips: goals.length ? ['Log progress', 'How am I doing'] : ['Show starters', 'New goal'],
      });
      return;
    }
    if (lower === 'show starters') {
      ai(`Pick a lane and I'll draft the tracker — edit anything after.`, {
        chips: STARTERS.map((s) => s.title),
      });
      return;
    }
    const starter = STARTERS.find((s) => s.title.toLowerCase() === lower);
    if (starter) {
      send(starter.prompt);
      return;
    }
    // 2b. Settings / navigation / theme commands — whole app obeys chat.
    // Runs before the vague-input gate (commands are short by nature).
    if (await commandFlow(raw)) {
      setInput('');
      return;
    }
    // 2. Vague input → clarifying question, not a tracker.
    // Mid-band tracker scores get the escape hatch instead of a dead end.
    if (VAGUE.test(lower) || (raw.split(/\s+/).length <= 3 && !/\d/.test(raw))) {
      const score = trackerScore(raw);
      if (score >= SET_AS_GOAL_MIN) {
        ai(`Got it — let's sharpen that. Which arena is this in? (Looks ${Math.round(score * 100)}% like a trackable goal — I can also just track it.)`, { chips: ['Set as a goal', ...CLARIFY_CHIPS] });
      } else {
        ai(`Got it — let's sharpen that. Which arena is this in?`, { chips: CLARIFY_CHIPS });
      }
      return;
    }
    if (['fitness', 'study', 'work', 'just chatting'].includes(lower)) {
      if (lower === 'just chatting') {
        ai(`Love it. I'm here to keep you honest — when you're ready, give me a target with a number and a deadline.`);
      } else {
        ai(`Locked in: ${lower}. Now give me the actual target — e.g. ${
          lower === 'fitness' ? '"50 pushups every morning"' : lower === 'study' ? '"read 3 books this month"' : '"close 5 deals this month"'
        } — and I'll build the tracker.`);
      }
      return;
    }
    // 3. Status questions → real board summary.
    if (STATUS_Q.test(lower)) {
      statusFlow();
      return;
    }
    // 4. Progress logging → match + log.
    if (/\d/.test(raw) && LOG_VERBS.test(lower)) {
      setThinking(true);
      try {
        const handled = await logFlow(raw);
        if (!handled) await goalFlow(raw);
      } finally {
        setThinking(false);
      }
      return;
    }
    // 5. Default: goal structuring via the model.
    await goalFlow(raw);
  };

  /** Y/N tracker follow-up: Yes re-runs the prompt through structuring
   * with force (user already confirmed); No just dismisses the bar. */
  const onTrackAnswer = async (msgId: string, yes: boolean) => {
    const msg = messages.find((m) => m.id === msgId);
    const prompt = msg?.trackable?.prompt;
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, trackable: undefined } : m)));
    if (!yes || !prompt || busy) return;
    await goalFlow(prompt, { force: true });
  };

  const activate = async (proposal: any) => {
    if (activating || thinking) return;
    try {
      setActivating(true);
      const created = await createGoal(proposal.title ?? proposal.summary ?? 'Untitled goal');
      toast.show({ type: 'success', title: 'Tracker live', message: `"${created.title}" is on your Home tab now.` });
      ai(`Tracker live: "${created.title}". It's on your Home tab now.`);
      router.push(`/goal/${created.id}`);
    } catch (e: any) {
      ai(`Couldn't create it: ${e?.error ?? 'try again.'}`, { chips: ['Try again'] });
    } finally {
      setActivating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          accessibilityLabel="Conversation with OnTrack"
          contentContainerStyle={{ padding: Spacing.lg, gap: 10, paddingTop: Spacing.xl }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item, index }) => (
            <ChatBubble
              msg={item}
              index={index}
              compact={index > 0 && messages[index - 1].sender === item.sender}
              onActivate={activate}
              onChip={(chip) => send(chip)}
              onTrackAnswer={onTrackAnswer}
            />
          )}
        />
        {!messages.some((m) => m.sender === 'user') && (
          <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 8, gap: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: t.inkSoft, letterSpacing: 2 }}>
              {new Date().toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase().replace(/,/g, ' ·')}
            </Text>
            <Text style={{ fontFamily: FontFamily.expressive, fontSize: 44, color: t.ink, lineHeight: 50 }}>
              hey{userName ? `, ${userName}` : ''}.
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: t.inkSoft }}>
              What are we shipping today?
            </Text>
            <View style={{ marginTop: 10, borderTopWidth: 2, borderTopColor: t.border, opacity: 1 }}>
              {STARTERS.map((s, i) => (
                <Pressable
                  key={s.title}
                  onPress={() => send(s.prompt)}
                  accessibilityLabel={`Start: ${s.title}`}
                  accessibilityRole="button"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'rgba(7,30,45,0.12)', minHeight: 48 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal, minWidth: 28 }}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: t.ink }}>{s.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Brand.teal} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {thinking && <ThinkingIndicator />}
        {(dictError ?? dictation.error) && (
          <Text accessibilityLiveRegion="polite" style={{ paddingHorizontal: Spacing.lg, color: Brand.error, fontSize: Typography.caption.fontSize }}>
            {dictError ?? dictation.error}
          </Text>
        )}
        <View style={{ marginBottom: keyboardUp ? 10 : 108 }}>
          {dictation.recording && (
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View
                accessibilityLabel={`Recording, ${dictation.recSecs} seconds. Tap stop in the composer to finish.`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Brand.error, borderRadius: Radii.pill, paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.white }} />
                <Text style={{ color: Brand.white, fontSize: Typography.caption.fontSize, fontWeight: '700' }}>
                  {Math.floor(dictation.recSecs / 60)}:{String(dictation.recSecs % 60).padStart(2, '0')} · Listening…
                </Text>
              </View>
            </View>
          )}
          <ChatComposer
            value={input}
            onChange={(t) => {
              setInput(t);
              setDictError(null);
            }}
            onSend={() => send()}
            canSend={!!input.trim() && !busy}
            recording={dictation.recording}
            recSecs={dictation.recSecs}
            transcribing={dictation.transcribing}
            onToggleDictation={() => {
              setDictError(null);
              dictation.toggle();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
