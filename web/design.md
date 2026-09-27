# Ontrack — Design System Reference

This document records every deliberate design decision made in the Ontrack frontend.
It is a living reference, not a retrospective — update it when tokens, typefaces, or patterns change.

---

## 1. Color Tokens & The "Color Restraint" Principle

Sourced directly from the core Ontrack brand palette. No hex values are written ad-hoc in component files; every color references one of these tokens via Tailwind's `@theme` block or named CSS classes in `index.css`.

| Token name | Hex | Primary role |
|---|---|---|
| `brand-turquoise` | `#00C4B3` | Primary brand accent. Progress bars, active indicators, checkmarks, logo mark background, headline highlight accents. |
| `brand-navy` | `#071E2D` | Primary ink and structure. Headings, body copy, component borders (`2px solid`), solid tactile offset shadows (`#071E2D`), and high-contrast CTA container. |
| `brand-teal` | `#006D6A` | Secondary accent. Subtle tags, success ratings ("98% Ready", "+24% Pace", "Pass ✓"), and dark card accents. |
| `brand-aqua` | `#33D6C5` | Light accent. Hover highlights on dark surfaces and secondary badge glows. |
| `brand-gray` | `#F8FAFB` / `#F3F6F8` | Page canvas and card inner tracks. Background for dot-grid texture, input tracks, and secondary pill states. |
| `brand-white` | `#FFFFFF` | Primary card and button surface. Clean, high-legibility crisp background for tactile cards and pill buttons. |

### Color Restraint Directive ("Do Not Copy Color From References")
- **No Reference Tan/Sand/Brown**: The reference resume-builder screenshots utilize warm beige, sand, and cream hues (`#FAF8F5`, `#F5EDE2`). These colors are strictly excluded in Ontrack. All cards and buttons remain crisp white (`#FFFFFF`) or light slate (`#F8FAFB`).
- **No Reference Purple/Lavender**: The Growth Genius reference screenshot utilizes a soft purple/lavender palette. This color is NOT used. Ontrack strictly preserves its own high-contrast Navy (`#071E2D`), Turquoise (`#00C4B3`), and Teal (`#006D6A`) palette.
- **No Saturated Gradient Washes**: Avoid loud full-page neon/cyan gradient washes. The background canvas relies on clean `#F8FAFB` with a subtle, tactile dot grid (`rgba(7, 30, 45, 0.14)` at 24px spacing) and soft ambient backlight (`rgba(0,196,179,0.16)`).

---

## 2. Typography & Contextual Copywriting

Ontrack is a **conversational goal and accountability tracker** powered by Nemotron AI ("Say your goal. Get your tracker."). All copywriting must fit this exact product context—never copying placeholder copy from foreign domains (like resume builders or child development trackers).

### Typeface choices

**DM Sans** — primary UI font (body, labels, nav, buttons, captions, card titles)
- Variable font with optical size axis (9–40pt); used at 400, 500, 600, 700 weights.
- Chosen because: geometric but warm, exceptionally legible inside dense cards, input fields, and pill buttons.

**Fraunces** — display font (hero headlines, major section headings, key numeric callouts)
- Optical size variable font (9–144pt); used at 600 and 700 weights.
- Chosen because: editorial personality, inky stroke contrast, and trustworthy presence. Gives section headings substantial weight without feeling corporate.

### Type scale & Copy Archetypes

| Role | Font | Size | Weight | Contextual Ontrack Copy Example |
|---|---|---|---|---|
| Display headline | Fraunces | `text-5xl` / `text-6xl` (48–60px) | 700 | "Track Your Ambitions With Personalized Confidence" |
| Section subheading | Fraunces | `text-3xl` / `text-4xl` (30–38px) | 700 | "Built for focus. Engineered for execution." |
| Card heading | DM Sans | `text-lg` / `text-xl` (18–20px) | 700 | "Real-time Progress Engine", "Adaptive Goal Formats" |
| Body / descriptions | DM Sans | `text-sm` / `text-base` (14–16px) | 400 | "Eliminate the guesswork from goal achievement with personalized, conversational accountability..." |
| Button label | DM Sans | `text-sm` / `text-base` (14–16px) | 600 | "Start Tracking Free", "Explore Features" |
| Badge & tags | DM Sans | `text-xs` / `text-[11px]` (11–12px) | 600–700 | "Verified AI Accountability · Designed for Follow-Through >" |

