/** M1 Splash: static launch → route by session (no animated splash per spec). */
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Brand } from '../constants/colors';
import { getToken } from '../lib/auth';

export default function Splash() {
  useEffect(() => {
    (async () => {
      const token = await getToken();
      setTimeout(() => {
        router.replace(token ? '/(tabs)' : '/onboarding');
      }, 900);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Brand.navy, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          backgroundColor: Brand.turquoise,
          borderWidth: 2,
          borderColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 34, fontWeight: '700', color: Brand.navy }}>◉</Text>
      </View>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 30, color: '#fff' }}>OnTrack</Text>
      <Text style={{ fontSize: 14, color: Brand.turquoise, fontWeight: '600' }}>
        Say your goal. Get your tracker.
      </Text>
    </View>
  );
}
