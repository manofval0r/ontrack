/** Session: Supabase JWT in SecureStore (same `ontrack_token` contract as web). */
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'ontrack_token';
const REFRESH_KEY = 'ontrack_refresh_token';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSession(accessToken: string, refreshToken?: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  if (refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

/** Email/password login via Supabase Auth REST (same flow as web Login.tsx). */
export async function signInWithEmail(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.msg ?? 'Invalid email or password.');
  }
  await setSession(data.access_token, data.refresh_token);
  return data.access_token as string;
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password, data: { full_name: name } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? data.msg ?? 'Signup failed.');
  if (data.access_token) await setSession(data.access_token, data.refresh_token);
  return data.access_token as string | undefined;
}

/** OAuth via system browser → Supabase → deep link back to the app scheme.
 *
 * NO separate GitHub/Google OAuth app is needed for mobile: the OAuth App
 * callback is server-side (https://<ref>.supabase.co/auth/v1/callback), so the
 * SAME provider credentials serve web + mobile. The only mobile-side config is
 * the Supabase Redirect URLs allowlist, which must contain:
 *   - ontrack://auth            (standalone builds, matches `scheme` in app.json)
 *   - exp://<lan-ip>:8081/--/auth (Expo Go dev — changes per machine/network)
 * If the redirect is missing from the allowlist, Supabase falls back to the
 * Site URL (the Vercel web app) — that is the "lands on web" symptom.
 */
export async function signInWithProvider(
  provider: 'google' | 'github',
  opts?: { mode?: string; scopes?: string }
): Promise<{ accessToken: string; providerToken: string | null }> {
  const redirect = Linking.createURL('auth');
  const mode = opts?.mode ?? 'login';
  await SecureStore.setItemAsync('ontrack_oauth_mode', mode);
  let authUrl =
    `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}` +
    `&redirect_to=${encodeURIComponent(redirect)}`;
  if (opts?.scopes) authUrl += `&scopes=${encodeURIComponent(opts.scopes)}`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirect);
  if (result.type !== 'success' || !result.url) throw new Error(`${provider} sign-in cancelled.`);
  const hash = result.url.split('#')[1] ?? '';
  const query = result.url.split('?')[1]?.split('#')[0] ?? '';
  const params = new URLSearchParams(`${query}&${hash}`);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const providerToken = params.get('provider_token');
  if (!accessToken) throw new Error(`${provider} sign-in returned no token.`);
  if (mode === 'login') {
    // Login only: session swap belongs here and nowhere else.
    await setSession(accessToken, refreshToken ?? undefined);
  }
  if (providerToken) {
    await saveProviderToken(mode === 'login' ? provider : mode, providerToken);
  }
  return { accessToken, providerToken };
}

export async function saveProviderToken(key: string, token: string) {
  try {
    const raw = await SecureStore.getItemAsync('ontrack_provider_tokens');
    const map = raw ? JSON.parse(raw) : {};
    map[key] = token;
    await SecureStore.setItemAsync('ontrack_provider_tokens', JSON.stringify(map));
  } catch {}
}

export async function getProviderToken(key: string): Promise<string | null> {
  try {
    const raw = await SecureStore.getItemAsync('ontrack_provider_tokens');
    const map = raw ? JSON.parse(raw) : {};
    return typeof map[key] === 'string' ? map[key] : null;
  } catch {
    return null;
  }
}

export async function clearProviderToken(key: string) {
  try {
    const raw = await SecureStore.getItemAsync('ontrack_provider_tokens');
    const map = raw ? JSON.parse(raw) : {};
    delete map[key];
    await SecureStore.setItemAsync('ontrack_provider_tokens', JSON.stringify(map));
  } catch {}
}

/** Kept for existing callers — Google via the shared provider flow. */
export async function signInWithGoogle(): Promise<string> {
  const { accessToken } = await signInWithProvider('google');
  return accessToken;
}
