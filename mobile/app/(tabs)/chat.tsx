/** M6 Chat — transcript + composer (mic leading, send trailing), proposal cards. */
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brand } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';

interface Msg {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  proposal?: any;
}

export default function Chat() {
  const { createGoal } = useGoals();
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'welcome', sender: 'ai', content: 'Tell me what you want to make progress on.' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<FlatList>(null);

  const push = (m: Msg) => {
    setMessages((prev) => [...prev, m]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const send = async (text?: string) => {
    const raw = (text ?? input).trim();
    if (!raw || thinking) return;
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
        content: `Got it — "${raw}". Use this tracker to start, or retry when online.`,
        proposal: { title: raw },
      });
    } finally {
      setThinking(false);
    }
  };

  const activate = async (proposal: any) => {
    try {
      const created = await createGoal(proposal.title ?? proposal.summary ?? 'Untitled goal');
      push({ id: `ai-${Date.now()}`, sender: 'ai', content: `Tracker live: "${created.title}".` });
      router.push(`/goal/${created.id}`);
    } catch (e: any) {
      push({ id: `ai-${Date.now()}`, sender: 'ai', content: `Couldn't create it: ${e?.error ?? 'try again.'}` });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{ padding: Spacing.lg, paddingBottom: 4 }}>
          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: Brand.navy }}>
            OnTrack coach
          </Text>
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                <View
                  style={{
                    backgroundColor: isUser ? Brand.navy : '#fff',
                    borderWidth: 2,
                    borderColor: Brand.navy,
                    borderRadius: Radii.bubble,
                    padding: 14,
                    shadowColor: Brand.navy,
                    shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontSize: 15, color: isUser ? '#fff' : Brand.navy }}>{item.content}</Text>
                  {item.proposal && (
                    <View style={{ marginTop: 10, backgroundColor: Brand.cyanBg, borderWidth: 2, borderColor: Brand.navy, borderRadius: 12, padding: 12 }}>
                      <Text style={{ fontWeight: '700', color: Brand.navy }}>
                        {item.proposal.title ?? 'New tracker'}
                      </Text>
                      {!!item.proposal.goal_type && (
                        <Text style={{ fontSize: 12, color: Brand.teal, fontWeight: '600', marginTop: 2 }}>
                          {item.proposal.goal_type} tracker
                        </Text>
                      )}
                      <Pressable
                        onPress={() => activate(item.proposal)}
                        style={{ marginTop: 8, backgroundColor: Brand.navy, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Use this tracker</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
        {thinking && (
          <Text style={{ paddingHorizontal: Spacing.lg, color: Brand.teal, fontWeight: '600' }}>
            Thinking…
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: Spacing.md,
            paddingBottom: Spacing.lg,
          }}
        >
          <Pressable
            onPress={() => router.push('/voice')}
            accessibilityLabel="Voice input"
            style={{
              width: Touch.iconButton,
              height: Touch.iconButton,
              borderRadius: 999,
              backgroundColor: Brand.turquoise,
              borderWidth: 2,
              borderColor: Brand.navy,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>🎤</Text>
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message OnTrack…"
            multiline
            maxLength={500}
            style={{
              flex: 1,
              minHeight: Touch.min,
              maxHeight: 110,
              borderWidth: 2,
              borderColor: Brand.navy,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: '#fff',
              fontSize: 15,
            }}
          />
          <Pressable
            onPress={() => send()}
            disabled={!input.trim() || thinking}
            accessibilityLabel="Send message"
            style={{
              width: Touch.iconButton,
              height: Touch.iconButton,
              borderRadius: 999,
              backgroundColor: Brand.navy,
              borderWidth: 2,
              borderColor: Brand.navy,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !input.trim() || thinking ? 0.4 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
