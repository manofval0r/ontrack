# OnTrack — Mobile Design System (Expo / React Native)

Derived from [`web/design.md`](../web/design.md) — same brand, adapted for touch.
Web is the reference; this file records every deliberate **mobile adaptation**.
Living reference: update when tokens change. Preview: open `design-showcase.html`.

Stack: Expo (React Native) + Django API. No Tailwind here — tokens live in
`./constants/*.ts` as plain objects consumable by `StyleSheet.create()`.

---

## 1. Color Tokens (identical to web)

| Token | Hex | Mobile role |
| --- | --- | --- |
| `turquoise` | `#00C4B3` | Primary accent. Progress bars, active tab indicator, checkmarks, AI badge, logo mark. Focus/active states. |
| `navy` | `#071E2D` | Ink + structure. Headings, body, 2px borders, solid offset shadows, user chat bubbles, primary buttons. |
| `teal` | `#006D6A` | Secondary accent. "Done" pill, success stats ("+24% Pace"), dark-card accents. |
| `aqua` | `#33D6C5` | Hover-free highlight. Pressed states on dark surfaces, badge glows. |
| `gray` | `#F3F6F8` | Screen canvas, input tracks, bubble slots, secondary surfaces. |
| `white` | `#FFFFFF` | Cards, buttons, AI chat bubbles. |
| `amberBg` / `amberText` / `amberBorder` | `#FFFBEB` / `#B45309` / `#F59E0B` | "Behind" status only. Nowhere else. |
| `cyanBg` | `#ECFEFF` | "On track" pill bg + AI goal-proposal card bg. |

### Dark mode (from web `index.css`)

| Token | Hex | Role |
| --- | --- | --- |
| `darkBg` | `#051520` | Screen canvas |
| `darkSurface` | `#0B2536` | Cards, inputs, secondary buttons |
| `darkSurface2` | `#0F3146` | Pressed/hover on dark surfaces |
| dark borders/shadows | `#00C4B3` | Borders + offset shadows swap navy→turquoise; primary button becomes turquoise bg + navy text |

### Color restraint (same as web — no exceptions on mobile)
No tan/sand/brown, no purple/lavender, no full-screen gradient washes.
Canvas is flat gray (light) / `#051520` (dark); tactile depth comes from
2px borders + solid offset shadows, never gradients.

---

## 2. Typography

Web uses DM Sans (UI) + Fraunces (display) via Google Fonts.
Mobile: load both with `expo-font` (`useFonts`), fall back to system.

```ts
// app/_layout.tsx (once)
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
```

| Role | Font | Size / Weight | Use |
| --- | --- | --- | --- |
| Display | Fraunces 700 | 34 | Goal-detail countdown, verdict headline |
| Title | Fraunces 700 | 24 | Screen headers (Dashboard greeting, modal titles) |
| Card heading | DM Sans 700 | 18 | Goal cards, section headers |
| Body | DM Sans 400 | 15 | Descriptions, chat text, notes |
| Button | DM Sans 600 | 15 | Pill buttons, tab labels |
| Caption | DM Sans 600 | 12 | Badges, timestamps, sender labels |
| Micro | DM Sans 700 | 10–11 | "AI" badge, status dots, uppercase labels |

Mobile sizes run ~2px under web (smaller viewport, held closer).
See `constants/typography.ts`.

---

## 3. Shape Language (touch adaptations)

Same neo-brutalist anatomy as web — 2px navy borders, solid offset shadows —
with three touch adaptations:

1. **No hover.** All `:hover` motion becomes `pressed` (scale 0.97 + condensed
   shadow). Use `Pressable` + `android_ripple` in brand gray, never color floods.
2. **44pt minimum touch target.** Pills, +1 button, checkboxes, tab icons,
   mic/send buttons are all ≥ 44×44pt. Text links inside cards get padding.
3. **Shadows via elevation.** React Native has no `box-shadow`; use
   `shadowColor: navy, shadowOffset: {3,3}, shadowOpacity: 1, shadowRadius: 0`
   on iOS + `elevation: 3` on Android. Android blurs slightly — accepted;
   border + offset still read as tactile. See `constants/theme.ts` `shadows`.

| Element | Border | Radius | Shadow | Padding |
| --- | --- | --- | --- | --- |
| Pill button | 2px navy | full (999) | 3px offset navy | 12v / 20h, bubble 32px circle right |
| Card | 2px navy | 20 | 4px offset navy | 20–24 |
| Input | 2px `navy/20`, focus turquoise | 12 | none | 14v / 16h |
| Chat bubble | 2px navy | 18 | 3px offset (navy, turquoise for user) | 14–16 |
| Status pill | 2px (token border) | full | 1px offset | 4v / 12h |
| Icon squircle | none | 12 | none | 48×48, slate `#1E293B` bg, white glyph |
| Checkbox (checklist) | 2px navy | 8 | none unchecked; turquoise fill + navy check when done | 28×28 box |
| Counter +1 | 2px navy | full | 3px offset | 64×64 circle, navy bg, white "+" |

---

## 4. Screen Patterns (Expo Router tabs: Home · Chat · Goals · Settings)

- **Tab bar**: white (dark: `#0B2536`), top 2px navy border, 4 icons ≥44pt,
  active = turquoise icon + label + 4px turquoise top indicator.
- **Goal card** (Home/Goals): tactile card, title (DM 700/18), progress bar
  (gray track, turquoise fill, 8px high, 2px navy border), time-remaining,
  `GoalStatusPill`, 🔊 TTS icon-button. Tap → Goal Detail modal.
- **Goal Detail modal**: full-screen, countdown (Fraunces 34), big progress
  number, tracker by type (counter/checklist/manual), Update + Check In +
  🔊 Summary buttons, progress log list.
- **Chat**: AI left (white bubble, navy text, turquoise AI badge + sender
  label "Nemotron Accountability Partner"), user right (navy bubble, white
  text). AI bubbles carry a 🔊 replay row. Input row: text field + 48px mic
  (turquoise circle) + 48px send (navy circle). Goal proposals render in the
  cyan `#ECFEFF` confirmation card with type badge.
- **Voice Input modal**: full-screen, pulsing 96px mic circle, "Listening…",
  live transcript, Stop / Sounds good / Re-record / Edit.
- **Work-Block overlay**: dim navy scrim, centered tactile card with large
  timer + "You are working on: [title]" + Keep working / Close app.
- **Settings**: profile header, audio toggles (TTS/ASR, speed 0.75–1.5x),
  notifications, integrations list, sign out (destructive = amber/red text,
  never turquoise).

---

## 5. States & Motion

- Loading: turquoise spinner inside the button/card (label stays, button disabled).
- Empty: icon squircle + DM 600/15 heading + DM 400/14 hint + primary pill CTA.
- Error: red-600 text + retry pill; TTS failure falls back to transcript text.
- Motion: press scale 0.97 (150ms), modal slide-up (250ms), accordion expand
  (200ms), mic pulse (loop). Respect `AccessibilityInfo.reduceMotionEnabled`.

---

## 6. Usage (for David / Israel wiring the Expo app)

```ts
import { Colors, Spacing, Radii, Typography, Shadows } from './constants/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.white,
    borderWidth: 2,
    borderColor: Colors.light.navy,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    ...Shadows.card, // iOS shadow + Android elevation
  },
});
```

Toggle theme via `useColorScheme()` → `Colors.light` / `Colors.dark`.
Fonts must be loaded before render (expo-font `useFonts` + splash guard).
