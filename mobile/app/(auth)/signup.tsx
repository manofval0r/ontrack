/** M3 Signup — full-screen; consumes pendingGoal from goal-first onboarding. */
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Radii, Spacing } from '../../constants/spacing';
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
  const [busy, setBusy] = useState(false);

  const afterAuth = async () => {
    // Pending-goal handoff: create the onboarding draft on the shared backend.
    if (typeof pendingGoal === 'string' && pendingGoal.trim()) {
      try {
        await api.createGoal(pendingGoal.trim());
      } catch {}
    }
    await refresh().catch(() => {});
    router.replace('/(tabs)');
  };

  const onSignup = async () => {
    try {
      setBusy(true);
      setError(null);
      await signUpWithEmail(name.trim(), email.trim(), password);
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? 'Signup failed.');
    } finally {
      setBusy(false);
    }
  };

  const onProvider = async (provider: 'google' | 'github') => {
    try {
      setBusy(true);
      setError(null);
      await signInWithProvider(provider);
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? `${provider} sign-in failed.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl, justifyContent: 'center' }}>
      <Card>
        <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Brand.navy }}>Create your account</Text>
        {typeof pendingGoal === 'string' && !!pendingGoal && (
          <Text style={{ marginTop: 6, fontSize: 13, color: Brand.teal }}>First goal queued: “{pendingGoal}”</Text>
        )}
        <View style={{ marginTop: 12, gap: 10 }}>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" style={input} />
          <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={input} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ chars)" secureTextEntry style={input} />
          {error && <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>}
          <PillButton title={busy ? 'Creating…' : 'Create account'} primary onPress={onSignup} disabled={busy} />
          <PillButton title="Continue with Google" onPress={() => onProvider('google')} disabled={busy} />
          <PillButton title="Continue with GitHub" onPress={() => onProvider('github')} disabled={busy} />
        </View>
      </Card>
      <Link href="/(auth)/login" style={{ marginTop: 16, textAlign: 'center', color: Brand.teal, fontWeight: '600' }}>
        Already have an account? Log in
      </Link>
    </SafeAreaView>
  );
}

const input = {
  borderWidth: 2,
  borderColor: 'rgba(7,30,45,0.2)',
  borderRadius: Radii.input,
  padding: Spacing.md,
  fontSize: 15,
  backgroundColor: '#fff',
} as const;
