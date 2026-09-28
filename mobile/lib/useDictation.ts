/** Inline voice dictation: record → POST /api/asr → text. */
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { api } from './api';
import { uriToBase64 } from './audioFile';

export function useDictation(onTranscript: (text: string) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cbRef = useRef(onTranscript);
  cbRef.current = onTranscript;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stop = async () => {
    if (!recording) return;
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      await recorder.stop();
      const uri = recorder.uri;
      setRecording(false);
      if (!uri) return;
      setTranscribing(true);
      setError(null);
      const base64 = await uriToBase64(uri);
      const { transcript } = await api.asr(base64);
      cbRef.current(transcript);
    } catch (e: any) {
      setError(e?.error ?? "Couldn't transcribe. Type instead.");
    } finally {
      setTranscribing(false);
    }
  };

  const start = async () => {
    try {
      setError(null);
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setError('Microphone permission is needed for dictation.');
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
      setError("Couldn't start recording.");
    }
  };

  const toggle = () => {
    if (transcribing) return;
    if (recording) stop();
    else start();
  };

  return { recording, recSecs, transcribing, error, toggle, clearError: () => setError(null) };
}
