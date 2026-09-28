/** M3 Sign up — full-screen; consumes pendingGoal from goal-first onboarding. */
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Card, PillButton } from '../../components/ui';
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

  const afterAuth = async () => {
    // Pending-goal handoff: create the onboarding draft on the shared backend.
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
      await signUpWithEmail(name.trim(), email.trim(), password);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl, justifyContent: 'center' }}>
      <Card>
        <Text style={{ fontFamily: Typography.title.fontFamily, fontSize: Typography.title.fontSize, color: Brand.navy }}>Create your account</Text>
        {typeof pendingGoal === 'string' && !!pendingGoal && (
          <Text style={{ marginTop: 6, fontSize: 13, color: Brand.teal }}>First goal queued: “{pendingGoal}”</Text>
        )}
        <View style={{ marginTop: Spacing.md, gap: 10 }}>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" accessibilityLabel="Full name" autoComplete="name" returnKeyType="next" style={input} />
          <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" returnKeyType="next" style={input} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" accessibilityLabel="Password, 8 or more characters" autoComplete="new-password" secureTextEntry returnKeyType="done" onSubmitEditing={onSignup} style={input} />
          {password.length > 0 && password.length < 8 && (
            <Text style={{ color: Brand.amberText, fontSize: 12 }}>Password needs 8 or more characters.</Text>
          )}
          {error && <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>}
          {goalWarning && (
            <Text style={{ color: Brand.amberText, fontSize: 12 }}>Signed in, but your first goal was not queued — recreate it in Chat.</Text>
          )}
          <PillButton title={busy ? 'Creating…' : 'Create account'} primary onPress={onSignup} disabled={busy || !valid} />
          {busy && <ActivityIndicator color={Brand.turquoise} />}
          <PillButton title="Continue with Google" onPress={() => onProvider('google')} disabled={busy} />
          <PillButton title="Continue with GitHub" onPress={() => onProvider('github')} disabled={busy} />
        </View>
      </Card>
      <Link href="/(auth)/login" accessibilityLabel="Go to log in" style={{ marginTop: Spacing.lg, textAlign: 'center', color: Brand.teal, fontWeight: '600', minHeight: Touch.min }}>
        Already have an account? Log in
      </Link>
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
