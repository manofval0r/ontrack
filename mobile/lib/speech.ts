/** Shared TTS: backend /api/tts → expo-audio, device Speech fallback. */
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { api } from './api';

let activePlayer: AudioPlayer | null = null;

export function stopSpeaking() {
  try {
    activePlayer?.remove();
  } catch {}
  activePlayer = null;
  Speech.stop();
}

export async function speakText(text: string, onDone?: () => void): Promise<void> {
  stopSpeaking();
  try {
    const { audio_url } = await api.tts(text);
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
    // fall through to device speech
  }
  Speech.speak(text, { onDone, onStopped: onDone });
}
