/** M6 Chat — the conversational main screen.
 * Client intent router (greeting / clarify / status / progress / goal) keeps
 * every input answered sensibly; the model (server parse) handles goal
 * structuring. Offline/fallback paths are badged, never disguised. */
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Brand } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { api } from '../../lib/api';
import { useDictation } from '../../lib/useDictation';
import { useGoals } from '../../lib/store';
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

export default function Chat() {
  const { goals, dashboard, createGoal, logProgress, updateGoal } = useGoals();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'welcome', sender: 'ai', content: 'Tell me what you want to make progress on.', timestamp: now() },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [activating, setActivating] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const briefedRef = useRef(false);
  const listRef = useRef<FlatList>(null);

  const dictation = useDictation((transcript) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, 500));
    setDictError(null);
  });

  // Persist + restore TTS autoplay preference (backend settings audio bag).
  useEffect(() => {
    api.getSettings().then((s) => setAutoplay(!!s?.audio?.tts_autoplay)).catch(() => {});
  }, []);

  const toggleAutoplay = async () => {
    const next = !autoplay;
    setAutoplay(next);
    api.updateSettings({ audio: { tts_autoplay: next } }).catch(() => {});
  };

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

  const statusFlow = () => {
    const active = goals.filter((g) => g.status === 'active');
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

  const goalFlow = async (raw: string) => {
    setThinking(true);
    try {
      const { ai_response_text, goal_proposal } = await api.parseGoal(raw);
      if (!goal_proposal) {
        // Server-side conversational reply (greeting, small talk) — no tracker.
        ai(ai_response_text);
        return;
      }
      ai(ai_response_text, {
        proposal: {
          title: goal_proposal.title || raw,
          goal_type: goal_proposal.goal_type || 'manual',
          goal_template: goal_proposal.goal_template,
          target: goal_proposal.target ?? 1,
          items: goal_proposal.items,
          domain: goal_proposal.domain || 'general',
          deadline: goal_proposal.deadline,
        },
      });
    } catch {
      ai(`You're offline, so I can't reach the AI parser right now. Your words are saved above — reconnect and send again, and I'll structure the tracker.`, {
        source: 'offline',
        chips: ['Try again'],
      });
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
      ai(`Open the goal and tap "Finalize & get verdict" — the coach will score it and read it aloud.`);
      setInput('');
      return;
    }
    if (raw === 'Try again') {
      setInput('');
      const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
      if (lastUser) send(lastUser.content);
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
    // 2. Vague input → clarifying question, not a tracker.
    if (VAGUE.test(lower) || (raw.split(/\s+/).length <= 3 && !/\d/.test(raw))) {
      ai(`Got it — let's sharpen that. Which arena is this in?`, { chips: CLARIFY_CHIPS });
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

  const activate = async (proposal: any) => {
    if (activating || thinking) return;
    try {
      setActivating(true);
      const created = await createGoal(proposal.title ?? proposal.summary ?? 'Untitled goal');
      ai(`Tracker live: "${created.title}". It's on your Home tab now.`);
      router.push(`/goal/${created.id}`);
    } catch (e: any) {
      ai(`Couldn't create it: ${e?.error ?? 'try again.'}`, { chips: ['Try again'] });
    } finally {
      setActivating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          accessibilityLabel="Conversation with OnTrack coach"
          contentContainerStyle={{ padding: Spacing.lg, gap: 10, paddingTop: Spacing.xl }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item, index }) => (
            <ChatBubble
              msg={item}
              index={index}
              compact={index > 0 && messages[index - 1].sender === item.sender}
              onActivate={activate}
              onChip={(chip) => send(chip)}
            />
          )}
        />
        {messages.length <= 2 && (
          <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.navy, opacity: 0.6, marginBottom: 6 }}>
              STARTERS
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
              {STARTERS.map((s) => (
                <Pressable
                  key={s.title}
                  onPress={() => send(s.prompt)}
                  accessibilityLabel={`Start: ${s.title}`}
                  accessibilityRole="button"
                  style={{ borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.card, backgroundColor: Brand.white, paddingVertical: 10, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' }}
                >
                  <Text style={{ fontWeight: '700', color: Brand.navy, fontSize: 13 }}>{s.title}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={toggleAutoplay}
                accessibilityLabel={autoplay ? 'Turn off voice auto-play' : 'Turn on voice auto-play'}
                accessibilityRole="switch"
                accessibilityState={{ checked: autoplay }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.pill, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: autoplay ? Brand.turquoise : Brand.white, minHeight: 44 }}
              >
                <Ionicons name={autoplay ? 'volume-high' : 'volume-mute'} size={16} color={Brand.navy} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.navy }}>Auto-voice</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
        {thinking && (
          <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.lg }}>
            <ActivityIndicator color={Brand.turquoise} size="small" />
            <Text style={{ color: Brand.teal, fontWeight: '600' }}>Thinking…</Text>
          </View>
        )}
        {(dictError ?? dictation.error) && (
          <Text accessibilityLiveRegion="polite" style={{ paddingHorizontal: Spacing.lg, color: Brand.error, fontSize: Typography.caption.fontSize }}>
            {dictError ?? dictation.error}
          </Text>
        )}
        <View style={{ marginBottom: 108 }}>
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
