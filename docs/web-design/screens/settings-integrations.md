# Settings — Integrations — Design Document

## Purpose

Show available productivity integrations in the Integrations tab of `/settings` and present a confirmation dialog before toggling a local connected flag. No actual OAuth or sync integration is established by the current screen.

## User Goal

Understand which services are represented and connect or disconnect an account when the integration is available.

## Layout

White panel with a responsive two-column grid of integration cards. Each card includes icon, name, connected state, description, status text, and action. Connect/disconnect opens a confirmation modal.

## Visual Direction

- Background: neutral settings canvas; light card surfaces and navy/turquoise details.
- Primary element: integration name and connection state.
- Depth/Layering: outlined cards and tactile shadows; modal overlay.
- Animation: card/modal/button transitions.
- 3D elements: none.

## Component Inventory

| Component          | Type           | State                   | Notes                                                   |
| ------------------ | -------------- | ----------------------- | ------------------------------------------------------- |
| Integration card   | Repeated item  | Connected/not connected | Google Calendar, Slack, Notion, GitHub in demo data.    |
| Connection status  | Badge and text | Connected/not connected | Status labels are seeded local strings.                 |
| Connect/disconnect | Button         | Default                 | Opens confirmation modal.                               |
| Confirmation modal | Dialog         | Open/closed             | Confirms a local toggle; does not authorize a provider. |

## States

### Default

Cards reflect seeded `GoalContext` integration objects.

### Empty

No empty state for an empty integration list.

### Loading

No remote connection/loading state.

### Error

No OAuth failure or sync error state.

### Connected

Local `connected` flag toggles; status label does not establish actual sync.

## Copy & Microcopy

| Element      | Copy                                                        | Notes                                       |
| ------------ | ----------------------------------------------------------- | ------------------------------------------- |
| Heading      | “Connected Workspaces & Integrations”                       | Current copy.                               |
| Description  | “Bridge OnTrack with your everyday productivity platforms…” | Descriptive claim, not implemented sync.    |
| Actions      | “Connect”, “Disconnect”                                     | Only toggle local state.                    |
| Confirmation | “Authorize & Connect” / “Confirm Disconnect”                | No provider authorization currently occurs. |

## Interactions

| Trigger                   | Action                   | Animation        | Result                         |
| ------------------------- | ------------------------ | ---------------- | ------------------------------ |
| Select Connect/Disconnect | Set selected integration | Modal transition | Confirmation dialog opens.     |
| Cancel/close              | Clear selected item      | Modal transition | Return to card grid unchanged. |
| Confirm                   | Call `toggleIntegration` | Modal closes     | Local connected value flips.   |

## API Calls

| Endpoint                             | Method       | Trigger       | Response used for                                     |
| ------------------------------------ | ------------ | ------------- | ----------------------------------------------------- |
| GoalContext local integration toggle | Local update | Confirm modal | Browser-local connected flag; no OAuth/sync endpoint. |

## Responsive Behavior

- 1440px: Two cards per row.
- 1024px: Two columns if card content remains legible.
- 768px: One-column cards; modal fits viewport with scrolling if necessary.

## Accessibility

- Use provider names in action labels; do not rely on emoji/logo alone.
- Modal requires accessible title, focus trap, Escape handling, and focus return.
- Connection status should be announced after change; buttons should indicate busy/error during real OAuth integration.
- Contrast and keyboard audits not performed.

## References to Feature Docs

- None.
