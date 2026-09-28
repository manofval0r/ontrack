/** M6 Chat — the main screen: transcript + fluid composer (text, voice, send).
 * Voice dictation records inline (expo-audio) → POST /api/asr → appends to
 * the input. No separate voice screen needed for chat-driven goals. */
import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brand } from '../../constants/colors';
import { Radii, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { api } from '../../lib/api';
import { useDictation } from '../../lib/useDictation';
import { useGoals } from '../../lib/store';
import { ChatBubble, type ChatMsg } from '../../components/ChatBubble';
import { ChatComposer } from '../../components/ChatComposer';

export default function Chat() {
  const { createGoal } = useGoals();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'welcome', sender: 'ai', content: 'Tell me what you want to make progress on.' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [activating, setActivating] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const dictation = useDictation((transcript) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, 500));
    setDictError(null);
  });

  const push = (m: ChatMsg) => {
    setMessages((prev) => [...prev, m]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const busy = thinking || activating || dictation.recording || dictation.transcribing;

  const send = async (text?: string) => {
    const raw = (text ?? input).trim();
    if (!raw || busy) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    push({ id: `u-${Date.now()}`, sender: 'user', content: raw });
    setThinking(true);
    try {
      const { ai_response_text, goal_proposal } = await api.parseGoal(raw);
      push({ id: `ai-${Date.now()}`, sender: 'ai', content: ai_response_text, proposal: goal_proposal });
    } catch {
      push({
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: `Got it — "${raw}". You're offline, so this tracker lives on this device until you reconnect.`,
        proposal: { title: raw, offline: true },
      });
    } finally {
      setThinking(false);
    }
  };

  const activate = async (proposal: any) => {
    if (activating || thinking) return;
    try {
      setActivating(true);
      const created = await createGoal(proposal.title ?? proposal.summary ?? 'Untitled goal');
      push({ id: `ai-${Date.now()}`, sender: 'ai', content: `Tracker live: "${created.title}".` });
      router.push(`/goal/${created.id}`);
    } catch (e: any) {
      push({ id: `ai-${Date.now()}`, sender: 'ai', content: `Couldn't create it: ${e?.error ?? 'try again.'}` });
    } finally {
      setActivating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{ padding: Spacing.lg, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: Typography.title.fontFamily, fontSize: Typography.title.fontSize, color: Brand.navy }}>
            OnTrack coach
          </Text>
          {dictation.recording && (
            <View
              accessibilityLabel={`Recording, ${dictation.recSecs} seconds`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.error, borderRadius: Radii.pill, paddingHorizontal: 10, paddingVertical: 4 }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.white }} />
              <Text style={{ color: Brand.white, fontSize: Typography.caption.fontSize, fontWeight: '700' }}>
                {Math.floor(dictation.recSecs / 60)}:{String(dictation.recSecs % 60).padStart(2, '0')}
              </Text>
            </View>
          )}
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          accessibilityLabel="Conversation with OnTrack coach"
          contentContainerStyle={{ padding: Spacing.lg, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item, index }) => (
            <ChatBubble msg={item} index={index} onActivate={activate} />
          )}
        />
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
