/** M10–M14 Settings — profile, audio, coach, notifications, focus,
 * integrations (GitHub + Calendar connect), data, about, sign out. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Brand } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { Card } from '../../components/ui';
import { api, request } from '../../lib/api';
import { clearSession, clearProviderToken, getProviderToken, signInWithProvider } from '../../lib/auth';
import { useGoals } from '../../lib/store';

const CALENDAR_SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export default function Settings() {
  const { connected } = useLocalSearchParams<{ connected?: string }>();
  const { goals, dashboard } = useGoals();
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tts, setTts] = useState(true);
  const [asr, setAsr] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [quiet, setQuiet] = useState(false);
  const [cadence, setCadence] = useState('30min');
  const [busyProvider, setBusyProvider] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await api.getSettings();
      setSettings(s);
      setTts(s.audio?.tts_enabled ?? true);
      setAsr(s.audio?.asr_enabled ?? true);
      setAutoplay(!!s.audio?.tts_autoplay);
      setNotifs(s.notifications?.master_enabled ?? true);
      setQuiet(!!s.notifications?.quiet_hours?.enabled);
      setCadence(s.notifications?.checkin_cadence ?? '30min');
    } catch (e: any) {
      setError(e?.error ?? 'Could not load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (typeof connected === 'string' && connected) {
      setNotice(`${connected === 'google-cal' ? 'Google Calendar' : connected} connected.`);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const save = async (patch: any, revert: () => void) => {
    try {
      await api.updateSettings(patch);
    } catch {
      revert();
      setError('Could not save. Change reverted.');
    }
  };

  const connectProvider = async (provider: 'github' | 'google-cal') => {
    try {
      setBusyProvider(provider);
      setError(null);
      setNotice(null);
      const { providerToken } = await signInWithProvider(provider === 'google-cal' ? 'google' : 'github', {
        mode: provider,
        scopes: provider === 'google-cal' ? CALENDAR_SCOPES : undefined,
      });
      // Warm path: vault the provider token now (auth.tsx covers cold paths).
      const vaultToken = providerToken ?? (await getProviderToken(provider));
      if (!vaultToken) {
        throw new Error('Connected, but no provider token came back. Try again.');
      }
      await request('/api/integrations', {
        method: 'POST',
        body: JSON.stringify({ provider, access_token: vaultToken, meta: { via: 'supabase-oauth' } }),
      });
      await load();
      setNotice(`${provider === 'google-cal' ? 'Google Calendar' : 'GitHub'} connected.`);
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? 'Connection cancelled.');
    } finally {
      setBusyProvider(null);
    }
  };

  const disconnect = async (row: any) => {
    if (!row?.id) return;
    try {
      setBusyProvider(row.id);
      await api.deleteIntegration(String(row.id));
      const key = row.id === 'github' ? 'github' : row.provider === 'google-cal' ? 'google-cal' : row.id;
      await clearProviderToken(key);
      await load();
      setNotice(`${row.name ?? 'Integration'} disconnected.`);
    } catch (e: any) {
      setError(e?.error ?? 'Could not disconnect.');
    } finally {
      setBusyProvider(null);
    }
  };

  const openDetail = (row: any, fallback: string) => {
    const p = row?.id === 'google-cal' || row?.provider === 'google-cal' ? 'google-cal' : fallback;
    router.push({ pathname: '/integration/[provider]', params: { provider: p } } as any);
  };

  const exportData = async () => {
    try {
      const payload = JSON.stringify({ goals, dashboard, exported_at: new Date().toISOString() }, null, 2);
      await Share.share({ message: payload, title: 'OnTrack export' });
    } catch {
      setError('Export failed.');
    }
  };

  const signOut = async () => {
    Alert.alert('Sign out?', 'Your goals stay synced to your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await clearSession(); router.replace('/(auth)/login'); } },
    ]);
  };

  const active = goals.filter((g) => g.status === 'active').length;
  const done = goals.filter((g) => g.status !== 'active').length;
  const streak = dashboard?.streak_days ?? 0;
  const integrations: any[] = settings?.integrations ?? [];
  const github = integrations.find((i) => i.id === 'github');
  const gcal = integrations.find((i) => i.id === 'google-cal' || i.provider === 'google-cal');

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
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 130 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FontFamily.expressive, fontSize: 30, color: Brand.navy }}>Settings</Text>
        {error && (
          <Card>
            <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>
            <Pressable onPress={load} style={{ marginTop: 8, minHeight: Touch.min, justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel="Retry loading settings">
              <Text style={{ color: Brand.teal, fontWeight: '700' }}>Retry</Text>
            </Pressable>
          </Card>
        )}
        {notice && (
          <Card>
            <Text accessibilityLiveRegion="polite" style={{ color: Brand.teal, fontSize: 13, fontWeight: '600' }}>{notice}</Text>
          </Card>
        )}

        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Profile</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Stat value={String(goals.length)} label="goals" />
            <Stat value={String(done)} label="shipped" />
            <Stat value={String(streak)} label="streak" />
          </View>
          <Text style={{ marginTop: 8, color: Brand.navy, fontWeight: '600' }}>
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
          <Row label="Auto-play coach voice" hint="Read every AI reply aloud in chat" value={autoplay} onChange={(v) => { const prev = autoplay; setAutoplay(v); save({ audio: { tts_autoplay: v } }, () => setAutoplay(prev)); }} />
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Coach</Text>
          <Text style={{ fontSize: 12, color: Brand.navy, opacity: 0.6, marginTop: 4 }}>Check-in cadence</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {['off', '30min', '1hour'].map((c) => (
              <Pressable
                key={c}
                onPress={() => { const prev = cadence; setCadence(c); save({ notifications: { checkin_cadence: c } }, () => setCadence(prev)); }}
                accessibilityLabel={`Check-ins ${c}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: cadence === c }}
                style={{
                  flex: 1, minHeight: Touch.min, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.pill,
                  backgroundColor: cadence === c ? Brand.turquoise : Brand.white,
                }}
              >
                <Text style={{ fontWeight: '700', color: Brand.navy, fontSize: 13 }}>{c === 'off' ? 'Off' : c === '30min' ? '30 min' : '1 hour'}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Notifications</Text>
          <Row label="Reminders and check-ins" hint="Goal reminders and coach check-in prompts" value={notifs} onChange={(v) => { const prev = notifs; setNotifs(v); save({ notifications: { master_enabled: v } }, () => setNotifs(prev)); }} />
          <Row label="Quiet hours (10pm–7am)" hint="No nudges overnight" value={quiet} onChange={(v) => { const prev = quiet; setQuiet(v); save({ notifications: { quiet_hours: { enabled: v, start: '22:00', end: '07:00' } } }, () => setQuiet(prev)); }} />
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Focus & blocking</Text>
          <Text style={{ fontSize: 13, color: Brand.navy, opacity: 0.7, marginTop: 4 }}>
            Android app limits arrive with the next build — timers work today.
          </Text>
          <Pressable
            onPress={() => router.push('/work-block')}
            accessibilityLabel="Open work-block timer"
            accessibilityRole="button"
            style={{ marginTop: 10, minHeight: Touch.min, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.pill, backgroundColor: Brand.navy }}
          >
            <Text style={{ color: Brand.white, fontWeight: '700' }}>Open focus timer</Text>
          </Pressable>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Integrations</Text>
          <IntegrationRow
            name="GitHub"
            hint="Verify commits against checklist goals"
            row={github}
            busy={busyProvider === 'github'}
            onConnect={() => connectProvider('github')}
            onDisconnect={() => disconnect(github)}
            onManage={() => openDetail(github, 'github')}
          />
          <IntegrationRow
            name="Google Calendar"
            hint="Sync deadlines and check-in nudges"
            row={gcal}
            busy={busyProvider === 'google-cal'}
            onConnect={() => connectProvider('google-cal')}
            onDisconnect={() => disconnect(gcal)}
            onManage={() => openDetail(gcal, 'google-cal')}
          />
          <Text style={{ fontSize: 12, color: Brand.navy, opacity: 0.6, marginTop: 8 }}>
            Slack and Notion connect on web — mobile shows their status here.
          </Text>
          {integrations.filter((i) => i.id !== 'github' && i.id !== 'google-cal' && i.provider !== 'google-cal').map((i: any) => (
            <View key={i.id ?? i.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }} accessibilityLabel={`${i.name}, ${i.connected ? 'connected' : 'not connected'}`}>
              <Ionicons name={i.connected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={i.connected ? Brand.teal : Brand.navy} accessibilityElementsHidden />
              <Text style={{ color: Brand.navy }}>{i.name}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Data</Text>
          <Pressable
            onPress={exportData}
            accessibilityLabel="Export my data"
            accessibilityRole="button"
            style={{ marginTop: 8, minHeight: Touch.min, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Ionicons name="share-outline" size={20} color={Brand.teal} />
            <Text style={{ color: Brand.navy, fontWeight: '600' }}>Export goals as JSON</Text>
          </Pressable>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>About</Text>
          <Text style={{ fontSize: 13, color: Brand.navy, opacity: 0.7, marginTop: 4 }}>
            OnTrack {Constants.expoConfig?.version ?? '1.0.0'} · SDK 57 · {active} active goals
          </Text>
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

function IntegrationRow({ name, hint, row, busy, onConnect, onDisconnect, onManage }: {
  name: string;
  hint: string;
  row: any;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onManage: () => void;
}) {
  const connected = !!row?.connected;
  return (
    <View style={{ marginTop: 10, borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.input, padding: Spacing.md, backgroundColor: Brand.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={connected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={connected ? Brand.teal : Brand.navy} accessibilityElementsHidden />
        <View style={{ flex: 1 }} accessibilityLabel={`${name}, ${connected ? 'connected' : 'not connected'}`}>
          <Text style={{ color: Brand.navy, fontWeight: '700' }}>{name}</Text>
          <Text style={{ color: Brand.navy, opacity: 0.6, fontSize: 12 }}>{hint}</Text>
          {!!row?.status_label && (
            <Text style={{ color: Brand.teal, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{row.status_label}</Text>
          )}
        </View>
        <Pressable
          onPress={onManage}
          accessibilityLabel={`Manage ${name}`}
          accessibilityRole="button"
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="chevron-forward" size={22} color={Brand.navy} />
        </Pressable>
      </View>
      <Pressable
        onPress={connected ? onDisconnect : onConnect}
        disabled={busy}
        accessibilityLabel={connected ? `Disconnect ${name}` : `Connect ${name}`}
        accessibilityRole="button"
        style={{
          marginTop: 10, minHeight: Touch.min, alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.pill,
          backgroundColor: connected ? Brand.white : Brand.navy, opacity: busy ? 0.5 : 1,
        }}
      >
        <Text style={{ fontWeight: '700', color: connected ? Brand.navy : Brand.white }}>
          {busy ? 'Working…' : connected ? 'Disconnect' : 'Connect'}
        </Text>
      </Pressable>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: Brand.grayCanvas, borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.input, paddingVertical: 10, alignItems: 'center' }} accessibilityLabel={`${value} ${label}`}>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: Brand.navy }}>{value}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.teal, marginTop: 2 }}>{label}</Text>
    </View>
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
