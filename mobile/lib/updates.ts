/** App updates (EAS OTA) — manual check + download + restart.
 * JS-only changes ship via `eas update`; native changes need a new build.
 * No-ops with an info alert under Metro / Expo Go where OTA is disabled. */
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export function updateInfo() {
  return {
    enabled: Updates.isEnabled,
    channel: Updates.channel ?? 'unknown',
    runtime: typeof Updates.runtimeVersion === 'string' ? Updates.runtimeVersion : 'unknown',
    updateId: Updates.updateId ?? null,
  };
}

export function useAppUpdate() {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [pending, setPending] = useState(false);

  const check = useCallback(async () => {
    const info = updateInfo();
    if (__DEV__ || !Updates.isEnabled) {
      Alert.alert(
        'App updates',
        `Over-the-air updates run in installed preview and production builds only.\n\nChannel: ${info.channel}\nRuntime: ${info.runtime}\n\nIn development, changes load live via Metro.`,
      );
      return;
    }
    if (pending) {
      Alert.alert('Update ready', 'An update has been downloaded. Restart now to apply it?', [
        { text: 'Later', style: 'cancel' },
        { text: 'Restart now', onPress: () => Updates.reloadAsync() },
      ]);
      return;
    }
    setChecking(true);
    try {
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        Alert.alert(
          'Up to date',
          `You are on the latest version of OnTrack.\n\nChannel: ${info.channel}${
            info.updateId ? `\nBuild: ${info.updateId.slice(0, 8)}` : ''
          }`,
        );
        return;
      }
      setChecking(false);
      setDownloading(true);
      setHidden(false);
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) {
            clearInterval(timer);
            return 90;
          }
          return p + Math.random() * 15;
        });
      }, 400);
      try {
        await Updates.fetchUpdateAsync();
        clearInterval(timer);
        setProgress(100);
        setPending(true);
        setDownloading(false);
        await new Promise((r) => setTimeout(r, 600));
        await Updates.reloadAsync();
      } catch (e: any) {
        clearInterval(timer);
        setDownloading(false);
        setProgress(0);
        Alert.alert('Download failed', e?.message ?? 'Could not download the update. Try again later.');
      }
    } catch (e: any) {
      Alert.alert(
        'Update check failed',
        `${e?.message ?? 'Could not check for updates right now.'}\n\nChannel: ${info.channel}`,
      );
    } finally {
      setChecking(false);
    }
  }, [pending]);

  return { checking, downloading, progress, hidden, setHidden, pending, check };
}
