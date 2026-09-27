/** M2 Onboarding: illustrated pager, one screen at a time, goal-first preview. */
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { OnboardingArt } from '../components/OnboardingArt';
import { Card, PillButton } from '../components/ui';

const STEPS = [
  {
    title: 'Welcome to OnTrack',
    body: 'Chat-first accountability. Say a goal, get a tracker, prove progress.',
  },
  {
    title: 'Trackers that build themselves',
    body: 'Counters, checklists and logs appear from plain words — then update live.',
  },
  {
    title: 'Try your first goal',
    body: 'Type it below to preview — no account needed yet.',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');

  const goAuth = (login: boolean) =>
    router.replace({
      pathname: login ? '/(auth)/login' : '/(auth)/signup',
      params: !login && draft.trim() ? { pendingGoal: draft.trim() } : {},
    } as any);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === step ? Brand.turquoise : 'rgba(7,30,45,0.2)',
              }}
            />
          ))}
        </View>
        <Pressable onPress={() => goAuth(false)} hitSlop={12} accessibilityLabel="Skip onboarding">
          <Text style={{ fontWeight: '700', color: Brand.teal }}>Skip</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <Animated.View key={step} entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)}>
          <OnboardingArt step={step} />
        </Animated.View>
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
              title={draft.trim() ? 'Preview my tracker →' : 'Create account'}
              primary
              onPress={() => goAuth(false)}
            />
            <PillButton title="I already have an account" onPress={() => goAuth(true)} />
          </View>
        )}
      </View>
      <Text style={{ textAlign: 'center', color: Brand.navy, opacity: 0.5 }}>
        Step {step + 1} of 3
      </Text>
    </SafeAreaView>
  );
}
