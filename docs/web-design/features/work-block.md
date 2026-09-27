# Work-Block Mode — Feature Design

## Status

Not implemented in the reviewed web UI. There is no work-block timer, activation toggle, expiration flow, or browser-close warning. Landing/showcase copy mentions starting a 45-minute session, but that is static illustrative content, not an available control.

## Intended Surface (Unconfirmed)

The questionnaire places work-block mode in Goal Workspace. Do not treat a timer duration, focus behavior, blocking policy, or visual treatment as approved until the product owner answers the open questions.

## Required Design Decisions

- Activation: where the start action lives, default/custom duration, and confirmation.
- Active workspace: what dims/changes, how the user sees goal context and elapsed/remaining time.
- Exit behavior: whether navigation prompts, what browser visibility can realistically detect, and an always-available accessible exit.
- Completion: sound/visual summary, progress logging, and whether the session can be extended/restarted.
- Interruptions: reload, lost connection, tab close, backgrounding, and timer persistence semantics.

## Accessibility and Safety

- Never trap users or prevent access to essential controls; browser tab-close prevention is advisory, not a reliable lock.
- Make timer state available to screen readers without announcing each second.
- Provide pause/stop/exit controls with keyboard access and reduced-motion behavior.
- Do not use urgency color as the only signal.

## API Calls

No work-block endpoint or client-side timer contract is present in the reviewed implementation. Backend ownership and persistence must be defined before implementation.

## References

- [Goal workspace](../screens/goal-workspace.md)
