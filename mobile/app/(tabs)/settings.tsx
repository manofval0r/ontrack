/** M10–M14 Settings — profile, audio, notifications, integrations, sign out. */
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Card } from '../../components/ui';
import { api } from '../../lib/api';
import { clearSession } from '../../lib/auth';

export default function Settings() {
  const [settings, setSettings] = useState<any | null>(null);
  const [tts, setTts] = useState(true);
  const [asr, setAsr] = useState(true);
  const [notifs, setNotifs] = useState(true);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        setSettings(s);
        setTts(s.audio?.tts_enabled ?? true);
        setAsr(s.audio?.asr_enabled ?? true);
        setNotifs(s.notifications?.master_enabled ?? true);
      })
      .catch(() => {});
  }, []);

  const save = (patch: any) => api.updateSettings(patch).catch(() => {});

  const signOut = async () => {
    await clearSession();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}>
        <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Brand.navy }}>Settings</Text>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Profile</Text>
          <Text style={{ marginTop: 4, color: Brand.navy }}>
            {settings?.profile?.name ?? 'OnTrack user'}
          </Text>
          <Text style={{ color: Brand.navy, opacity: 0.6 }}>{settings?.profile?.email ?? ''}</Text>
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Audio</Text>
          <Row label="Text-to-speech" value={tts} onChange={(v) => { setTts(v); save({ audio: { tts_enabled: v } }); }} />
          <Row label="Voice input" value={asr} onChange={(v) => { setAsr(v); save({ audio: { asr_enabled: v } }); }} />
          <Text style={{ marginTop: 6, fontSize: 12, color: Brand.navy, opacity: 0.6 }}>
            Playback speed 0.75–1.5× is configurable on the web; mobile follows the same value.
          </Text>
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Notifications</Text>
          <Row label="Reminders & check-ins" value={notifs} onChange={(v) => { setNotifs(v); save({ notifications: { master_enabled: v } }); }} />
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: Brand.navy }}>Integrations</Text>
          {(settings?.integrations ?? [{ name: 'GitHub', connected: false }, { name: 'Notion', connected: false }]).map(
            (i: any) => (
              <Text key={i.id ?? i.name} style={{ marginTop: 4, color: Brand.navy }}>
                {i.connected ? '●' : '○'} {i.name}
              </Text>
            )
          )}
        </Card>
        <Pressable onPress={signOut} style={{ alignItems: 'center', padding: 16 }}>
          <Text style={{ color: '#B45309', fontWeight: '700' }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
      <Text style={{ color: Brand.navy }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: Brand.turquoise }} />
    </View>
  );
}
