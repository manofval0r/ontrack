# Stats & Charts — Dashboard Feature Design

## Status

A chart and stat grid exist on the dashboard. The chart is hand-built with CSS bars and a fixed eight-month fixture; it is not Recharts and does not represent user history. Several stat values are hard-coded or derived through placeholder multipliers. Do not publish them as real analytics.

## Current Data Visualization

- `DashboardChart`: stacked bars for Jan–Aug with fixed “Completed” and “In Progress” values; orange and charcoal series, title “Total Velocity”, axis labels with `k` despite small fixture values.
- `DashboardStatGrid`: several display metrics; parent supplies transformed counts and fixed total score.
- Landing hero has a separate static SVG progress curve and sample percentages.

## Intended Scope (Needs Confirmation)

Questionnaire suggests streak count, weekly progress, and completion-rate ring, but no approved metric definitions, time zone rules, denominator, or chart library decision was found. The current implementation’s financial/execution terminology should not be treated as final product semantics.

## States and Interaction

- No true empty chart state or loading state is visible on the dashboard.
- No tooltip interaction beyond browser `title` text on individual bars.
- Responsive bar width is fluid; no verified mobile data-label strategy.
- All displayed values need data provenance and formatting definitions.

## Visual Direction

Current dashboard uses orange for in-progress data, charcoal for completed, thin gray axes, and soft card shadows. Shared web design reference specifies teal for primary chart data; reconcile the difference before chart reuse.

## Accessibility

- Add a textual summary and accessible table or list of chart values.
- Provide labels, units, period, and series names; ensure contrast and distinguish series with more than color.
- Do not expose fixture values as personal stats. Test at zoom and narrow widths.

## Open Decisions

- Metric definitions: streak, weekly completions, active-goal pace, completion rate, domains.
- Chart library: questionnaire recommends Recharts, but current build uses CSS; choose based on approved needs.
- Period selector, tooltip content, no-data state, loading/error behavior, and responsive layout.
- Align chart colors with the chosen dashboard design system.

## References

- [Dashboard screen](../screens/dashboard.md)
- [Goal card](goal-card.md)