---

## 3. Component Shape Language

Directly derived from the reference UI: tactile neo-brutalist precision with 2px dark solid borders, solid offset shadows, rounded geometry, and physical micro-motion.

### Pill button anatomy

Every interactive button follows the tactile pill structure:

```
┌────────────────────────────────────────┐ ── 2px solid #071E2D border
│  Label text            ┌────────────┐  │    border-radius: 9999px (full pill)
│                        │   icon  →  │  │ ── inner circular bubble (w-8 h-8)
│                        └────────────┘  │
└────────────────────────────────────────┘
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ── box-shadow: 3px 3px 0px #071E2D
```

- **Outer pill**: `border-radius: 9999px`, `border: 2px solid #071E2D`, `box-shadow: 3px 3px 0px #071E2D`.
- **Inner bubble**: `border-radius: 9999px`, `width: 2rem`, `height: 2rem`, sits flush against the right edge.
- **Physical micro-motion**:
  - `hover`: lifts by 1px (`translate(-1px, -1px)`) with expanded shadow (`box-shadow: 5px 5px 0px #071E2D`).
  - `active`: presses down by 2px (`translate(2px, 2px)`) with condensed shadow (`box-shadow: 1px 1px 0px #071E2D`).
- **Variants**:
  - `btn-pill-primary`: Solid `#071E2D` background, white text, crisp white `#FFFFFF` inner bubble with vibrant teal `#006D6A` arrow (transitions on hover to turquoise `#00C4B3` with pure white arrow), `3px 3px 0px #071E2D` shadow. Zero dark/black overlay.
  - `btn-pill-white`: White background, dark `#071E2D` text, inner bubble with border and arrow, `3px 3px 0px #071E2D` shadow.
  - `btn-pill-secondary`: White background, dark text, light gray or white inner bubble with teal arrow, `3px 3px 0px #071E2D` shadow.
  - `btn-pill-ghost`: Transparent background, dark text, 2px border, `2px 2px 0px #071E2D` shadow.

### Feature cards (Matching Image 1)

```
┌──────────────────────────────────────────────┐ ── 2px solid #071E2D border
│ ┌─────────┐                                  │    rounded-2xl (20px radius)
│ │  [icon] │  ← dark squircle (rounded-xl)    │    bg-white
│ └─────────┘                                  │
│                                              │
│ Real-time Progress Engine                    │ ── DM Sans Bold 18-20px
│                                              │
│ Watch your trackers update live as you speak │ ── DM Sans Regular #071E2D/70
└──────────────────────────────────────────────┘
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ── box-shadow: 4px 4px 0px #071E2D
```

- **Container**: `border: 2px solid #071E2D`, `border-radius: 1.25rem` (20px), `background: #FFFFFF`, `padding: 1.75rem - 2rem`.
- **Shadow**: Solid offset shadow `box-shadow: 4px 4px 0px #071E2D`.
- **Hover physics**: Smooth lift `translate(-2px, -2px)` with shadow expanding to `6px 6px 0px #071E2D`.
- **Icon Squircle**: `w-12 h-12`, `rounded-xl`, filled with dark slate `#1E293B`, containing crisp white vector strokes.
- **Applied in**:
  - Real-time Progress Engine (Eye icon)
  - Adaptive Goal Formats (Check-circle icon)
  - Privacy First (Shield-lock icon)
  - Instant Export & Reports (Download tray icon)

### Accordion / FAQ cards (Matching Image 2)

```
┌──────────────────────────────────────────────┐ ── 2px solid #071E2D border
│ Do I need to create an account to start? (v) │ ── Question bold + chevron pill
├──────────────────────────────────────────────┤
│ No. You can start creating trackers...       │ ── Expandable answer area
└──────────────────────────────────────────────┘
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ── box-shadow: 4px 4px 0px #071E2D
```

- **Container**: `border: 2px solid #071E2D`, `border-radius: 1rem` (16px), `box-shadow: 4px 4px 0px #071E2D`, `background: #FFFFFF`.
- **Header trigger**: Full width, bold DM Sans question, right-aligned circular chevron badge (`w-7 h-7 bg-[#F3F6F8]`).
- **Interaction**: Chevron smoothly flips 180° when expanded. Content reveals with a clean border divider and generous reading line-height.

