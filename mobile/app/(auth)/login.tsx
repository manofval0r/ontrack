/** M4 Log in — brand hero, social-first, email card, staggered motion. */
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Brand } from '../../constants/colors';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { BrandMark, Card, PillButton, SocialButton } from '../../components/ui';
import { BackdropArt } from '../../components/BackdropArt';
import { signInWithEmail, signInWithProvider } from '../../lib/auth';
import { useGoals } from '../../lib/store';

export default function Login() {
  const t = useTheme();
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

  const input = {
    borderWidth: 2,
    borderColor: t.inputBorder,
    borderRadius: Radii.input,
    padding: Spacing.md,
    fontSize: Typography.body.fontSize,
    backgroundColor: t.surface,
    color: t.ink,
    minHeight: Touch.min,
  } as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <BackdropArt variant="full" />
      <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'center', gap: 14 }}>
        <Animated.View entering={FadeInDown.duration(350)} style={{ alignItems: 'center', gap: 8 }}>
          <BrandMark />
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 32, color: t.ink, textAlign: 'center' }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: 14, color: t.inkSoft, textAlign: 'center' }}>
            Pick up right where you left off.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(120)} style={{ flexDirection: 'row', gap: 10 }}>
          <SocialButton provider="google" label="Google" onPress={() => onProvider('google')} disabled={busy} />
          <SocialButton provider="github" label="GitHub" dark onPress={() => onProvider('github')} disabled={busy} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(200)}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1, height: 2, backgroundColor: t.inputBorder }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: t.inkSoft }}>OR CONTINUE WITH EMAIL</Text>
              <View style={{ flex: 1, height: 2, backgroundColor: t.inputBorder }} />
            </View>
            <View style={{ gap: 10 }}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={t.inkSoft}
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
                placeholderTextColor={t.inkSoft}
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
            </View>
          </Card>
        </Animated.View>

        <Link href="/(auth)/signup" accessibilityLabel="Go to sign up" style={{ textAlign: 'center', color: t.teal, fontWeight: '600', minHeight: Touch.min }}>
          No account? Sign up
        </Link>
      </View>
    </SafeAreaView>
  );
}
