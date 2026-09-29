# OnTrack Frontend, Backend, and AI Issues Report

Date: 2026-09-28
Scope: Read-only review of `c:\Users\HomePC\Desktop\ontrack\ontrack`

No files inside the project folder were changed.

## Severity Summary

| Severity | Area | Issue |
| --- | --- | --- |
| High | Frontend/build | Production Vite build cannot resolve the declared `lucide-react` dependency. |
| High | Backend/AI audio | The advertised hard timeout can still wait for a hung provider because the executor context manager shuts down synchronously. |
| Medium | AI deadline parsing | “day after tomorrow” is parsed as tomorrow. |
| Medium | Backend verdicts | Every finalized goal is saved as completed, including goals below target; the missed status is never used by finalization. |
| Low | Frontend bundle | The production build reports a minified chunk over 500 kB. |
| Environment | Backend/testing | Django is unavailable, so backend checks/tests could not execute. |
| Coverage | Frontend/testing | No frontend test script exists; interactive browser E2E was not runnable after the build failure. |

## Frontend Findings

### F-001 — Missing installed `lucide-react` blocks production build

- File: `ontrack/web/src/pages/Onboarding.tsx`, import section around line 3.
- Source imports `Code2`, `Activity`, `Briefcase`, `BookOpen`, and `Sparkles` from `lucide-react`.
- `web/package.json` declares `lucide-react` as a dependency, but `npm ls lucide-react --all` reports `(empty)`.
- External production build result: Vite/Rolldown failed to resolve `lucide-react`.
- Impact: the production bundle cannot be generated, so the application cannot be validated through a browser run.

### F-002 — Large bundle warning

- The external Vite build transformed the app but reported a minified JavaScript chunk larger than 500 kB.
- This is a performance warning, not the build blocker.

### F-003 — No frontend automated test command

- `web/package.json` exposes `dev`, `build`, `lint`, and `preview`, but no `test` script.
- TypeScript no-emit compilation passed.
- ESLint passed.
- Interactive browser E2E was not run because the production build failed at dependency resolution.

## Backend Findings

### B-001 — Backend checks and tests are blocked by missing Django

- `python manage.py check` fails before Django startup with `ModuleNotFoundError: No module named 'django'`.
- `python manage.py test --noinput` is blocked by the same missing dependency.
- Python AST parsing passed for all 43 backend Python files, so no syntax errors were found.
- No package installation was attempted because this was a read-only audit.

### B-002 — Finalization always stores `completed`

- File: `backend/ontrack/apps/goals/views.py`, `GoalFinalizeView.post`, around lines 620–626.
- The endpoint computes final progress and generates a verdict, then unconditionally assigns `goal.status = Goal.STATUS_COMPLETED`.
- The model defines a `missed` status, but this endpoint never assigns it when final progress is below the target.
- Impact: a failed/under-target goal is represented as completed, which can corrupt dashboard filters, history, and status-based notifications.

## AI Findings

### AI-001 — “Day after tomorrow” deadline bug

- File: `backend/ontrack/apps/ai_module.py`, `parse_relative_deadline`, around lines 153–160.
- The function checks `re.search(r"\btomorrow\b", lower)` before checking `re.search(r"\bday after tomorrow\b", lower)`.
- The phrase “day after tomorrow” contains the standalone word “tomorrow”, so it returns current date + 1 day instead of + 2 days.
- Impact: AI-created deadlines can be one day early for a supported natural-language expression.

### AI-002 — Audio timeout does not guarantee a client-visible hard timeout

- File: `backend/ontrack/apps/audio/views.py`, `call_ai_with_timeout`, around lines 30–53.
- The function uses `with ThreadPoolExecutor(...) as pool:` and raises a 503 after `future.result(timeout=timeout)` expires.
- Exiting the executor context calls `shutdown(wait=True)`, so a provider call still blocked in `urlopen` can keep the request thread waiting after the timeout exception is raised.
- This conflicts with the function docstring’s claim that the client receives a 503 within the configured timeout.
- Impact: hung TTS/ASR providers can still tie up request workers and delay responses.

### AI-003 — AI tests do not cover the deadline precedence bug

- Existing AI tests cover JSON parsing, code fences, malformed output, chat request shape, and unconfigured settings.
- No test covers `parse_relative_deadline("day after tomorrow")` versus `parse_relative_deadline("tomorrow")`.
- No test verifies that the audio timeout returns within the documented wall-clock bound when the provider hangs.

## Checks That Passed

- Web TypeScript no-emit compilation: passed.
- Web ESLint: passed.
- Backend Python AST syntax check: passed for 43 files.
- In-project mobile/web design Markdown diagnostics: no errors reported.
- Existing external `END_TO_END_TEST_REPORT.md` was readable and contained the earlier report; this issues report is a separate file.

## Untested Because of Environment/Build Blockers

- Django system checks and backend endpoint tests.
- Frontend production runtime and browser interaction flows.
- Live NVIDIA/Nemotron, TTS, and ASR calls.
- Authenticated cross-service end-to-end flow.

## Project Integrity

The project worktree was clean during the audit. No pull, dependency installation, source edit, or generated artifact was left inside the project folder.
