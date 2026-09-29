/** Chat composer — text input + inline dictation + send. */
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../constants/colors';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { Typography } from '../constants/typography';

export function ChatComposer({
  value,
  onChange,
  onSend,
  canSend,
  recording,
  recSecs,
  transcribing,
  onToggleDictation,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  canSend: boolean;
  recording: boolean;
  recSecs: number;
  transcribing: boolean;
  onToggleDictation: () => void;
}) {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.md, paddingBottom: Spacing.lg }}>
      <Pressable
        onPress={onToggleDictation}
        disabled={transcribing}
        accessibilityLabel={recording ? `Stop dictation, ${fmt(recSecs)} recorded` : 'Dictate with voice'}
        accessibilityRole="button"
        accessibilityHint="Records audio and transcribes it into the message field"
        accessibilityState={{ disabled: transcribing, busy: recording || transcribing }}
        style={{
          width: Touch.iconButton,
          height: Touch.iconButton,
          borderRadius: Radii.pill,
          backgroundColor: recording ? Brand.error : Brand.turquoise,
          borderWidth: 2,
          borderColor: Brand.navy,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: transcribing ? 0.5 : 1,
        }}
      >
        {transcribing ? (
          <ActivityIndicator color={Brand.navy} size="small" />
        ) : (
          <Ionicons name={recording ? 'stop' : 'mic'} size={22} color={recording ? Brand.white : Brand.navy} />
        )}
      </Pressable>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={recording ? 'Listening… tap stop when done' : 'Message OnTrack…'}
        placeholderTextColor={Brand.placeholder}
        accessibilityLabel="Message OnTrack coach"
        multiline
        maxLength={500}
        editable={!recording}
        style={{
          flex: 1,
          minHeight: Touch.min,
          maxHeight: 110,
          borderWidth: 2,
          borderColor: recording ? Brand.error : Brand.navy,
          borderRadius: Radii.pill,
          paddingHorizontal: Spacing.lg,
          paddingVertical: 10,
          backgroundColor: Brand.white,
          fontSize: Typography.body.fontSize,
        }}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityLabel="Send message"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend }}
        style={{
          width: Touch.iconButton,
          height: Touch.iconButton,
          borderRadius: Radii.pill,
          backgroundColor: Brand.navy,
          borderWidth: 2,
          borderColor: Brand.navy,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: !canSend ? 0.4 : 1,
        }}
      >
        <Ionicons name="arrow-up" size={20} color={Brand.white} />
      </Pressable>
    </View>
  );
}
