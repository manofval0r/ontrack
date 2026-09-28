/** Root layout: fonts → session → navigation graph (spec M1–M14). */
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { GoalsProvider } from '../lib/store';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_700Bold,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
    // Never trap the user on a blank splash: system fonts after 4s.
    const fallback = setTimeout(() => setReady(true), 4000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) setReady(true);
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GoalsProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="goal/[id]"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="voice"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="work-block"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack>
    </GoalsProvider>
  );
}
