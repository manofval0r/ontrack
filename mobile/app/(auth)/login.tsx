/** M4 Login — email + Google (Supabase), biometric prompt hook left for device. */
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Radii, Spacing } from '../../constants/spacing';
import { Card, PillButton } from '../../components/ui';
import { signInWithEmail, signInWithProvider } from '../../lib/auth';
import { useGoals } from '../../lib/store';

export default function Login() {
  const { refresh } = useGoals();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const afterAuth = async () => {
    await refresh().catch(() => {});
    router.replace('/(tabs)');
  };

  const onEmail = async () => {
    try {
      setBusy(true);
      setError(null);
      await signInWithEmail(email.trim(), password);
      await afterAuth();
    } catch (e: any) {
      setError(e.message ?? 'Login failed.');
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
        <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Brand.navy }}>Log in</Text>
        <View style={{ marginTop: 12, gap: 10 }}>
          <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={input} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={input} />
          {error && <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>}
          <PillButton title={busy ? 'Logging in…' : 'Log in'} primary onPress={onEmail} disabled={busy} />
          <PillButton title="Continue with Google" onPress={() => onProvider('google')} disabled={busy} />
          <PillButton title="Continue with GitHub" onPress={() => onProvider('github')} disabled={busy} />
        </View>
      </Card>
      <Link href="/(auth)/signup" style={{ marginTop: 16, textAlign: 'center', color: Brand.teal, fontWeight: '600' }}>
        No account? Sign up
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
