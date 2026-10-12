/** M7 Goals — active + completed sections with error and empty states.
 * Refresh is the native pull control; the RefreshArc header is a pure
 * status readout (spins while syncing, ticks on success). No custom pan
 * wrapper here on purpose: the list owns vertical scroll, each Swipeable
 * row owns horizontal swipes, and nothing else competes for touches. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { FlatList as GHFlatList, Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily } from '../../constants/typography';
import { GoalCard } from '../../components/GoalCard';
import { BackdropArt } from '../../components/BackdropArt';
import { RefreshArc, RefreshState } from '../../components/RefreshArc';
import { Card } from '../../components/ui';
import { WeeklyReview } from '../../components/WeeklyReview';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';
import { useToast } from '../../lib/toast';

const WIP_LIMIT = 3;

type LaneItem =
  | { type: 'header'; key: string; title: string }
  | { type: 'card'; goal: any; queued: boolean };

function buildSections(activeLane: any[], queued: any[], done: any[]): LaneItem[] {
  const out: LaneItem[] = [];
  if (activeLane.length > 0) {
    out.push({ type: 'header', key: 'active', title: `ACTIVE · ${activeLane.length}/${WIP_LIMIT}` });
    for (const g of activeLane) out.push({ type: 'card', goal: g, queued: false });
  }
  if (queued.length > 0) {
    out.push({ type: 'header', key: 'queued', title: `UP NEXT · ${queued.length} waiting — only ${WIP_LIMIT} stay active` });
    for (const g of queued) out.push({ type: 'card', goal: g, queued: true });
  }
  if (done.length > 0) {
    out.push({ type: 'header', key: 'done', title: `DONE · ${done.length}` });
    for (const g of done) out.push({ type: 'card', goal: g, queued: false });
  }
  return out;
}

export default function Goals() {
  const t = useTheme();
  const { goals, loading, error, refresh, clearError, updateGoal } = useGoals();
  const toast = useToast();
  // WIP limit: at most this many goals in the Active lane. Overflow queues
  // in Up Next instead of competing for attention (Personal Kanban rule 2).
  // Board lanes (M2): active goals ordered by board_rank form the Active lane
  // capped at WIP_LIMIT; the overflow queues in Up Next; completed + missed
  // share Done. Rank ties keep API order (stable sort).
  const sortedActive = useMemo(() => {
    const act = goals.filter((g) => g.status === 'active');
    return act
      .map((g, i) => ({ g, i }))
      .sort((a, b) => (Number(a.g.board_rank ?? 0) - Number(b.g.board_rank ?? 0)) || (a.i - b.i))
      .map(({ g }) => g);
  }, [goals]);
  const activeLane = sortedActive.slice(0, WIP_LIMIT);
  const queued = sortedActive.slice(WIP_LIMIT);
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

  // Delete is delayed, not instant: the row's Delete action arms a 6-second
  // fuse and the toast carries a real Undo. Undo cancels the timer and the
  // goal was never touched; otherwise the delete executes, then refreshes.
  const pendingDelete = useRef<{ id: string; title: string; timer: any } | null>(null);

  useEffect(() => {
    const pending = pendingDelete.current;
    return () => {
      if (pending?.timer) clearTimeout(pending.timer);
    };
  }, []);

  const flushPendingDelete = useCallback(async () => {
    const pending = pendingDelete.current;
    pendingDelete.current = null;
    if (!pending) return;
    clearTimeout(pending.timer);
    try {
      await api.deleteGoal(pending.id);
      await refresh();
      toast.show({ type: 'success', title: 'Goal deleted', message: pending.title });
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Could not delete', message: e?.error ?? e?.message ?? 'Try again.' });
      refresh();
    }
  }, [refresh, toast]);

  const confirmDelete = (goal: any) => {
    const id = String(goal.id);
    const title = String(goal.title);
    if (pendingDelete.current) {
      // One fuse at a time: execute the armed delete before arming another.
      flushPendingDelete();
    }
    swipeRefs.current.get(id)?.close?.();
    const timer = setTimeout(() => {
      flushPendingDelete();
    }, 6000);
    pendingDelete.current = { id, title, timer };
    toast.show({
      type: 'error',
      title: `Deleted "${title}"`,
      message: 'Undo within 6 seconds — afterwards it is gone for good.',
      duration: 6000,
      action: {
        label: 'Undo',
        onPress: () => {
          const pending = pendingDelete.current;
          pendingDelete.current = null;
          if (pending) clearTimeout(pending.timer);
          refresh();
        },
      },
    });
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

  // Bring a queued goal into the Active lane by swapping ranks with the
  // lowest-priority active goal. Persisted via PUT — the board order is
  // real state, not local theater.
  const promoteQueued = useCallback(async (id: string) => {
    const ordered = sortedActive;
    const qi = ordered.findIndex((g) => String(g.id) === String(id));
    if (qi < WIP_LIMIT) return;
    const swapWith = ordered[Math.min(WIP_LIMIT - 1, ordered.length - 1)];
    if (!swapWith || String(swapWith.id) === String(id)) return;
    const qRank = Number(ordered[qi].board_rank ?? 0);
    const sRank = Number(swapWith.board_rank ?? 0);
    try {
      await updateGoal(String(id), { board_rank: sRank });
      await updateGoal(String(swapWith.id), { board_rank: qRank });
      await refresh();
      toast.show({ type: 'success', title: 'Moved to active', message: String(ordered[qi].title) });
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Could not reorder', message: e?.error ?? e?.message ?? 'Try again.' });
      refresh();
    }
  }, [sortedActive, updateGoal, refresh, toast]);

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
        data={buildSections(activeLane, queued, done)}
        keyExtractor={(it) => (it.type === 'header' ? `h-${it.key}` : String(it.goal.id))}
        accessibilityLabel="Goals board: active, up next, and done lanes"
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
              {activeLane.length}/{WIP_LIMIT} active · {queued.length} queued · {done.length} done
            </Text>
            <Text
              accessibilityLabel="Dial legend: the ring shows shipped progress, the dot shows where you should be. Swipe a row left to delete."
              style={{ fontSize: 11, color: t.teal, fontWeight: '600' }}
            >
              Ring = shipped · dot = where you should be · swipe left to delete
            </Text>
            <View style={{ marginTop: 6 }}>
              <WeeklyReview goals={goals} onReview={() => {}} />
            </View>
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
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal, marginBottom: 0, marginTop: 4 }}>
                {item.title}
              </Text>
            );
          }
          const key = String(item.goal.id);
          const row = (
            <View>
              <Swipeable
                ref={(r) => {
                  if (r) swipeRefs.current.set(key, r);
                  else swipeRefs.current.delete(key);
                }}
                renderRightActions={() => renderRightActions(item.goal)}
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
                <GoalCard goal={item.goal} onOpen={() => handleOpen(key)} />
              </Swipeable>
              {item.queued && (
                <Pressable
                  onPress={() => promoteQueued(key)}
                  accessibilityLabel={`Bring ${item.goal.title} into the active lane`}
                  accessibilityRole="button"
                  style={{ marginTop: 6, alignSelf: 'flex-start', borderWidth: 2, borderColor: t.border, borderRadius: Radii.pill, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: t.surface }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal }}>Bring to active ↑</Text>
                </Pressable>
              )}
            </View>
          );
          return row;
        }}
          />
    </SafeAreaView>
  );
}
