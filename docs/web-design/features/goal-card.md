# Goal Card — Dashboard Feature Design

## Status

The pulled dashboard does not currently use one consistent OnTrack goal-card component. `DashboardCards` includes a financial-product-inspired summary, sample tracker mini-cards, and two decorative “tracker” cards with fake IDs/expiry values; recent activity and goal-detail selection are separate components. The master decision is whether the new dashboard is an intentional redesign or an unfinished reference-based prototype.

## Observed Anatomy

- Summary label and fixed execution percentage/delta.
- Quick Log and New Goal actions.
- Three compact tracker examples with title, target, and status; fallback labels appear when source goals are absent.
- Separate decorative cards show masked tracker IDs and expiry dates, not goal-domain information.
- A selected goal opens a slide-over; some summary cards select goals.

## Intended Goal Card Contract (Needs Approval)

A production goal card should prioritize real goal title, tracker type/domain if useful, current/target progress, deadline/status, and one clear open action. Do not retain payment-card IDs, masked numbers, fake expiry, or revenue-like metrics unless product ownership explicitly approves that metaphor.

## States and Interactions

- Status taxonomy in current data includes active, completed, and failed; dashboard component adds labels such as Active/Pending.
- Deadline-soon treatment and overdue behavior are not consistently represented.
- Card click behavior should be one accessible target leading to `/goal/:id` or opening the slide-over; clarify which is canonical.
- Empty state, hover/focus state, and mobile interaction remain to be specified.

## Visual Direction

Current pulled dashboard uses soft white/gray panels, charcoal and orange accents, rounded 2xl/3xl shapes, and light shadows. This conflicts with the shared teal/navy tactile card system. Decide and document a single visual contract before expanding/reusing cards.

## Accessibility

- Avoid clickable `div`s; use a link or button with visible focus.
- Provide progress semantics and text equivalents; do not communicate statuses by color alone.
- Ensure long goal titles and target/deadline values do not truncate essential information.

## Open Decisions

- Maximum active-goal count and sorting/pinning rules.
- Card versus list density, countdown visibility, domain color coding.
- Status definitions including deadline soon, overdue, completed, missed.
- Hover, tap, slide-over versus route navigation, and mobile behavior.
- Replace demo metrics and finance motifs with goal-specific data before production.

## References

- [Dashboard screen](../screens/dashboard.md)
- [Dynamic tracker](dynamic-tracker.md)
