/** Shared TTS: backend /api/tts → expo-audio, device Speech fallback.
 * Prefetches on message arrival; 8s fast-fallback so slow audio never blocks. */
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { api } from './api';

let activePlayer: AudioPlayer | null = null;
const urlCache = new Map<string, string>();
const TTS_FAST_MS = 8000;

export function stopSpeaking() {
  try {
    activePlayer?.remove();
  } catch {}
  activePlayer = null;
  Speech.stop();
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('tts-timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/** Warm the backend TTS cache the moment an AI message lands. */
export function prefetchSpeech(text: string): void {
  if (!text || urlCache.has(text)) return;
  api
    .tts(text)
    .then(({ audio_url }) => {
      if (audio_url && !audio_url.includes('stub')) urlCache.set(text, audio_url);
    })
    .catch(() => {});
  if (urlCache.size > 40) {
    const first = urlCache.keys().next().value;
    if (first) urlCache.delete(first);
  }
}

export async function speakText(text: string, onDone?: () => void): Promise<void> {
  stopSpeaking();
  try {
    let audio_url = urlCache.get(text);
    if (!audio_url) {
      const res = await withTimeout(api.tts(text), TTS_FAST_MS);
      audio_url = res.audio_url;
      if (audio_url && !audio_url.includes('stub')) urlCache.set(text, audio_url);
    }
    if (audio_url && !audio_url.includes('stub')) {
      const player = createAudioPlayer({ uri: audio_url });
      activePlayer = player;
      player.addListener('playbackStatusUpdate', (status: { didJustFinish?: boolean }) => {
        if (status.didJustFinish) {
          stopSpeaking();
          onDone?.();
        }
      });
      player.play();
      return;
    }
  } catch {
    // fall through to instant device speech — fast, offline-capable
  }
  Speech.speak(text, { onDone, onStopped: onDone });
}
