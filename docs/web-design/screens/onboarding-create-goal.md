# Onboarding — Create Your First Goal — Design Document

## Purpose

Collect a first goal in step 2 of `/onboarding`, compile a local tracker preview, and move through a short building state into the ready state. The current implementation is a standalone textarea flow, not the main chat component.

## User Goal

Describe a meaningful target and understand the tracker format OnTrack inferred before starting.

## Layout

Progress header; centered title and description; desktop two-column area with textarea, starter prompts, and primary “Build my tracker” action on the left; blueprint illustration panel on the right. A non-shift+Enter submits. Step 3 is a timed transition state handled within this same route.

## Visual Direction

- Background: pale dot-grid with navy/turquoise brand colors.
- Primary element: goal textarea and “Auto-Builder Blueprint” panel.
- Depth/Layering: tactile white bordered surfaces and solid offset shadows.
- Animation: fade-in, timed progress bar segments and status copy during parsing.
- 3D elements: none.

## Component Inventory

| Component          | Type                                 | State                    | Notes                                                  |
| ------------------ | ------------------------------------ | ------------------------ | ------------------------------------------------------ |
| Progress indicator | Progressbar                          | Step 2 of 4              | No step labels.                                        |
| Goal textarea      | Multiline input                      | Editable                 | Enter submits; Shift+Enter adds a line.                |
| Starter prompts    | Buttons                              | Unselected/selected text | Four examples fill the textarea.                       |
| Builder panel      | Illustration and explanatory copy    | Static                   | Does not react to current text.                        |
| Build button       | Primary action                       | Disabled when blank      | Starts local heuristic parse.                          |
| Step 3 status      | Illustration, progress bar, messages | Timed                    | Rotates through three messages for about 2.65 seconds. |

## States

### Default

Empty goal field, four sample prompts, builder illustration.

### Empty

Build button disabled; no validation copy is shown.

### Loading

Three timed copy/progress phases: reading goal, choosing format, building tracker.

### Error

No parser error/recovery UI. Empty text is ignored. Heuristic parsing does not call Nemotron.

### Input provided

Goal title is retained in component state when returning from ready to step 2.

## Copy & Microcopy

| Element          | Copy                                                                                           | Notes                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Heading          | “What's your goal?”                                                                            | Current copy.                                                                        |
| Description      | “Type your goal in plain English — our AI compiles it into an adaptive tracker.”               | Overstates the current local heuristic as AI. Revise or qualify for prototype demos. |
| Placeholder      | `Try "read 2 books by Friday" or "50 pushups a day"`                                           | Example text.                                                                        |
| Starter prompts  | “Sell 5 cars this week”; “Read 2 books by Friday”; “Do 50 pushups daily”; “Ship MVP by Friday” | Sets the goal text.                                                                  |
| Button           | “Build my tracker”                                                                             | No server request.                                                                   |
| Loading messages | “Reading your goal…”; “Figuring out the best way to track it…”; “Building your tracker…”       | Timed local transition.                                                              |

## Interactions

| Trigger                   | Action                          | Animation                 | Result                              |
| ------------------------- | ------------------------------- | ------------------------- | ----------------------------------- |
| Edit textarea             | Update local goal text          | None                      | Prompt becomes available.           |
| Choose starter prompt     | Populate textarea               | None                      | User can edit before submitting.    |
| Press Enter without Shift | Start parse if text is nonempty | Timed progress transition | Step 3 then step 4.                 |
| Select “Build my tracker” | Run keyword/number heuristic    | Timed progress transition | Creates in-memory `Goal` preview.   |
| Select back arrow         | Return to welcome               | Fade-in                   | Text is not cleared by the handler. |

## API Calls

| Endpoint | Method | Trigger | Response used for                                              |
| -------- | ------ | ------- | -------------------------------------------------------------- |
| None     | —      | Build   | `compileTrackerFromInput` runs client-side; no AI/API request. |

## Responsive Behavior

- 1440px: Two-column input and blueprint panel; content constrained to 3xl width.
- 1024px: Layout may remain two columns at `lg`; monitor field width and long prompt wrapping.
- 768px: Single-column stack; starter prompts become two columns at `sm` and one column on narrow mobile.

## Accessibility

- Textarea has a visible associated label; starter prompts and submit are native buttons.
- Explain errors and parsing progress through live-region semantics if this flow is made production-facing; current rotating messages are not marked as a live region.
- Ensure progressbar updates are announced accessibly and keyboard focus remains on a predictable control.
- Color contrast and assistive-technology behavior not audited.

## References to Feature Docs

- [Dynamic tracker](../features/dynamic-tracker.md)
