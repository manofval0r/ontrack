# Draggable Fluid Dock Pill — Implementation Plan (needs approval)

## Goal
The active-tab pill becomes a physical object: the user can grab it, drag it
across the dock, and whichever tab it lands on becomes the screen. Taps keep
working exactly as today — drag is additive, not a replacement.

## Current state (for reference)
- `mobile/app/(tabs)/_layout.tsx` → `FloatingDock`: one bordered bar, 4 tabs
  (Home, Goals | Settings, You) with a raised 72px center Chat action (-26px).
- Active state today: per-tab turquoise tile (46×46, 2px navy border, 2px hard
  shadow) + spring pop. No shared indicator element exists yet.

## Proposed mechanics — "Underpass Pill"
One shared pill (replaces the 4 per-tab tiles) that lives on an animated
`translateX` track across the dock:

1. **Measure once**: each tab slot reports its center-x via `onLayout`,
   relative to the dock. Four snap stops: `[homeX, goalsX, settingsX, youX]`.
2. **Drag**: a `PanGesture` (react-native-gesture-handler) on the dock drives
   a Reanimated `sharedValue dragX`. The pill follows the finger 1:1 with a
   slight lag (stiffness ~500, damping ~30) so it feels weighted, not glued.
3. **Commit while dragging**: when `dragX` crosses a stop's midpoint (12px
   hysteresis so it doesn't flicker), fire `haptics.selectionAsync()` and
   `navigation.navigate(stop)` immediately — scrubbing across the dock flips
   screens live, like an iOS page-control scrub.
4. **Release**: `withSpring` to the nearest stop (stiffness ~300, damping ~24).
   If released in dead space, the pill settles on the nearest tab — it can
   never rest between tabs.
5. **The center island problem**: the Chat button floats above the bar with a
   72px footprint. The pill does NOT jump over it — it ducks *under* it:
   while `dragX` is inside the gap, the pill scales to 0.85, drops its
   `zIndex`/`elevation` below the center button, and slides beneath it, then
   springs back up on the other side. A light haptic tick marks entry/exit of
   the tunnel. No stop can exist inside the gap, so Chat is never
   accidentally selected by drag (tap the + to open chat, as today).
6. **Chat screen state**: chat has no tab stop. When chat is focused, the pill
   parks underneath the center button as a turquoise glow ring around its
   base — the pill's "home base". Tapping any tab springs it back out.

## Accessibility & motion
- Tabs stay real `role="tab"` buttons; drag is never the only path.
- `useReduceMotion()`: pill jumps between stops with no spring, no live
  scrub (commit on release only).
- Screen-reader focus still announces tab changes from scrub commits.

## Dependency & build impact
- Needs `npx expo install react-native-gesture-handler` + `GestureHandlerRootView`
  at the root layout. **This is a native dependency → requires a fresh preview
  build** (cannot ship via OTA). That build can also carry the OAuth fixes.
- No other new deps. All animation is Reanimated (already installed), all
  styling reuses Brand tokens + hard-shadow primitives.

## Edge cases handled
- Safe-area / orientation change → re-measure stops on layout.
- Fast flings → velocity carries pill to the fling-direction stop, then spring.
- Drag starting on a tab label vs the pill itself → gesture starts from the
  *pill's* position regardless (grab anywhere on the bar, the pill comes to
  you within 80ms), so users never "miss" the grab.
- Interruption (incoming call, background) mid-drag → pill snaps to the
  currently focused route on next layout.

## Testing checklist
1. Expo Go: tap each tab (regression), drag home→you slowly (live scrub +
   haptics), fling across the center gap (duck-under, no chat trigger).
2. Release in the gap → settles on nearest tab, never stranded.
3. Chat open → glow ring visible under +; back to Home → pill springs out.
4. Reduce-motion on → instant jumps, commit-on-release only.
5. Fresh preview build (gesture-handler native) → repeat 1–4 on device.

## Fallback (if drag feels wrong in testing)
Static sliding indicator: same shared pill + spring between stops on tap only,
no gesture-handler, ships via OTA. Half the code, zero native changes.

## Approval gate
Do NOT implement until the user approves: (a) Underpass Pill vs fallback,
(b) live-scrub commit vs commit-on-release, (c) glow-ring home base for chat.
