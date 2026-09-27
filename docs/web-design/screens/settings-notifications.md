# Settings — Notifications — Design Document

## Purpose

Expose global and per-category notification preferences in the Notifications tab of `/settings`. The current panel edits local settings values; it does not establish that web push, email, or scheduled delivery exists.

## User Goal

Choose which reminders and feedback categories should be enabled.

## Layout

White bordered panel with one master toggle followed by five preference rows. Each row pairs its label and description with a right-aligned toggle. Rows dim and disable when the master setting is off.

## Visual Direction

- Background: neutral settings canvas with white panel, navy/turquoise.
- Primary element: master switch and list of notification categories.
- Depth/Layering: lightly raised preference rows inside a tactile panel.
- Animation: toggle transition and opacity change when master is disabled.
- 3D elements: none.

## Component Inventory

| Component            | Type   | State           | Notes                           |
| -------------------- | ------ | --------------- | ------------------------------- |
| Master notifications | Switch | On/off          | Intended global preference.     |
| Goal reminders       | Switch | On/off/disabled | “Daily” reminder copy.          |
| AI check-ins         | Switch | On/off/disabled | Proactive reminders claimed.    |
| Goal updates         | Switch | On/off/disabled | Milestone progress alerts.      |
| Streak alerts        | Switch | On/off/disabled | Copy specifies 8:00 PM warning. |
| Audio feedback       | Switch | On/off/disabled | Sound preference.               |

## States

### Default

Values loaded from context (demo defaults are enabled).

### Empty

Not applicable.

### Loading

No preference loading state.

### Error

No update/delivery error state.

### Master off

Child switches are disabled and visually dimmed; values remain set in local state.

## Copy & Microcopy

| Element         | Copy                                                                                                                             | Notes                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Heading         | “Notification & Alert Center”                                                                                                    | Current copy.                                      |
| Master          | “Master Notification Switch”                                                                                                     | Description refers to web notifications/reminders. |
| Categories      | Daily Goal Reminders; Nemotron AI Check-Ins; Milestone Progress Alerts; Streak Loss Protection Warnings; Audio Feedback & Chimes | Delivery channels and schedules are unverified.    |
| Streak schedule | “Urgent reminder at 8:00 PM…”                                                                                                    | Not evidence of an actual scheduler.               |

## Interactions

| Trigger           | Action                  | Animation                   | Result                            |
| ----------------- | ----------------------- | --------------------------- | --------------------------------- |
| Toggle master     | Update `master_enabled` | Switch/row state transition | Child controls enable or disable. |
| Toggle a category | Update selected setting | Switch movement             | Local preference changes.         |

## API Calls

| Endpoint                                | Method       | Trigger | Response used for                                            |
| --------------------------------------- | ------------ | ------- | ------------------------------------------------------------ |
| GoalContext local notification settings | Local update | Toggle  | Browser-local values only; no push/email endpoint confirmed. |

## Responsive Behavior

- 1440px: One vertical list with text and toggles aligned.
- 1024px: Same structure.
- 768px: Rows remain stacked; descriptions wrap above/beside fixed-width toggles without overlap.

## Accessibility

- Toggles need programmatic labels and checked/disabled states; current buttons have no visible textual state beyond color.
- Disabled reason should remain available to assistive technology.
- Avoid color-only distinction for master/disabled states.
- Contrast and keyboard audits not performed.

## References to Feature Docs

- None.
