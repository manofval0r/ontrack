/** M3 Sign up — hero header, social-first, pending-goal chip, staggered motion. */
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Brand } from '../../constants/colors';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { BrandMark, Card, PillButton, SocialButton } from '../../components/ui';
import { BackdropArt } from '../../components/BackdropArt';
import { signInWithProvider, signUpWithEmail, awaitSession } from '../../lib/auth';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';

export default function Signup() {
  const t = useTheme();
  const { pendingGoal } = useLocalSearchParams<{ pendingGoal?: string }>();
  const { refresh } = useGoals();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [goalWarning, setGoalWarning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const afterAuth = async () => {
    if (typeof pendingGoal === 'string' && pendingGoal.trim()) {
      try {
        await api.createGoal(pendingGoal.trim());
      } catch {
        setGoalWarning(true);
      }
    }
    // Same as login: enter tabs first, reconcile behind. Never trap a
    // freshly authenticated user on a spinner behind a cold backend.
    router.replace('/(tabs)');
    try {
      await refresh();
    } catch {
      setGoalWarning(true);
    }
  };

  const valid =
    name.trim().length > 0 && email.trim().length > 3 && email.includes('@') && password.length >= 8;

  const onSignup = async () => {
    if (!valid || busy) return;
    try {
      setBusy(true);
      setError(null);
      const token = await signUpWithEmail(name.trim(), email.trim(), password);
      if (!token) {
        // Email confirmation required — no session yet. Do NOT enter tabs.
        setNeedsConfirmation(true);
        return;
      }
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? 'Sign up failed. Try a different email.');
    } finally {
      setBusy(false);
    }
  };

  const onProvider = async (provider: 'google' | 'github') => {
    if (busy) return;
    try {
      setBusy(true);
      setError(null);
      const { owned } = await signInWithProvider(provider);
      // Same lost-claim guard as login: never enter tabs without a session.
      if (!owned && !(await awaitSession())) {
        throw new Error(`${provider === 'google' ? 'Google' : 'GitHub'} sign-in didn't finish. Try again.`);
      }
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? `${provider === 'google' ? 'Google' : 'GitHub'} sign-in failed.`);
    } finally {
      setBusy(false);
    }
  };

  const hasPending = typeof pendingGoal === 'string' && !!pendingGoal.trim();

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

  if (needsConfirmation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas, padding: Spacing.xl, justifyContent: 'center' }}>
        <Card>
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 28, color: t.ink, textAlign: 'center' }}>
            Check your inbox
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: t.inkSoft, textAlign: 'center' }}>
            We sent a confirmation link to {email.trim()}. Tap it, then log in — your first goal will be waiting.
          </Text>
          <View style={{ marginTop: 14 }}>
            <PillButton title="Go to log in" primary onPress={() => router.replace('/(auth)/login')} />
          </View>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <BackdropArt variant="full" />
      <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'center', gap: 14 }}>
        <Animated.View entering={FadeInDown.duration(350)} style={{ alignItems: 'center', gap: 8 }}>
          <BrandMark />
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 32, color: t.ink, textAlign: 'center' }}>
            Join the shipped-it club
          </Text>
          <Text style={{ fontSize: 14, color: t.inkSoft, textAlign: 'center' }}>
            Say a goal. Get a tracker. Prove it daily.
          </Text>
        </Animated.View>

        {hasPending && (
          <Animated.View entering={FadeInDown.duration(350).delay(120)}>
            <View style={{ backgroundColor: Brand.cyanBg, borderWidth: 2, borderColor: t.border, borderRadius: Radii.card, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="flag" size={20} color={Brand.teal} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.teal }}>FIRST UP</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: t.ink }} numberOfLines={2}>
                  {pendingGoal}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(350).delay(200)} style={{ flexDirection: 'row', gap: 10 }}>
          <SocialButton provider="google" label="Google" onPress={() => onProvider('google')} disabled={busy} />
          <SocialButton provider="github" label="GitHub" dark onPress={() => onProvider('github')} disabled={busy} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(280)}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1, height: 2, backgroundColor: t.inputBorder }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: t.inkSoft }}>OR CONTINUE WITH EMAIL</Text>
              <View style={{ flex: 1, height: 2, backgroundColor: t.inputBorder }} />
            </View>
            <View style={{ gap: 10 }}>
              <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={t.inkSoft} accessibilityLabel="Full name" autoComplete="name" returnKeyType="next" style={input} />
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={t.inkSoft} accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" returnKeyType="next" style={input} />
              <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor={t.inkSoft} accessibilityLabel="Password, 8 or more characters" autoComplete="new-password" secureTextEntry returnKeyType="done" onSubmitEditing={onSignup} style={input} />
              {password.length > 0 && password.length < 8 && (
                <Text style={{ color: Brand.amberText, fontSize: 12 }}>Password needs 8 or more characters.</Text>
              )}
              {error && <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>}
              {goalWarning && (
                <Text style={{ color: Brand.amberText, fontSize: 12 }}>Signed in, but your first goal was not queued — recreate it in Chat.</Text>
              )}
              <PillButton title={busy ? 'Creating…' : 'Create account'} primary onPress={onSignup} disabled={busy || !valid} />
              {busy && <ActivityIndicator color={Brand.turquoise} />}
            </View>
          </Card>
        </Animated.View>

        <Link href="/(auth)/login" accessibilityLabel="Go to log in" style={{ textAlign: 'center', color: t.teal, fontWeight: '600', minHeight: Touch.min }}>
          Already have an account? Log in
        </Link>
      </View>
    </SafeAreaView>
  );
}