### Hero Visual Showcase (Growth Genius Layout + `/mockup.png`)

Mirrors the centered hero cluster from the Growth Genius reference, engineered to keep phone screens 100% visible:
- **Centerpiece Mockup**: `/mockup.png` expanded to large scale (`max-w-[1240px]`, `maxHeight: '760px'` inside a `max-w-[1720px]` showcase) with zero obstruction, showcasing the 3 phone screens (Israel's "Close 5 Enterprise Deals", "3/5 Shipped", and "OnTrack AI Partner") with a deep ambient backlight (`rgba(0,196,179,0.18)`).
- **Side Card Left ("Goal Velocity" & "Active Target")**:
  - Positioned strictly beside the mockup on the left with zero overlap (`xl:w-[290px]`, flex-row).
  - White surface, `2px solid #071E2D`, `shadow-[4px_4px_0px_#071E2D]`.
  - Header: `Goal Velocity` with `+24% Pace` badge, SVG pacing curve, and an active sprint progress bar directly reinforcing the phone UI.
- **Side Card Right ("Tips For Success" & "OnTrack AI Partner")**:
  - Positioned strictly beside the mockup on the right with zero overlap (`xl:w-[290px]`, flex-row).
  - White surface, `2px solid #071E2D`, `shadow-[4px_4px_0px_#071E2D]`.
  - Header: `Tips For Success` with star icon, actionable accountability tips, and active AI session status ("You're at 3 out of 5 deals with 3 days left...").

---

## 4. Layout & Surface Architecture

1. **Navbar**: Fixed/sticky, `#F8FAFB` background with subtle blur, `border-b-2 border-[#071E2D]/8`, featuring the tactile "Get Started" pill button.
2. **Hero (Growth Genius Layout)**:
   - Centered credibility pill with checkmark.
   - 2-line display headline with Fraunces font and Turquoise highlight.
   - Contextual subheadline and dual pill CTA buttons (*Start Tracking Free* & *Explore Features*).
   - Phone mockup cluster (`/mockup.png`) flanked by tilted Goal Velocity and Tips cards over a soft radial backlight.
3. **Features (Image 1)**: Pure white canvas, 2x2 grid of tactile feature cards with squircle icons.
4. **Meet Nemotron AI**: Conversational assistant spotlight card demonstrating natural language prompt-to-tracker compilation.
5. **Tracker Types**: Asymmetric tactile card showcase (Checklist wide card + stacked Counter and Habit Log).
6. **How It Works**: 4-step sequential cards with tactile borders and shadows.
7. **FAQ (Image 2)**: Light gray canvas (`#F8FAFB`), stacked tactile accordion cards with smooth toggle states.
8. **Final CTA**: High-contrast navy card (`#071E2D`) with `6px 6px 0px #071E2D` shadow and white tactile pill button.
9. **Auth Pages (`/login`, `/signup`)**: Full-screen responsive split layout. Left side: clean white auth form with pill inputs, password visibility toggle, centered solid pill action button, "or continue with" divider, circular social login buttons (Google, Apple, Facebook), and persistent secondary switch link. Right side: visual showcase card (`rounded-[32px]`) featuring mindful goal-tracking vector character, floating active task card with circular progress meter, floating avatar bubbles, and carousel indicators.

---

## 5. Reference Image Mapping

| Decision & Component | Source Reference |
|---|---|
| Centered hero layout, credibility pill, headline hierarchy, dual CTA buttons | Growth Genius Reference Image |
| Phone mockup centerpiece cluster with tilted Stats & Tips cards | Growth Genius Reference Image & `/mockup.png` |
| Feature cards (squircle icon, dark border, 4px solid shadow, bold title) | Image 1 (Feature Cards) |
| Accordion FAQ cards (2px border, 4px shadow, chevron pill, smooth expansion) | Image 2 (Accordion Questions) |
| Tactile pill buttons (3px/4px solid shadow, circular arrow bubble, physical press) | Image 3 (Hero Buttons) |
| Complete avoidance of foreign purple or tan/sand palette | Ontrack Brand Integrity |
| Contextual write-ups tailored specifically to goal accountability | Ontrack Product Mission |
