/** M3 Sign up — hero header, social-first, pending-goal chip, staggered motion. */
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Brand, Colors } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { BrandMark, Card, PillButton, SocialButton } from '../../components/ui';
import { BackdropArt } from '../../components/BackdropArt';
import { signInWithProvider, signUpWithEmail } from '../../lib/auth';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';

export default function Signup() {
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
    try {
      await refresh();
    } catch {
      setGoalWarning(true);
    }
    router.replace('/(tabs)');
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
      await signInWithProvider(provider);
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? `${provider === 'google' ? 'Google' : 'GitHub'} sign-in failed.`);
    } finally {
      setBusy(false);
    }
  };

  const hasPending = typeof pendingGoal === 'string' && !!pendingGoal.trim();

  if (needsConfirmation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl, justifyContent: 'center' }}>
        <Card>
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 28, color: Brand.navy, textAlign: 'center' }}>
            Check your inbox
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: Brand.navy, opacity: 0.7, textAlign: 'center' }}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <BackdropArt variant="full" />
      <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'center', gap: 14 }}>
        <Animated.View entering={FadeInDown.duration(350)} style={{ alignItems: 'center', gap: 8 }}>
          <BrandMark />
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 32, color: Brand.navy, textAlign: 'center' }}>
            Join the shipped-it club
          </Text>
          <Text style={{ fontSize: 14, color: Brand.navy, opacity: 0.65, textAlign: 'center' }}>
            Say a goal. Get a tracker. Prove it daily.
          </Text>
        </Animated.View>

        {hasPending && (
          <Animated.View entering={FadeInDown.duration(350).delay(120)}>
            <View style={{ backgroundColor: Brand.cyanBg, borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.card, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="flag" size={20} color={Brand.teal} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Brand.teal }}>FIRST UP</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Brand.navy }} numberOfLines={2}>
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
              <View style={{ flex: 1, height: 2, backgroundColor: Colors.light.inputBorder }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.navy, opacity: 0.6 }}>OR CONTINUE WITH EMAIL</Text>
              <View style={{ flex: 1, height: 2, backgroundColor: Colors.light.inputBorder }} />
            </View>
            <View style={{ gap: 10 }}>
              <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Brand.placeholder} accessibilityLabel="Full name" autoComplete="name" returnKeyType="next" style={input} />
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={Brand.placeholder} accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" returnKeyType="next" style={input} />
              <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor={Brand.placeholder} accessibilityLabel="Password, 8 or more characters" autoComplete="new-password" secureTextEntry returnKeyType="done" onSubmitEditing={onSignup} style={input} />
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

        <Link href="/(auth)/login" accessibilityLabel="Go to log in" style={{ textAlign: 'center', color: Brand.teal, fontWeight: '600', minHeight: Touch.min }}>
          Already have an account? Log in
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
