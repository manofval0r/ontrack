/** M2 Onboarding: one screen at a time, goal-first preview before signup. */
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { Card, PillButton } from '../components/ui';

const STEPS = [
  { title: 'Welcome to OnTrack', body: 'Chat-first accountability. Say a goal, get a tracker, prove progress.' },
  { title: 'How it works', body: '1. Tell the coach your goal.\n2. Get a Counter, Checklist or Log tracker.\n3. Log progress. Get verdicts.' },
  { title: 'Try your first goal', body: 'Type it below to preview — no account needed yet.' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl }}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <Card>
          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Brand.navy }}>
            {STEPS[step].title}
          </Text>
          <Text style={{ marginTop: 8, fontSize: 15, color: Brand.navy, lineHeight: 22 }}>
            {STEPS[step].body}
          </Text>
          {step === 2 && (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="I want to sell 5 cars this week"
              style={{
                marginTop: 12,
                borderWidth: 2,
                borderColor: 'rgba(7,30,45,0.2)',
                borderRadius: Radii.input,
                padding: Spacing.md,
                fontSize: 15,
                backgroundColor: '#fff',
              }}
            />
          )}
        </Card>
        {step < 2 ? (
          <PillButton title="Continue" primary onPress={() => setStep(step + 1)} />
        ) : (
          <View style={{ gap: 12 }}>
            <PillButton
              title={draft.trim() ? 'Preview my tracker →' : 'Skip for now'}
              primary
              onPress={() =>
                router.replace({
                  pathname: '/(auth)/signup',
                  params: draft.trim() ? { pendingGoal: draft.trim() } : {},
                })
              }
            />
            <PillButton title="I already have an account" onPress={() => router.replace('/(auth)/login')} />
          </View>
        )}
      </View>
      <Text style={{ textAlign: 'center', color: Brand.navy, opacity: 0.5 }}>
        Step {step + 1} of 3
      </Text>
    </SafeAreaView>
  );
}
