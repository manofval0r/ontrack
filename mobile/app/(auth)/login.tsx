/** M4 Log in — email + Google/GitHub (Supabase). */
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { Card, PillButton } from '../../components/ui';
import { BackdropArt } from '../../components/BackdropArt';
import { signInWithEmail, signInWithProvider } from '../../lib/auth';
import { useGoals } from '../../lib/store';

export default function Login() {
  const { refresh } = useGoals();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncWarning, setSyncWarning] = useState(false);

  const afterAuth = async () => {
    try {
      await refresh();
    } catch {
      setSyncWarning(true);
    }
    router.replace('/(tabs)');
  };

  const valid = email.trim().length > 3 && email.includes('@') && password.length > 0;

  const onEmail = async () => {
    if (!valid || busy) return;
    try {
      setBusy(true);
      setError(null);
      await signInWithEmail(email.trim(), password);
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? 'Log in failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  const onProvider = async (provider: 'google' | 'github') => {
    if (busy) return;
    try {
      setBusy(true);
      setError(null);
      await signInWithProvider(provider);
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? `${provider === 'google' ? 'Google' : 'GitHub'} sign-in failed.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl, justifyContent: 'center' }}>
      <BackdropArt variant="dots" />
      <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
      <Card>
        <View style={{ alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 30, color: Brand.navy }}>Welcome back</Text>
          <Text style={{ fontSize: 13, color: Brand.navy, opacity: 0.6 }}>Pick up right where you left off.</Text>
        </View>
        <Text style={{ fontFamily: Typography.title.fontFamily, fontSize: Typography.title.fontSize, color: Brand.navy }}>Log in</Text>
        <View style={{ marginTop: Spacing.md, gap: 10 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Brand.placeholder}
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            style={input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={Brand.placeholder}
            accessibilityLabel="Password"
            autoComplete="password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={onEmail}
            style={input}
          />
          {error && <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>}
          {syncWarning && (
            <Text style={{ color: Brand.amberText, fontSize: 12 }}>Signed in, but goals did not sync — pull to refresh on Home.</Text>
          )}
          <PillButton title={busy ? 'Logging in…' : 'Log in'} primary onPress={onEmail} disabled={busy || !valid} />
          {busy && <ActivityIndicator color={Brand.turquoise} />}
          <PillButton title="Continue with Google" onPress={() => onProvider('google')} disabled={busy} />
          <PillButton title="Continue with GitHub" onPress={() => onProvider('github')} disabled={busy} />
        </View>
      </Card>
      <Link href="/(auth)/signup" accessibilityLabel="Go to sign up" style={{ marginTop: Spacing.lg, textAlign: 'center', color: Brand.teal, fontWeight: '600', minHeight: Touch.min }}>
        No account? Sign up
      </Link>
      </View>
    </SafeAreaView>
  );
}

const input = {
  borderWidth: 2,
  borderColor: Colors.light.inputBorder,
  borderRadius: Radii.input,
  padding: Spacing.md,
  fontSize: Typography.body.fontSize,
  backgroundColor: Brand.white,
  color: Brand.navy,
  minHeight: Touch.min,
} as const;
