/** M10–M14 Settings — profile, audio, check-ins, notifications, focus,
 * integrations (GitHub + Calendar connect), data, about, sign out. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Brand } from '../../constants/colors';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { Card } from '../../components/ui';
import { BackdropArt } from '../../components/BackdropArt';
import { rescheduleReminders, requestReminderPermission } from '../../lib/reminders';
import { updateInfo, useAppUpdate } from '../../lib/updates';
import { api, request } from '../../lib/api';
import { clearSession, clearProviderToken, getProviderToken, signInWithProvider } from '../../lib/auth';
import { useGoals } from '../../lib/store';
import { useReduceMotion } from '../../lib/useReduceMotion';

const CALENDAR_SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const THEMES: Array<{ key: 'light' | 'dark' | 'teal'; label: string; glow: string; preview: { bg: string; card: string; dot: string } }> = [
  { key: 'light', label: 'Light', glow: '#D8F7F3', preview: { bg: '#F8FAFB', card: '#FFFFFF', dot: '#00C4B3' } },
  { key: 'dark', label: 'Dark', glow: '#0E3A4A', preview: { bg: '#030D16', card: '#082032', dot: '#00C4B3' } },
  { key: 'teal', label: 'Teal', glow: '#B9EBDF', preview: { bg: '#DFF5EF', card: '#FFFFFF', dot: '#006D6A' } },
];

export default function Settings() {
  const t = useTheme();
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
  const update = useAppUpdate();
  const ota = updateInfo();

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

  // Passive alarm refresh: new goals / deadlines refresh the schedule without
  // ever prompting (permission prompts only come from explicit toggles).
  useEffect(() => {
    if (!settings || !notifs || goals.length === 0) return;
    rescheduleReminders({ master: true, cadence, quiet, goals }, false).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals]);

  const save = async (patch: any, revert: () => void) => {
    try {
      await api.updateSettings(patch);
      return true;
    } catch {
      revert();
      setError('Could not save. Change reverted.');
      return false;
    }
  };

  const syncReminders = async (next?: { master?: boolean; cadence?: string; quiet?: boolean }) => {
    const master = next?.master ?? notifs;
    const cad = next?.cadence ?? cadence;
    const q = next?.quiet ?? quiet;
    try {
      const n = await rescheduleReminders({ master, cadence: cad, quiet: q, goals });
      if (master && n === 0) {
        setNotice('Reminders are on, but notification permission is missing — enable it in system settings.');
      }
    } catch {
      // Alarms are best-effort; the settings save already succeeded.
    }
  };

  const connectProvider = async (provider: 'github' | 'google-cal') => {
    try {
      setBusyProvider(provider);
      setError(null);
      setNotice(null);
      const { providerToken, owned } = await signInWithProvider(provider === 'google-cal' ? 'google' : 'github', {
        mode: provider,
        scopes: provider === 'google-cal' ? CALENDAR_SCOPES : undefined,
      });
      if (!owned) {
        // The cold-start receiver (app/auth.tsx) claimed this redirect and
        // owns the connect — it routes back here with ?connected=. Just reload.
        await load();
        return;
      }
      // Warm path: vault the provider token now (auth.tsx covers cold paths).
      const vaultToken = providerToken ?? (await getProviderToken(provider));
      if (!vaultToken) {
        throw new Error('Connected, but no provider token came back. Try again.');
      }
      try {
        await request('/api/integrations', {
          method: 'POST',
          body: JSON.stringify({ provider, access_token: vaultToken, meta: { via: 'supabase-oauth' } }),
        });
      } catch (e: any) {
        // The cold path may have connected it a moment ago — confirm state
        // instead of failing a success.
        if (!/already|exists|duplicate|409/i.test(String(e?.message ?? e?.error ?? e))) throw e;
      }
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
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.canvas }}>
        <View accessibilityRole="progressbar" accessibilityLabel="Loading settings">
          <ActivityIndicator color={Brand.turquoise} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 130 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FontFamily.expressive, fontSize: 36, color: t.ink }}>Settings</Text>
        {(!!error || !!notice) && (
          <StatusBanner
            kind={error ? (isAuthError(error) ? 'auth' : 'offline') : 'notice'}
            message={error ?? notice ?? ''}
            onRetry={error ? load : undefined}
            onDismissNotice={!error && notice ? () => setNotice(null) : undefined}
          />
        )}

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Profile</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Stat value={String(goals.length)} label="goals" />
            <Stat value={String(done)} label="shipped" />
            <Stat value={String(streak)} label="streak" />
          </View>
          <Text style={{ marginTop: 8, color: t.ink, fontWeight: '600' }}>
            {settings?.profile?.name ?? 'Not signed in'}
          </Text>
          {!!settings?.profile?.email && (
            <Text style={{ color: t.inkSoft }}>{settings.profile.email}</Text>
          )}
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Audio</Text>
          <Row label="Text-to-speech" hint="Hear chat messages and summaries aloud" value={tts} onChange={(v) => { const prev = tts; setTts(v); save({ audio: { tts_enabled: v } }, () => setTts(prev)); }} />
          <Row label="Voice input" hint="Dictate goals and updates with the microphone" value={asr} onChange={(v) => { const prev = asr; setAsr(v); save({ audio: { asr_enabled: v } }, () => setAsr(prev)); }} />
          <Row label="Auto-play voice replies" hint="Read every AI reply aloud in chat" value={autoplay} onChange={(v) => { const prev = autoplay; setAutoplay(v); save({ audio: { tts_autoplay: v } }, () => setAutoplay(prev)); }} />
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Check-ins</Text>
          <Text style={{ fontSize: 12, color: t.inkSoft, marginTop: 4 }}>Check-in cadence</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {['off', '30min', '1hour'].map((c) => (
              <Pressable
                key={c}
                onPress={async () => { const prev = cadence; setCadence(c); const ok = await save({ notifications: { checkin_cadence: c } }, () => setCadence(prev)); if (ok) syncReminders({ cadence: c }); }}
                accessibilityLabel={`Check-ins ${c}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: cadence === c }}
                style={{
                  flex: 1, minHeight: Touch.min, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: t.border, borderRadius: Radii.pill,
                  backgroundColor: cadence === c ? Brand.turquoise : t.surface,
                }}
              >
                <Text style={{ fontWeight: '700', color: t.ink, fontSize: 13 }}>{c === 'off' ? 'Off' : c === '30min' ? '30 min' : '1 hour'}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Notifications</Text>
          <Row label="Reminders and check-ins" hint="Goal reminders and check-in prompts" value={notifs} onChange={async (v) => {
            const prev = notifs;
            if (v) {
              const granted = await requestReminderPermission().catch(() => false);
              if (!granted) {
                setError('Notifications need system permission — enable it, then try again.');
                return;
              }
            }
            setNotifs(v);
            const ok = await save({ notifications: { master_enabled: v } }, () => setNotifs(prev));
            if (ok) syncReminders({ master: v });
          }} />
          <Row label="Quiet hours (10pm–7am)" hint="No nudges overnight" value={quiet} onChange={async (v) => { const prev = quiet; setQuiet(v); const ok = await save({ notifications: { quiet_hours: { enabled: v, start: '22:00', end: '07:00' } } }, () => setQuiet(prev)); if (ok) syncReminders({ quiet: v }); }} />
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Focus & blocking</Text>
          <Text style={{ fontSize: 13, color: t.inkSoft, marginTop: 4 }}>
            Android app limits arrive with the next build — timers work today.
          </Text>
          <Pressable
            onPress={() => router.push('/work-block')}
            accessibilityLabel="Open work-block timer"
            accessibilityRole="button"
            style={{ marginTop: 10, minHeight: Touch.min, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: t.border, borderRadius: Radii.pill, backgroundColor: t.primary }}
          >
            <Text style={{ color: t.primaryInk, fontWeight: '700' }}>Open focus timer</Text>
          </Pressable>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Integrations</Text>
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
          <Text style={{ fontSize: 12, color: t.inkSoft, marginTop: 8 }}>
            Slack and Notion connect on web — mobile shows their status here.
          </Text>
          {integrations.filter((i) => i.id !== 'github' && i.id !== 'google-cal' && i.provider !== 'google-cal').map((i: any) => (
            <View key={i.id ?? i.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }} accessibilityLabel={`${i.name}, ${i.connected ? 'connected' : 'not connected'}`}>
              <Ionicons name={i.connected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={i.connected ? Brand.teal : Brand.navy} accessibilityElementsHidden />
              <Text style={{ color: t.ink }}>{i.name}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Data</Text>
          <Pressable
            onPress={exportData}
            accessibilityLabel="Export my data"
            accessibilityRole="button"
            style={{ marginTop: 8, minHeight: Touch.min, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Ionicons name="share-outline" size={20} color={Brand.teal} />
            <Text style={{ color: t.ink, fontWeight: '600' }}>Export goals as JSON</Text>
          </Pressable>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>About</Text>
          <Text style={{ fontSize: 13, color: t.inkSoft, marginTop: 4 }}>
            OnTrack {Constants.expoConfig?.version ?? '1.0.0'} · SDK 57 · {active} active goals
          </Text>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>Theme</Text>
          <Text style={{ fontSize: 12, color: t.inkSoft, marginTop: 4 }}>
            Light, dark, or full teal harmony — or just tell chat.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {THEMES.map((th) => {
              const selected = t.theme === th.key;
              return (
                <Pressable
                  key={th.key}
                  onPress={() => t.setTheme(th.key)}
                  accessibilityLabel={`${th.label} theme`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderWidth: selected ? 3 : 2,
                    borderColor: selected ? Brand.turquoise : t.border,
                    borderRadius: Radii.input,
                    backgroundColor: selected ? th.glow : t.surface,
                    paddingVertical: 10,
                    alignItems: 'center',
                    gap: 8,
                    minHeight: Touch.min,
                    justifyContent: 'center',
                    shadowColor: selected ? Brand.turquoise : t.shadow,
                    shadowOffset: { width: selected ? 4 : 2, height: selected ? 4 : 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: selected ? 4 : 2,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <View
                    accessibilityElementsHidden
                    style={{
                      width: '70%',
                      borderRadius: 8,
                      overflow: 'hidden',
                      borderWidth: 1.5,
                      borderColor: t.border,
                      backgroundColor: th.preview.bg,
                    }}
                  >
                    <View style={{ height: 8, backgroundColor: th.preview.bg }} />
                    <View style={{ flexDirection: 'row', gap: 3, padding: 4, backgroundColor: th.preview.bg }}>
                      <View style={{ flex: 1, height: 12, borderRadius: 4, backgroundColor: th.preview.card, borderWidth: 1, borderColor: t.border }} />
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: th.preview.dot }} />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {selected && (
                      <Animated.View entering={FadeInDown.duration(180)}>
                        <Ionicons name="checkmark-circle" size={14} color={selected ? Brand.navy : t.teal} />
                      </Animated.View>
                    )}
                    <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? Brand.navy : t.ink }}>
                      {th.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>App updates</Text>
          <Text style={{ fontSize: 12, color: t.inkSoft, marginTop: 4 }}>
            Channel {ota.channel} · Runtime {ota.runtime}
            {ota.updateId ? ` · Build ${ota.updateId.slice(0, 8)}` : ''}
          </Text>
          <Pressable
            onPress={update.check}
            disabled={update.checking || update.downloading}
            accessibilityLabel={
              update.downloading
                ? `Downloading update, ${Math.round(Math.min(update.progress, 100))} percent`
                : update.pending
                  ? 'Restart to apply downloaded update'
                  : 'Check for app updates'
            }
            accessibilityRole="button"
            style={{
              marginTop: 10, minHeight: Touch.min, flexDirection: 'row', alignItems: 'center',
              justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: t.border,
              borderRadius: Radii.pill, backgroundColor: t.primary,
              opacity: update.checking || update.downloading ? 0.6 : 1,
            }}
          >
            {(update.checking || update.downloading) && (
              <ActivityIndicator size="small" color={Brand.white} />
            )}
            <Text style={{ color: t.primaryInk, fontWeight: '700' }}>
              {update.downloading
                ? `Downloading ${Math.round(Math.min(update.progress, 100))}%`
                : update.pending
                  ? 'Restart to apply update'
                  : update.checking
                    ? 'Checking…'
                    : 'Check for app updates'}
            </Text>
          </Pressable>
          {update.downloading && !update.hidden && (
            <View style={{ marginTop: 10 }}>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: t.inputTrack, borderWidth: 1, borderColor: t.border, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 3, backgroundColor: Brand.turquoise, width: `${Math.min(update.progress, 100)}%` }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <Text style={{ fontSize: 11, color: t.inkSoft }}>
                  The app restarts automatically when the download completes.
                </Text>
                <Pressable onPress={() => update.setHidden(true)} accessibilityLabel="Hide download progress" accessibilityRole="button" hitSlop={8}>
                  <Text style={{ fontSize: 11, color: t.teal, textDecorationLine: 'underline' }}>Hide</Text>
                </Pressable>
              </View>
            </View>
          )}
          {update.downloading && update.hidden && (
            <Pressable onPress={() => update.setHidden(false)} accessibilityLabel="Show download progress" accessibilityRole="button" style={{ marginTop: 8, alignItems: 'center', minHeight: Touch.min, justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, color: t.teal, fontWeight: '600' }}>Show download progress</Text>
            </Pressable>
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

function IntegrationRow({ name, hint, row, busy, onConnect, onDisconnect, onManage }: {
  name: string;
  hint: string;
  row: any;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onManage: () => void;
}) {
  const t = useTheme();
  const connected = !!row?.connected;
  return (
    <View style={{ marginTop: 10, borderWidth: 2, borderColor: t.border, borderRadius: Radii.input, padding: Spacing.md, backgroundColor: t.surface }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={connected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={connected ? Brand.teal : Brand.navy} accessibilityElementsHidden />
        <View style={{ flex: 1 }} accessibilityLabel={`${name}, ${connected ? 'connected' : 'not connected'}`}>
          <Text style={{ color: t.ink, fontWeight: '700' }}>{name}</Text>
          <Text style={{ color: t.inkSoft, fontSize: 12 }}>{hint}</Text>
          {!!row?.status_label && (
            <Text style={{ color: t.teal, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{row.status_label}</Text>
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
          borderWidth: 2, borderColor: t.border, borderRadius: Radii.pill,
          backgroundColor: connected ? t.surface : t.primary, opacity: busy ? 0.5 : 1,
        }}
      >
        <Text style={{ fontWeight: '700', color: connected ? t.ink : t.primaryInk }}>
          {busy ? 'Working…' : connected ? 'Disconnect' : 'Connect'}
        </Text>
      </Pressable>
    </View>
  );
}

/** Slim persistent status banner — replaces the old full-size error/notice
 * cards. Red = session/auth failure, amber = offline/network, teal = notice.
 * Errors stay until fixed (retry included); notices dismiss with X. */
