/** OAuth landing route — receives Supabase redirects that arrive as navigation
 * (cold start, deferred intent, Expo Go) instead of the warm browser session.
 * Accepts BOTH standalone (`ontrack://auth…`) and Expo Go dev
 * (`exp://…/--/auth…`) URLs. Parses access/refresh/provider tokens from hash
 * AND query forms, completes the pending mode (login vs integration connect),
 * then routes onward. Never spins forever: errors always surface with actions.
 * The warm `openAuthSessionAsync` path in lib/auth.ts stays primary. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useURL } from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { Spacing } from '../constants/spacing';
import { Card, PillButton } from '../components/ui';
import { request } from '../lib/api';
import { getToken, oauthRedirectUrl, parseOAuthParams, claimOAuthRedirect, saveProviderToken, setSession } from '../lib/auth';

function isAuthUrl(url: string): boolean {
  return url.startsWith('ontrack://auth') || /\/--\/auth([?#]|$)/.test(url);
}

export default function AuthCallback() {
  const t = useTheme();
  const initialUrl = useURL();
  // The redirect event can fire BEFORE this route mounts (root listener
  // navigates here after the fact), so useURL() may miss it. Track late
  // arrivals with our own subscription as well as the initial URL.
  const [lateUrl, setLateUrl] = useState<string | null>(null);
  const url = lateUrl ?? initialUrl;
  const [error, setError] = useState<string | null>(null);
  const [errMode, setErrMode] = useState<string>('login');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url: incoming }) => {
      if (isAuthUrl(incoming)) setLateUrl(incoming);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (done) return;
    // No deep link (e.g. opened directly): the warm browser session may still
    // own this sign-in and set the session at any moment. Poll briefly for a
    // session before declaring failure — erroring here while logged in is
    // exactly what stranded users on the "link broke" screen.
    if (url === null) {
      let cancelled = false;
      let tries = 0;
      const tick = async () => {
        if (cancelled) return;
        tries += 1;
        try {
          if (await getToken()) {
            setDone(true);
            router.replace('/(tabs)');
            return;
          }
        } catch {}
        if (tries * 500 >= 6000) {
          setError('No sign-in data arrived. Return and try again.');
          return;
        }
        timer = setTimeout(tick, 500);
      };
      let timer = setTimeout(tick, 500);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
    (async () => {
      let mode = 'login';
      try {
        if (!isAuthUrl(url)) {
          router.replace('/(tabs)');
          return;
        }
        // Single-owner claim (see lib/auth.ts): the warm browser session may
        // already own this redirect. Replays route by existing session and
        // NEVER touch the login session or retry side effects.
        const claimed = await claimOAuthRedirect(url);
        if (claimed === null) {
          setDone(true);
          router.replace((await getToken()) ? '/(tabs)' : '/(auth)/login');
          return;
        }
        mode = claimed;
        setErrMode(mode);
        const params = parseOAuthParams(url);
        if (params.error_description || params.error) {
          throw new Error(params.error_description ?? 'Sign-in was cancelled.');
        }

        if (mode === 'login') {
          if (!params.access_token) throw new Error('No session returned. Try again.');
          await setSession(params.access_token, params.refresh_token);
          setDone(true);
          router.replace('/(tabs)');
          return;
        }

        if (mode === 'unknown') {
          // Mode key already consumed elsewhere. Route by session — a login
          // swap here is exactly what used to boot users to the login screen.
          setDone(true);
          router.replace((await getToken()) ? '/(tabs)' : '/(auth)/login');
          return;
        }

        // Integration connect: vault the provider token (never swap the login session).
        const vaultToken = params.provider_token || params.provider_refresh_token;
        if (!vaultToken) {
          throw new Error(
            'Connected, but no provider token came back. Reconnect — and if it persists, the provider needs re-approval.'
          );
        }
        try {
          await request('/api/integrations', {
            method: 'POST',
            body: JSON.stringify({ provider: mode, access_token: vaultToken, meta: { via: 'supabase-oauth' } }),
          });
        } catch (e: any) {
          // Tolerate the double-processing twin: the warm path may have
          // already connected this provider a moment ago.
          if (!/already|exists|duplicate|409/i.test(String(e?.message ?? e?.error ?? e))) throw e;
        }
        await saveProviderToken(mode, vaultToken);
        setDone(true);
        router.replace({ pathname: '/(tabs)/settings', params: { connected: mode } });
      } catch (e: any) {
        // Genuine failures must not nuke a good login session or strand the
        // user on the sign-in screen. Integration errors stay on settings.
        setErrMode(mode);
        const msg = String(e?.error ?? e?.message ?? 'Sign-in failed. Try again.');
        const hint = /no session|no sign-in data|returned no token/i.test(msg)
          ? `\n\nExpected redirect: ${oauthRedirectUrl()} — this URL must be in the Supabase redirect allowlist.`
          : '';
        setError(`${msg}${hint}`);
      }
    })();
  }, [url, done]);

  const integrating = errMode !== 'login' && errMode !== 'unknown';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas, padding: Spacing.xl, justifyContent: 'center' }}>
      <Card>
        {error ? (
          <>
            <Text style={{ fontWeight: '700', color: t.ink, fontSize: 18 }}>Hmm, that link broke</Text>
            <Text style={{ marginTop: 6, color: t.ink }}>{error}</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {integrating ? (
                <>
                  <PillButton title="Back to settings" primary onPress={() => router.replace('/(tabs)/settings')} />
                  <PillButton title="Home" onPress={() => router.replace('/(tabs)')} />
                </>
              ) : (
                <>
                  <PillButton title="Back to sign in" primary onPress={() => router.replace('/(auth)/login')} />
                  <PillButton title="Home" onPress={() => router.replace('/(tabs)')} />
                </>
              )}
            </View>
          </>
        ) : (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <ActivityIndicator color={Brand.turquoise} />
            <Text style={{ color: t.ink, fontWeight: '600' }}>Finishing sign-in…</Text>
          </View>
        )}
      </Card>
    </SafeAreaView>
  );
}
