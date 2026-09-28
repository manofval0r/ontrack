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
import { AudioModule, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { Card, PillButton } from '../components/ui';
import { api } from '../lib/api';
import { useGoals } from '../lib/store';

export default function VoiceModal() {
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
      // Read file as base64 without expo-file-system (fetch blob → FileReader).
      const blob = await (await fetch(uri)).blob();
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const { transcript: text } = await api.asr(base64);
      setTranscript(text);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl }} edges={['top']}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="close" size={20} color={Brand.navy} />
        <Text style={{ fontWeight: '700', color: Brand.navy }}>Close</Text>
      </Pressable>
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Animated.View style={pulseStyle}>
          <Pressable
            onPress={() => (isRecording ? stop() : start())}
            accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
            style={{
              width: Touch.micHero,
              height: Touch.micHero,
              borderRadius: 999,
              backgroundColor: isRecording ? '#dc2626' : Brand.turquoise,
              borderWidth: 2,
              borderColor: Brand.navy,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
            }}
          >
            <Ionicons name="mic" size={36} color={isRecording ? '#fff' : Brand.navy} />
          </Pressable>
          </Animated.View>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>
            {isRecording ? 'Listening…' : busy ? 'Working…' : 'Tap to speak your goal'}
          </Text>
          {busy && <ActivityIndicator color={Brand.turquoise} />}
        </View>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.teal }}>Transcript (editable)</Text>
          <TextInput
            value={transcript}
            onChangeText={setTranscript}
            placeholder="Your words appear here…"
            multiline
            style={{
              marginTop: 8,
              minHeight: 88,
              borderWidth: 2,
              borderColor: 'rgba(7,30,45,0.2)',
              borderRadius: Radii.input,
              padding: Spacing.md,
              fontSize: 15,
              backgroundColor: '#fff',
              textAlignVertical: 'top',
            }}
          />
        </Card>
        {error && <Text style={{ color: '#dc2626' }}>{error}</Text>}
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
