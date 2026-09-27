# Dashboard — Design Document

## Purpose

Provide the signed-in user’s day-to-day overview at `/dashboard`. The pulled redesign composes a compact dock rail and top navigation with execution summaries, stats, a chart, recent activity, a chat drawer, and a goal detail slide-over.

## User Goal

Review goals and activity, open a goal, log progress, start a new goal, or reach account settings.

## Layout

Padded workspace with left vertical rail and main column. Main column begins with top navigation and time-based greeting, followed by a three-column desktop row (execution/trackers, stats, chart) and recent activity. Chat opens from a right drawer; selecting a goal opens a detail slide-over. The dashboard visual system differs materially from the teal/navy tactile system used elsewhere.

## Visual Direction

- Background: light cool gray; surfaces are white, with charcoal and vivid orange accents.
- Primary element: greeting and first execution summary panel.
- Depth/Layering: subtle soft shadows and rounded cards; unlike the 2px navy-offset treatment elsewhere.
- Animation: hover transitions; right-side drawer and goal detail transitions.
- 3D elements: none.

## Component Inventory

| Component               | Type                                 | State            | Notes                                                                                           |
| ----------------------- | ------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| DashboardRail           | Icon dock                            | Active tab       | Dashboard, navigation, chat, settings/logout actions.                                           |
| DashboardTopNav         | Top bar                              | Active pill/user | Dashboard navigation and profile actions.                                                       |
| DashboardCards          | Execution summary and tracker panels | Data/demo        | Includes hard-coded 84.5%, monthly targets, fallback tracker examples, and card motifs.         |
| DashboardStatGrid       | Stat tiles                           | Data/demo        | Some values passed from hard-coded or transformed counts; inspect before treating as analytics. |
| DashboardChart          | Stacked bar chart                    | Static           | Eight fixed month records, not derived from dashboard data.                                     |
| DashboardRecentActivity | Activity list/table                  | Data/demo        | Must confirm whether entries are goal-backed or fixture data.                                   |
| DashboardChatPanel      | Drawer content                       | Open/closed      | Reuses goal context callbacks.                                                                  |
| GoalDetailSlideOver     | Goal details                         | Open/closed      | Updates/logs/finalizes selected goal.                                                           |

## States

### Default

Greeting and dashboard regions render from `GoalContext` plus fixed demonstration values.

### Empty

No coherent all-empty dashboard state is defined. Several panels use fallback totals/goal labels when source data is absent.

### Loading

No dashboard-level initial loading/skeleton is apparent in the page component.

### Error

No page-level error state is apparent.

### Drawer/slide-over

Chat and goal detail are independently opened/closed. Overlay, focus trapping, escape behavior, and focus restoration need verification.

### Responsive

Grid collapses toward one column; rail/top nav behavior should be checked at mobile width.

## Copy & Microcopy

| Element     | Copy                                                             | Notes                                                                |
| ----------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Greeting    | “Good morning/afternoon/evening, [name]”                         | Time-dependent.                                                      |
| Description | “Stay on top of your tasks, monitor progress, and track status.” | Current page copy.                                                   |
| Summary     | “Total Execution”, “84.5%”, “↑ 5% than last month”               | Fixed demo values.                                                   |
| Chart       | “Total Velocity”, “Completed”, “In Progress”                     | Static series and finance-like units/labels; review for product fit. |
| Actions     | “Quick Log”, “New Goal”, “My Trackers”                           | Quick Log and New Goal both open the chat drawer.                    |

## Interactions

| Trigger                                 | Action                                       | Animation        | Result                               |
| --------------------------------------- | -------------------------------------------- | ---------------- | ------------------------------------ |
| Select rail chat / Quick Log / New Goal | Toggle chat drawer                           | Slide-in         | Goal conversation panel.             |
| Select active goal or activity row      | Set selected goal and open detail            | Slide-over       | Goal progress actions.               |
| Select settings/account                 | Navigate to `/settings`                      | Route navigation | Settings tabs.                       |
| Select logout                           | Remove `ontrack_token`, navigate to `/login` | Route navigation | No server-side session invalidation. |

## API Calls

| Endpoint                            | Method                       | Trigger                      | Response used for                                            |
| ----------------------------------- | ---------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `GoalContext` / local `api` adapter | Mock GET/POST/PUT operations | Dashboard render and actions | Browser `localStorage` goals; no HTTP request.               |
| Dashboard stats/chart               | None                         | Render                       | Hard-coded/fallback values; not a remote analytics endpoint. |

## Responsive Behavior

- 1440px: Rail plus three content columns and full-width activity section.
- 1024px: Main cards may remain in three columns at `lg`; check minimum readable widths and navigation compression.
- 768px: Main content stacks; inspect rail conversion, chart labels, drawer sizing, and slide-over ergonomics. Exact device QA is outstanding.

## Accessibility

- Native buttons exist for primary actions, but some tracker mini-card containers are clickable `div`s; keyboard semantics need review.
- Drawer and slide-over need dialog naming, focus management, Escape close, and focus restoration.
- Chart needs an accessible data summary/table, not color-only bars. Current values are demo data.
- Orange/gray/text contrast and focus states need an audit; no WCAG conformance is claimed.

## References to Feature Docs

- [Goal card](../features/goal-card.md)
- [Stats & charts](../features/stats-charts.md)
- [Dynamic tracker](../features/dynamic-tracker.md)
- [Work-block](../features/work-block.md) — no work-block control appears in this dashboard.