function isAuthError(msg: string): boolean {
  return /session expired|log ?in again|unauthorized|401|auth/i.test(msg);
}

function StatusBanner({
  kind,
  message,
  onRetry,
  onDismissNotice,
}: {
  kind: 'auth' | 'offline' | 'notice';
  message: string;
  onRetry?: () => void;
  onDismissNotice?: () => void;
}) {
  const t = useTheme();
  const conf = {
    auth: { bg: '#FDECEC', border: '#DC2626', ink: '#7F1D1D', icon: 'lock-closed' as const, label: 'Sign-in needed' },
    offline: { bg: '#FFF7E0', border: '#B45309', ink: '#78350F', icon: 'cloud-offline' as const, label: 'Connection issue' },
    notice: { bg: '#E6FFFB', border: '#006D6A', ink: '#06302B', icon: 'checkmark-circle' as const, label: 'Notice' },
  }[kind];
  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={`${conf.label}: ${message}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: conf.bg,
        borderWidth: 2,
        borderColor: conf.border,
        borderRadius: Radii.input,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      <Ionicons name={conf.icon} size={18} color={conf.ink} />
      <Text accessibilityLiveRegion="polite" style={{ flex: 1, fontSize: 12, fontWeight: '600', color: conf.ink }} numberOfLines={2}>
        {message}
      </Text>
      {onRetry && (
        <Pressable onPress={onRetry} accessibilityLabel="Retry" accessibilityRole="button" hitSlop={8} style={{ paddingHorizontal: 6, minHeight: 32, justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: conf.ink }}>Retry</Text>
        </Pressable>
      )}
      {onDismissNotice && (
        <Pressable onPress={onDismissNotice} accessibilityLabel="Dismiss notice" accessibilityRole="button" hitSlop={10} style={{ minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={16} color={conf.ink} />
        </Pressable>
      )}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.surface2, borderWidth: 2, borderColor: t.border, borderRadius: Radii.input, paddingVertical: 10, alignItems: 'center' }} accessibilityLabel={`${value} ${label}`}>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: t.ink }}>{value}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: t.teal, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function Row({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, minHeight: Touch.min }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.ink, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: t.inkSoft, fontSize: 12 }}>{hint}</Text>
      </View>
      <Toggle value={value} onChange={onChange} label={label} />
    </View>
  );
}

/** Tactile toggle — thumb slides on the UI thread, track crossfades.
 * press: 0.97 scale · toggle: 180ms ease-out · instant under reduced motion. */
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const slide = useSharedValue(value ? 1 : 0);
  const INTRO = { duration: 180, easing: Easing.bezier(0.23, 1, 0.32, 1) } as const;
  useEffect(() => {
    slide.value = reduce ? (value ? 1 : 0) : withTiming(value ? 1 : 0, INTRO);
  }, [value, reduce, slide]);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slide.value * 20 }],
    backgroundColor: slide.value > 0.5 ? Brand.turquoise : t.surface,
  }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: slide.value > 0.5 ? Brand.turquoise : t.inputTrack,
  }));
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Animated.View
        style={[{
          width: 52,
          height: 32,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: t.border,
          justifyContent: 'center',
          paddingHorizontal: 2,
        }, trackStyle]}
      >
        <Animated.View
          style={[{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: t.border,
          }, thumbStyle]}
        />
      </Animated.View>
    </Pressable>
  );
}
