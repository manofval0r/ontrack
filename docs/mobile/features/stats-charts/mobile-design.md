# Stats & Charts — Mobile Feature Design

## Purpose

Offer a small, glanceable account of progress without shrinking desktop charts into unreadable phone visuals. Metric definitions and source data must be approved before charts are shown.

## Recommended Mobile Scope

- Home header: optional streak count and due-today count.
- Stats detail/section: one metric per row or compact chart; avoid three side-by-side mini charts on narrow widths.
- Weekly activity: accessible vertical bars or simple list with day labels; completion rate as a number plus context, not color-only ring.
- History beyond the current period can live in a dedicated view if needed.

## States

No data/first week, loading, fetch error, zero completion, full completion, and timezone/period boundary. Do not substitute fixtures or hard-coded totals.

## Interaction

Tap chart point/bar to reveal a labeled tooltip or detail sheet. Avoid hover-only information. Period selector uses segmented buttons or a native menu. Dynamic Island and home-screen widgets are stretch goals, not baseline chart surfaces.

## Visual Direction

Use current web colors: turquoise/teal for primary progress, muted neutral for track, navy for labels. Reconcile any dashboard orange/charcoal design divergence before creating cross-platform chart tokens.

## Accessibility

Provide a concise text summary and accessible table/list of values. Label period, metric, units, and denominator. Bars must be distinguishable without color. Support text scaling and screen-reader navigation.

## Open Decisions

Metric definitions, streak timezone, chart library, period selector, tooltips, minimum history, empty state, and parity with web analytics. Do not choose Recharts for native; evaluate a React Native-compatible chart approach only if needed.

## API Calls

Metrics and time series endpoint contracts are TBD; mobile/web should use the same definitions and timezone rules.

## References

- [Home](../../screens/home.md)
- [Stats & charts web spec](../../../web-design/features/stats-charts.md)
- [Mobile index](../../index.md)
