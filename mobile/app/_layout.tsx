/** Root layout: fonts → session → navigation graph (spec M1–M14). */
import { useEffect, useRef, useState } from 'react';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { OriginalSurfer_400Regular } from '@expo-google-fonts/original-surfer';
import { GoalsProvider } from '../lib/store';
import { ThemeProvider } from '../lib/theme';
import { ToastProvider, useToast } from '../lib/toast';

/** Foreground notifications surface as in-app toasts instead of banners. */
function ForegroundToastBridge() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    const sub = Notifications.addNotificationReceivedListener((n) => {
      const t = n.request.content.title ?? 'Reminder';
      const b = n.request.content.body ?? '';
      toastRef.current.show({ type: 'info', title: t, message: b });
    });
    return () => sub.remove();
  }, []);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_700Bold,
    OriginalSurfer_400Regular,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
    // Deferred OAuth intents (cold start / Custom Tab handoff) arrive as
    // navigation on BOTH schemes — forward them to the auth receiver.
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (url.startsWith('ontrack://auth') || /\/--\/auth([?#]|$)/.test(url)) {
        router.replace('/auth' as any);
      }
    });
    // Never trap the user on a blank splash: system fonts after 4s.
    const fallback = setTimeout(() => setReady(true), 4000);
    return () => {
      clearTimeout(fallback);
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) setReady(true);
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GoalsProvider>
        <ThemeProvider>
        <ToastProvider>
          <ForegroundToastBridge />
          <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="goal/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="voice"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="work-block"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="integration/[provider]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
        </ToastProvider>
        </ThemeProvider>
      </GoalsProvider>
    </GestureHandlerRootView>
  );
}
