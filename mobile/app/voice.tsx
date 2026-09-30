/** Voice Input modal — record → POST /api/asr → editable transcript → create/log. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card, PillButton } from '../components/ui';
import { api } from '../lib/api';
import { uriToBase64 } from '../lib/audioFile';
import { useGoals } from '../lib/store';

export default function VoiceModal() {
  const t = useTheme();
  const { createGoal } = useGoals();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        false
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = 1;
    }
  }, [isRecording, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    try {
      setError(null);
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setError('Microphone permission is needed for voice input.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {
      setError("Couldn't start recording.");
    }
  };

  const stop = async (cancel = false) => {
    if (!isRecording) return;
    try {
      setBusy(true);
      await recorder.stop();
      const uri = recorder.uri;
      setIsRecording(false);
      if (cancel || !uri) {
        setBusy(false);
        return;
      }
      const base64 = await uriToBase64(uri);
      const { transcript: text } = await api.asr(base64);
      setTranscript(text.slice(0, 500));
    } catch (e: any) {
      setError(e?.error ?? "Couldn't transcribe. Type instead.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!transcript.trim()) return;
    try {
      setBusy(true);
      const created = await createGoal(transcript.trim());
      router.replace(`/goal/${created.id}`);
    } catch (e: any) {
      setError(e?.error ?? 'Could not create goal.');
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas, padding: Spacing.xl }} edges={['top']}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityLabel="Close voice input"
        accessibilityRole="button"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 }}
      >
        <Ionicons name="close" size={20} color={t.ink} />
        <Text style={{ fontWeight: '700', color: t.ink }}>Close</Text>
      </Pressable>
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Animated.View style={pulseStyle}>
          <Pressable
            onPress={() => (isRecording ? stop() : start())}
            disabled={busy}
            accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
            accessibilityRole="button"
            accessibilityHint="Records your voice, then transcribes it into the editable field"
            accessibilityState={{ disabled: busy, busy: isRecording }}
            style={{
              width: Touch.micHero,
              height: Touch.micHero,
              borderRadius: Radii.pill,
              backgroundColor: isRecording ? Brand.error : Brand.turquoise,
              borderWidth: 2,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
            }}
          >
            <Ionicons name="mic" size={36} color={isRecording ? Brand.white : Brand.navy} />
          </Pressable>
          </Animated.View>
          <Text accessibilityLiveRegion="polite" style={{ fontWeight: '700', color: t.ink }}>
            {isRecording ? 'Listening…' : busy ? 'Working…' : 'Tap to speak your goal'}
          </Text>
          {busy && <ActivityIndicator color={Brand.turquoise} />}
        </View>
        <Card>
          <Text style={{ fontWeight: '700', color: t.teal }}>Transcript (editable)</Text>
          <TextInput
            value={transcript}
            onChangeText={(t) => setTranscript(t.slice(0, 500))}
            placeholder="Your words appear here…"
            placeholderTextColor={t.inkSoft}
            accessibilityLabel="Voice transcript, editable"
            multiline
            maxLength={500}
            style={{
              marginTop: 8,
              minHeight: 88,
              borderWidth: 2,
              borderColor: t.inputBorder,
              borderRadius: Radii.input,
              padding: Spacing.md,
              fontSize: Typography.body.fontSize,
              backgroundColor: t.surface,
              textAlignVertical: 'top',
            }}
          />
        </Card>
        {error && <Text accessibilityLiveRegion="polite" style={{ color: Brand.error }}>{error}</Text>}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Re-record" onPress={() => { setTranscript(''); start(); }} disabled={isRecording || busy} />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton title="Sounds good" primary onPress={submit} disabled={!transcript.trim() || busy} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
