/** M7 Goals — active + completed sections with error and empty states.
 * Refresh is the native pull control; the RefreshArc header is a pure
 * status readout (spins while syncing, ticks on success). No custom pan
 * wrapper here on purpose: the list owns vertical scroll, each Swipeable
 * row owns horizontal swipes, and nothing else competes for touches. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, RefreshControl, Text, View } from 'react-native';
import { FlatList as GHFlatList, Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
import { Spacing, Touch } from '../../constants/spacing';
import { FontFamily } from '../../constants/typography';
import { GoalCard } from '../../components/GoalCard';
import { BackdropArt } from '../../components/BackdropArt';
import { RefreshArc, RefreshState } from '../../components/RefreshArc';
import { Card } from '../../components/ui';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';
import { useToast } from '../../lib/toast';

export default function Goals() {
  const t = useTheme();
  const { goals, loading, error, refresh, clearError } = useGoals();
  const toast = useToast();
  const active = goals.filter((g) => g.status === 'active');
  const done = goals.filter((g) => g.status !== 'active');
  const [syncState, setSyncState] = useState<RefreshState>('idle');
  const wasLoading = useRef(false);

  useEffect(() => {
    if (loading) {
      wasLoading.current = true;
      setSyncState('loading');
      return;
    }
    if (!wasLoading.current) return;
    wasLoading.current = false;
    if (error) {
      setSyncState('idle');
      return;
    }
    setSyncState('done');
    const t = setTimeout(() => {
      setSyncState('idle');
    }, 1500);
    return () => clearTimeout(t);
  }, [loading, error]);

  const doRefresh = useCallback(() => {
    clearError();
    refresh();
  }, [clearError, refresh]);

  // Errors surface as dismissible top toasts (with Retry) — never as
  // dead-end cards pinned into the feed.
  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      toast.show({
        type: 'error',
        title: 'Could not sync',
        message: error,
        duration: 5000,
        action: { label: 'Retry', onPress: () => { clearError(); refresh(); } },
      });
    }
    if (!error) lastErrorRef.current = null;
  }, [error, toast, clearError, refresh]);

  const confirmDelete = (goal: any) => {
    Alert.alert('Delete goal?', `"${goal.title}" and its logs go away for good.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteGoal(String(goal.id));
            await refresh();
            toast.show({ type: 'success', title: 'Goal deleted', message: String(goal.title) });
          } catch (e: any) {
            toast.show({ type: 'error', title: 'Could not delete', message: e?.error ?? e?.message ?? 'Try again.' });
          }
        },
      },
    ]);
  };

  // Swipe bookkeeping: friction 1 so a normal thumb swipe actually reaches
  // the Delete action; a swipe that opens suppresses the card's tap (the
  // snap-back release must never read as "open details"); opening one row
  // closes any other open row.
  const swipeRefs = useRef(new Map<string, any>());
  const suppressTap = useRef(new Set<string>());
  const openRow = useRef<string | null>(null);

  const handleOpen = useCallback((id: string) => {
    if (suppressTap.current.has(String(id))) return;
    const open = openRow.current;
    if (open && open !== String(id)) {
      swipeRefs.current.get(open)?.close?.();
      openRow.current = null;
      return;
    }
    router.push(`/goal/${id}`);
  }, []);

  const renderRightActions = (goal: any) => (
    <Pressable
      onPress={() => confirmDelete(goal)}
      accessibilityLabel={`Delete ${goal.title}`}
      accessibilityRole="button"
      style={{
        width: 96,
        marginLeft: 8,
        marginVertical: 2,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: t.border,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
    </Pressable>
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <GHFlatList
        data={[...active, ...done]}
        keyExtractor={(g) => String(g.id)}
        accessibilityLabel="Goals list"
        contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 170 }}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={doRefresh} tintColor={t.teal} />
        }
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text accessibilityRole="header" style={{ fontFamily: FontFamily.expressive, fontSize: 36, color: t.ink }}>
                Goals
              </Text>
              <RefreshArc state={syncState} label={`Sync status: ${syncState}`} />
            </View>
            <Text style={{ fontSize: 13, color: t.inkSoft }}>
              {active.length} active · {done.length} completed
            </Text>
            {active.length > 0 && done.length > 0 && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal, marginTop: 4 }}>ACTIVE</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Card>
              <Text style={{ fontFamily: FontFamily.expressive, fontSize: 24, color: t.ink }}>Start with one goal.</Text>
              <Text style={{ marginTop: 4, fontSize: 14, color: t.inkSoft }}>
                Tell OnTrack what you want to achieve in the Chat tab.
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/chat')}
                accessibilityLabel="Open chat"
                accessibilityRole="button"
                style={{ marginTop: 12, backgroundColor: t.primary, borderRadius: 999, paddingVertical: 12, alignItems: 'center', minHeight: Touch.min, justifyContent: 'center' }}
              >
                <Text style={{ color: t.primaryInk, fontWeight: '700' }}>Open chat</Text>
              </Pressable>
            </Card>
          ) : null
        }
        renderItem={({ item, index }) => {
          const key = String(item.id);
          return (
            <View>
              {index === active.length && done.length > 0 && (
                <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal, marginBottom: 8 }}>COMPLETED</Text>
              )}
              <Swipeable
                ref={(r) => {
                  if (r) swipeRefs.current.set(key, r);
                  else swipeRefs.current.delete(key);
                }}
                renderRightActions={() => renderRightActions(item)}
                overshootRight={false}
                friction={1}
                leftThreshold={0}
                rightThreshold={32}
                containerStyle={{ flex: 1 }}
                onSwipeableWillOpen={() => {
                  suppressTap.current.add(key);
                  const open = openRow.current;
                  if (open && open !== key) swipeRefs.current.get(open)?.close?.();
                  openRow.current = key;
                }}
                onSwipeableClose={() => {
                  if (openRow.current === key) openRow.current = null;
                  setTimeout(() => suppressTap.current.delete(key), 250);
                }}
              >
                <GoalCard goal={item} onOpen={() => handleOpen(key)} />
              </Swipeable>
            </View>
          );
        }}
          />
    </SafeAreaView>
  );
}
