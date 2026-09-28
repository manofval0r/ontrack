/** M10–M14 Settings — profile, audio, notifications, integrations, sign out. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../../constants/colors';
import { Spacing, Touch } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Card } from '../../components/ui';
import { api } from '../../lib/api';
import { clearSession } from '../../lib/auth';

export default function Settings() {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tts, setTts] = useState(true);
  const [asr, setAsr] = useState(true);
  const [notifs, setNotifs] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await api.getSettings();
      setSettings(s);
      setTts(s.audio?.tts_enabled ?? true);
      setAsr(s.audio?.asr_enabled ?? true);
      setNotifs(s.notifications?.master_enabled ?? true);
    } catch (e: any) {
      setError(e?.error ?? 'Could not load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (patch: any, revert: () => void) => {
    try {
      await api.updateSettings(patch);
    } catch {
      revert();
      setError('Could not save. Change reverted.');
    }
  };

  const signOut = async () => {
    await clearSession();
    router.replace('/(auth)/login');
  };

  if (loading && !settings) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.grayCanvas }}>
        <View accessibilityRole="progressbar" accessibilityLabel="Loading settings">
          <ActivityIndicator color={Brand.turquoise} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}>
        <Text accessibilityRole="header" style={{ fontFamily: Typography.title.fontFamily, fontSize: Typography.title.fontSize, color: Brand.navy }}>Settings</Text>
        {error && (
          <Card>
            <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>
            <Pressable onPress={load} style={{ marginTop: 8, minHeight: Touch.min, justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel="Retry loading settings">
              <Text style={{ color: Brand.teal, fontWeight: '700' }}>Retry</Text>
            </Pressable>
          </Card>
        )}
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Profile</Text>
          <Text style={{ marginTop: 4, color: Brand.navy }}>
            {settings?.profile?.name ?? 'Not signed in'}
          </Text>
          {!!settings?.profile?.email && (
            <Text style={{ color: Brand.navy, opacity: 0.6 }}>{settings.profile.email}</Text>
          )}
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Audio</Text>
          <Row label="Text-to-speech" hint="Hear coach messages and summaries aloud" value={tts} onChange={(v) => { const prev = tts; setTts(v); save({ audio: { tts_enabled: v } }, () => setTts(prev)); }} />
          <Row label="Voice input" hint="Dictate goals and updates with the microphone" value={asr} onChange={(v) => { const prev = asr; setAsr(v); save({ audio: { asr_enabled: v } }, () => setAsr(prev)); }} />
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Notifications</Text>
          <Row label="Reminders and check-ins" hint="Goal reminders and coach check-in prompts" value={notifs} onChange={(v) => { const prev = notifs; setNotifs(v); save({ notifications: { master_enabled: v } }, () => setNotifs(prev)); }} />
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Integrations</Text>
          {(settings?.integrations ?? []).map((i: any) => (
            <View key={i.id ?? i.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, minHeight: Touch.min }} accessibilityLabel={`${i.name}, ${i.connected ? 'connected' : 'not connected'}`}>
              <Ionicons name={i.connected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={i.connected ? Brand.teal : Brand.navy} accessibilityElementsHidden />
              <Text style={{ color: Brand.navy }}>{i.name}</Text>
            </View>
          ))}
          {(settings?.integrations ?? []).length === 0 && !loading && (
            <Text style={{ marginTop: 4, color: Brand.navy, opacity: 0.6 }}>No integrations yet.</Text>
          )}
        </Card>
        <Pressable
          onPress={signOut}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          accessibilityHint="Signs out and returns to the login screen"
          style={{ alignItems: 'center', paddingVertical: 12, minHeight: Touch.min, justifyContent: 'center' }}
        >
          <Text style={{ color: Brand.amberText, fontWeight: '700' }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, minHeight: Touch.min }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: Brand.navy, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: Brand.navy, opacity: 0.6, fontSize: 12 }}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: Brand.turquoise }}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}
