# Settings — Main — Design Document

## Purpose

Provide a single-route hub for profile, audio, notifications, and integrations at `/settings`. Subsections replace the content panel using local tabs; there are no separate subsection routes.

## User Goal

Find and change account preferences without leaving the settings context.

## Layout

Shared `AppLayout` header, horizontally scrollable tab row with four options, then the selected subsection panel. Audio is selected by default. On smaller widths, tabs can horizontally scroll rather than wrapping.

## Visual Direction

- Background: shared pale neutral canvas, navy text, turquoise highlights.
- Primary element: active tab and selected preference panel.
- Depth/Layering: bordered white panels and tactile offset shadows.
- Animation: tab and control transitions; no page transition.
- 3D elements: none.

## Component Inventory

| Component        | Type             | State                                    | Notes                                            |
| ---------------- | ---------------- | ---------------------------------------- | ------------------------------------------------ |
| AppLayout        | Shared app shell | Default                                  | Page title/subtitle and app navigation.          |
| Settings tabs    | Tab-like buttons | Audio/profile/notifications/integrations | No URL synchronization. Verify ARIA tab pattern. |
| Profile          | Settings panel   | Active/inactive                          | Account display and actions.                     |
| AudioPreferences | Settings panel   | Active/inactive                          | TTS/ASR, voice persona, speed, test.             |
| Notifications    | Settings panel   | Active/inactive                          | Master and individual toggles.                   |
| Integrations     | Settings panel   | Active/inactive                          | Connected/not connected mock cards.              |

## States

### Default

Audio tab is selected on every mount.

### Empty

No empty settings state.

### Loading

No settings-level loading UI.

### Error

Preference update failures are not shown globally; behavior is delegated to GoalContext/local storage.

### Selected tab

Panel content swaps without route navigation or preserved URL state.

## Copy & Microcopy

| Element  | Copy                                                                                             | Notes                                   |
| -------- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Title    | “Settings & Preferences”                                                                         | Current title.                          |
| Subtitle | “Configure voice synthesis, proactive check-ins, notifications, and connected tools.”            | Some described features are prototypes. |
| Tabs     | “Audio & Voice (TTS/ASR)”, “Notifications & Alerts”, “Connected Workspaces”, “Account & Persona” | Labels in current code.                 |

## Interactions

| Trigger        | Action                           | Animation          | Result                                          |
| -------------- | -------------------------------- | ------------------ | ----------------------------------------------- |
| Select tab     | Change `activeTab` state         | Content swap       | Corresponding settings component appears.       |
| Change setting | Update GoalContext/local storage | Control transition | Preference changes persist locally where wired. |

## API Calls

| Endpoint                         | Method       | Trigger           | Response used for                                       |
| -------------------------------- | ------------ | ----------------- | ------------------------------------------------------- |
| None confirmed                   | —            | Tab change        | Tab state is local.                                     |
| GoalContext local settings store | Local update | Change preference | Browser-local settings; no remote preferences endpoint. |

## Responsive Behavior

- 1440px: Tabs in a horizontal row above the full panel.
- 1024px: Same row; maintain readable labels and separation.
- 768px: Horizontal tab strip scrolls; selected panel becomes single column.

## Accessibility

- Current navigation uses buttons, but tab roles/`aria-selected` and keyboard arrow behavior are not documented; decide between true tabs and ordinary buttons.
- Provide visible focus and avoid relying on selected color alone.
- Ensure narrow-screen horizontal scrolling can be operated by keyboard.
- No contrast or assistive-technology audit completed.

## References to Feature Docs

- [Voice input](../features/voice-input.md)
- [TTS player](../features/tts-player.md)
