/** M6 Chat — the main screen: transcript + fluid composer (text, voice, send).
 * Voice dictation records inline (expo-audio) → POST /api/asr → appends to
 * the input. No separate voice screen needed for chat-driven goals. */
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { Brand } from '../../constants/colors';
import { Spacing, Touch } from '../../constants/spacing';
import { api } from '../../lib/api';
import { uriToBase64 } from '../../lib/audioFile';
import { useGoals } from '../../lib/store';
import { ChatBubble, type ChatMsg } from '../../components/ChatBubble';

export default function Chat() {
  const { createGoal } = useGoals();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'welcome', sender: 'ai', content: 'Tell me what you want to make progress on.' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  // Inline dictation state
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const push = (m: ChatMsg) => {
    setMessages((prev) => [...prev, m]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const send = async (text?: string) => {
    const raw = (text ?? input).trim();
    if (!raw || thinking || recording) return;
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

  const toggleDictation = async () => {
    if (thinking || transcribing) return;
    if (recording) {
      // Stop → transcribe → append to the input (dictation, stays editable).
      try {
        if (timerRef.current) clearInterval(timerRef.current);
        await recorder.stop();
        const uri = recorder.uri;
        setRecording(false);
        if (!uri) return;
        setTranscribing(true);
        setDictError(null);
        const base64 = await uriToBase64(uri);
        const { transcript } = await api.asr(base64);
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, 500));
      } catch (e: any) {
        setDictError(e?.error ?? "Couldn't transcribe. Type instead.");
      } finally {
        setTranscribing(false);
      }
      return;
    }
    try {
      setDictError(null);
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setDictError('Microphone permission is needed for dictation.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
      setRecSecs(0);
      timerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {
      setDictError("Couldn't start recording.");
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

  const fmtSecs = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{ padding: Spacing.lg, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: Brand.navy }}>
            OnTrack coach
          </Text>
          {recording && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#dc2626', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{fmtSecs(recSecs)}</Text>
            </View>
          )}
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item, index }) => (
            <ChatBubble msg={item} index={index} onActivate={activate} />
          )}
        />
        {thinking && (
          <Text style={{ paddingHorizontal: Spacing.lg, color: Brand.teal, fontWeight: '600' }}>
            Thinking…
          </Text>
        )}
        {dictError && (
          <Text style={{ paddingHorizontal: Spacing.lg, color: '#dc2626', fontSize: 12 }}>
            {dictError}
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
            onPress={toggleDictation}
            disabled={thinking || transcribing}
            accessibilityLabel={recording ? 'Stop dictation' : 'Dictate with voice'}
            style={{
              width: Touch.iconButton,
              height: Touch.iconButton,
              borderRadius: 999,
              backgroundColor: recording ? '#dc2626' : Brand.turquoise,
              borderWidth: 2,
              borderColor: Brand.navy,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: thinking || transcribing ? 0.5 : 1,
            }}
          >
            {transcribing ? (
              <ActivityIndicator color={Brand.navy} size="small" />
            ) : (
              <Ionicons name={recording ? 'stop' : 'mic'} size={22} color={recording ? '#fff' : Brand.navy} />
            )}
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={recording ? 'Listening… tap stop when done' : 'Message OnTrack…'}
            multiline
            maxLength={500}
            editable={!recording}
            style={{
              flex: 1,
              minHeight: Touch.min,
              maxHeight: 110,
              borderWidth: 2,
              borderColor: recording ? '#dc2626' : Brand.navy,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: '#fff',
              fontSize: 15,
            }}
          />
          <Pressable
            onPress={() => send()}
            disabled={!input.trim() || thinking || recording}
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
              opacity: !input.trim() || thinking || recording ? 0.4 : 1,
            }}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
