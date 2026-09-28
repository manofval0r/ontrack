# OnTrack App-Blocking (Duolingo-style) — Research & Implementation Plan

Status: SCOPED DECISION (2026-09-28) — implement **Android only** for now.
Apple Screen Time moves to **Future Talk** (see `docs/OnTrack Project Plan.md` §16).
Nothing here is implemented. Review, then approve to build.
Date: 2026-09-28 · Target: Expo SDK 57 app in `mobile/`, Django backend in `backend/ontrack/`

## 1. Goal (what "done" looks like)

During a work-block session on a goal, the user picks distracting apps (e.g. Instagram,
TikTok, X). Those apps are blocked until the session ends or the goal's exit condition
is met (timer done, progress logged, or coach check-in answered). Blocked opens show an
OnTrack-branded interstitial ("You're working on: [goal] — Keep working / Quit session").
This mirrors Duolingo's iOS Screen Time onboarding: system picker → shield → unlock.

## 2. Platform reality (why two native stacks)

| | iOS | Android |
|---|---|---|
| API | **Screen Time**: FamilyControls (auth + picker) + ManagedSettings (shield) + DeviceActivity (schedule, survives app kill) | **UsageStatsManager** (foreground detection, ~500ms poll) + **SYSTEM_ALERT_WINDOW** overlay + ForegroundService |
| Block UI | Native shield via **ShieldConfiguration** extension (title/subtitle/buttons/colors only — no custom views) | Our own full-screen overlay Activity (full branding allowed) |
| Unlock | Clear `ManagedSettingsStore` tokens from app | Flip local flag; service stops intercepting |
| Hard requirement | **Physical iPhone** (simulator returns no data), Apple Developer membership, Family Controls **distribution approval ×4 bundle IDs** (days–weeks) | Works on emulator; 2 manual special-access grants (usage access + overlay) |
| Avoid | Hacks, background loops, window monitoring (impossible on iOS) | **AccessibilityService** unless UsageStats proves insufficient (Play declaration + review risk); DevicePolicyManager (enterprise-only, ignore) |

Key constraint for us: **Expo Go cannot ship any of this.** Blocking needs custom
native code → `expo-dev-client` + EAS builds (`development` for iteration, `preview`
APK for Android testers, production for release). Expo Go keeps working for everything
else; only the blocking toggle will be dev-build-gated.

## 3. What changes in our repo (checklist, not code)

**mobile/app.json**
- `ios.appleTeamId` (Apple membership), `ios.entitlements`: `com.apple.developer.family-controls=true` + App Group `group.com.manofval0r.ontrack.blocker`
- `ios.infoPlist`: keep mic/speech keys; no background modes needed (OS enforces)
- `android.permissions`: add usage-stats/overlay/foreground-service/boot/notifications set (review exact list at implementation; plugin injects most)
- `plugins`: add `expo-build-properties` (iOS deployment target 15.1+) + blocker plugin
- `extra.eas.build.experimental.ios.appExtensions`: 3 entries (DeviceActivityMonitor, ShieldAction, ShieldConfiguration)

**mobile/package.json**
- Add `expo-dev-client` + blocker library. Recommendation: **`eylonshm/expo-app-blocker`** (SDK ≥54, cross-platform, `@bacons/apple-targets` auto-creates the 3 extension targets, Duolingo-style inline `FamilyActivityPickerView`). iOS-only alternative: `kingstinct/react-native-device-activity`.
- Keep `scheme: ontrack` — shield buttons deep-link back via `ontrack://unlock`.

**Apple portal (outside repo, start NOW — longest lead time)**
- 1 App Group + 4 App IDs (`com.manofval0r.ontrack` + 3 extensions) with Family Controls + App Groups
- 4× Family Controls (Distribution) request forms; dev builds use the Development capability meanwhile
- `EXPO_APPLE_TEAM_ID` credentials for EAS

**Backend (`backend/ontrack`, Evans)**
- New tables: `FocusSession {id, user_id, goal_id?, starts_at, ends_at, status, platform, activity_name}`, `BlockedSelection {id, user_id, session_id?, ios_selection_data (opaque base64), android_packages[], created_at}`
- New endpoints (same `{error,code}` envelope + Supabase JWT): `POST /api/focus-sessions`, `PUT /api/focus-sessions/:id`, `GET /api/focus-sessions?status=active`, `PUT /api/settings/blocking`; surface `active_focus_session` in `GET /api/dashboard`
- Privacy rule: iOS opaque tokens stay on-device (App Group UserDefaults); only hashes/status sync. Needed for App Store review + privacy policy.

**mobile/app integration points**
- `app/work-block.tsx`: timer start/stop calls `startMonitoring()` / `clearAllBlocks()`; permission-denied → current timer-only mode (graceful fallback, still shippable)
- Settings → new "Focus & blocking" section: blocked-app picker entry, quiet hours (plan §9 already wants this), permission status rows
- Shield primary button → `ontrack://unlock` → goal check-in (`POST /api/goals/:id/checkin`) → `temporaryUnlock(N)` on success (the Duolingo loop)

## 4. Phased rollout (Android-first)

1. **Now (no code):** approve this plan; confirm block-list scope (per-goal vs global + quiet hours).
2. **Backend first:** FocusSession tables + endpoints (testable via `/api/debug`, no app needed).
3. **Dev-build spike:** `expo-dev-client` + plugin on EAS `development`; picker → overlay → unlock on Android preview APK (emulator OK).
4. **UX wiring:** work-block + settings + overlay theming (navy/turquoise copy per design system).
5. **Policy:** Play Console foreground-service disclosure + video demo.
6. **Release:** production EAS builds; Expo Go remains the no-blocking fallback.

iOS Screen Time phases (approval → extensions → wiring) are parked in Future Talk
until Android ships.

## 5. Risks & open decisions

- Apple approval wait (weeks) is the critical path — start forms before code.
- Neither platform is unbypassable (uninstall / Screen Time off); sell as friction, not jail.
- OEM battery killers (Xiaomi/Samsung) may stop the Android service → persistent notification + battery-opt prompt.
- iOS: 20-monitor cap, coarse event granularity, permission-status lag until restart.
- **Decision needed:** `expo-app-blocker` (cross-platform, faster) vs `react-native-device-activity` (iOS-richer scheduling)? Recommendation: expo-app-blocker.
- **Decision needed:** block-list scope — per-goal lists or one global list + quiet hours?

## Sources

- Subagent feasibility sweep of this repo (2026-09-28): current `app.json`/`eas.json`/package baseline, no entitlements, no dev-client, work-block timer-only.
- Owner-provided cross-platform brief (Screen Time vs AccessibilityService/UsageStatsManager, lock/unlock state machine).
- Community references cited in sweep: `eylonshm/expo-app-blocker`, `kingstinct/react-native-device-activity`, `@bacons/apple-targets`, Expo iOS capabilities + `appExtensions` docs.
