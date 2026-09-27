# Verdict — Mobile Feature Design

## Purpose

Present a clear, accessible outcome for a goal and a short actionable next step. The mobile guide calls for a verdict delivered at goal completion/deadline; exact automatic/early trigger policy must align with the backend and web spec.

## Trigger Recommendation

Treat an explicit user early-finalize action and a deadline-based server verdict as separate triggers. Confirm product policy before implementation; never calculate a final result from stale client data alone.

## Presentation

Use a full-width result section/card in Goal Detail with status (achieved/missed/exceeded), score/progress, concise assistant explanation, optional TTS action, and next-step choices. On a small screen, keep outcome and next action above fold; details can follow below.

## States

Pending, generating, achieved, missed, exceeded, generation failure/retry, and stale/offline verdict. Preserve the goal tracker/history when the result appears. Keep share/extend/new-goal actions optional and explicitly approved.

## Motion and Haptics

Use restrained reveal; celebration motion only for confirmed achievement and with reduced-motion fallback. Optional success haptic belongs in shared map. No haptic for missed verdict.

## Accessibility

Announce result heading and score/status; use text and icon in addition to color. TTS optional; result remains fully readable. Avoid focus jumps when the verdict arrives.

## Copy

Direct, non-shaming language. Provisional examples: “Goal achieved” / “Goal not reached this time”; AI-generated explanation must be concise, grounded in stored progress, and not imply unsupported coaching data.

## API Calls

Verdict trigger, model result, score, status, and retry/error schema are TBD. Ensure idempotency and consistent output across platforms.

## References

- [Goal Detail](../../screens/goal-detail.md)
- [TTS player](../tts-player/mobile-design.md)
- [Verdict web spec](../../../web-design/features/verdict.md)
- [Mobile index](../../index.md)
