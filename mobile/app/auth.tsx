/** OAuth landing route — receives Supabase redirects that arrive as navigation
 * (cold start, deferred intent, Expo Go) instead of the warm browser session.
 * Parses access/refresh/provider tokens from hash AND query forms, completes
 * the pending mode (login vs integration connect), then routes onward.
 * The warm `openAuthSessionAsync` path in lib/auth.ts stays primary. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useURL } from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Brand } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Card, PillButton } from '../components/ui';
import { request } from '../lib/api';
import { setSession } from '../lib/auth';

const MODE_KEY = 'ontrack_oauth_mode';

function parseTokens(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const hash = url.split('#')[1] ?? '';
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  for (const part of [query, hash]) {
    for (const [k, v] of new URLSearchParams(part)) {
      if (v) out[k] = v;
    }
  }
  return out;
}

export default function AuthCallback() {
  const url = useURL();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!url || done) return;
    (async () => {
      try {
        if (!url.startsWith('ontrack://auth')) {
          router.replace('/(tabs)');
          return;
        }
        const params = parseTokens(url);
        if (params.error_description || params.error) {
          throw new Error(params.error_description ?? 'Sign-in was cancelled.');
        }
        const mode = (await SecureStore.getItemAsync(MODE_KEY)) || 'login';
        await SecureStore.deleteItemAsync(MODE_KEY);

        if (mode === 'login') {
          if (!params.access_token) throw new Error('No session returned. Try again.');
          await setSession(params.access_token, params.refresh_token);
          setDone(true);
          router.replace('/(tabs)');
          return;
        }

        // Integration connect: provider token (Google) or access token fallback.
        const providerToken = params.provider_token || params.provider_refresh_token;
        const accessToken = params.access_token;
        const vaultToken = providerToken || accessToken;
        if (!vaultToken) throw new Error('No provider token returned. Try again.');
        await request('/api/integrations', {
          method: 'POST',
          body: JSON.stringify({
            provider: mode,
            access_token: vaultToken,
            meta: { via: 'supabase-oauth' },
          }),
        });
        setDone(true);
        router.replace({ pathname: '/(tabs)/settings', params: { connected: mode } });
      } catch (e: any) {
        setError(e?.error ?? e?.message ?? 'Sign-in failed. Try again.');
      }
    })();
  }, [url, done]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl, justifyContent: 'center' }}>
      <Card>
        {error ? (
          <>
            <Text style={{ fontWeight: '700', color: Brand.navy, fontSize: 18 }}>Hmm, that link broke</Text>
            <Text style={{ marginTop: 6, color: Brand.navy }}>{error}</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              <PillButton title="Back to sign in" primary onPress={() => router.replace('/(auth)/login')} />
              <PillButton title="Home" onPress={() => router.replace('/(tabs)')} />
            </View>
          </>
        ) : (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <ActivityIndicator color={Brand.turquoise} />
            <Text style={{ color: Brand.navy, fontWeight: '600' }}>Finishing sign-in…</Text>
          </View>
        )}
      </Card>
    </SafeAreaView>
  );
}
