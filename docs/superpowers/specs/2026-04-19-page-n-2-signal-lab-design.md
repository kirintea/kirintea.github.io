# Page N 2 Signal Lab Design

**Goal:** Rework `index.html` `#page_n_2` into a mouse-driven interactive showcase that feels like a sci-fi signal laboratory rather than a plain fullscreen effect section.

**Current Context**

- The home page already uses a cold, industrial sci-fi visual language in `#page_n_1`.
- `#page_n_2` currently renders only the `#akCanvas` particle experience with no foreground structure or readable content.
- The section should stay compatible with the existing particle canvas implementation in `js/canvasClass.js` and the current homepage structure in `index.html`.
- Local rollback safety already exists through commit `4d5fc59`.

## Experience Summary

`#page_n_2` becomes a full-screen "SIGNAL LAB" chamber:

- The particle canvas remains the main visual field.
- Mouse movement becomes the primary live input, shaping the local particle response in real time.
- A transparent foreground HUD gives the section identity, information density, and creative direction without overpowering the effect.
- Copy stays in short, terminal-style English phrases.

## Visual Direction

The section should feel like an observation terminal monitoring an unstable signal field.

- Palette: dark black-blue base with cyan-white accent lighting.
- Surface language: fine borders, soft glow, scanline touches, subtle glass panels.
- Typography tone: terminal / system console / lab dashboard.
- Motion tone: scanning, locking, disturbance, settling.
- Avoid: generic cards, large paragraph text, social-media style blocks, bright multicolor gradients.

## Layout Structure

The section should keep a layered structure:

1. **Background field**
   - Existing particle canvas continues filling the section.
   - Optional light overlay gradients can deepen the chamber feeling.

2. **Foreground HUD**
   - Top-left: section title and short mission line.
   - Top-right: live telemetry panel.
   - Bottom-left: rotating system log text or state messages.
   - Center area: intentionally left open so the particle interaction remains the hero.

3. **Ambient chrome**
   - Thin corner lines, scanning bands, or subtle frame marks.
   - Small animated indicators that imply the system is live.

## Content Model

The copy should stay compact and atmospheric.

### Title Block

- `SIGNAL LAB`
- `LIVE MOUSE-DRIVEN RESPONSE FIELD`

### Telemetry Panel

Example labels:

- `INPUT`
- `FIELD`
- `LOCK`
- `ENERGY`

Example values:

- `MOUSE / ACTIVE`
- `PARTICLE GRID / UNSTABLE`
- `SEMI-LOCKED`
- `72%`

### System Log

Short rotating or state-based phrases such as:

- `TRACE VECTOR ACQUIRED`
- `MOTION INPUT DETECTED`
- `SIGNAL NOISE WITHIN RANGE`
- `LOCAL DISTURBANCE OBSERVED`

## Interaction Design

Mouse interaction is the core of the section.

### Baseline Behavior

- Moving the cursor should visibly disturb the particles near the pointer.
- Hovering should create a temporary focus zone, as if the system is locking onto a signal.
- Faster pointer movement should increase the perceived energy or instability of the field.

### HUD Response

The foreground telemetry should react to mouse activity:

- `ENERGY` can rise with pointer velocity.
- `LOCK` can switch between states like `SEARCHING`, `TRACKING`, `LOCKED`.
- `FIELD` can describe the current effect state, for example `STABLE`, `DISTURBED`, `RECOVERING`.

### Motion Principles

- Reactions must be immediate enough to feel alive.
- The field should settle back down after interaction rather than staying chaotic.
- Effects should feel precise and instrument-like, not game-like.

## Implementation Boundaries

The update should be a medium-scope enhancement, not a full rewrite.

- Reuse the existing particle canvas and current page section structure.
- Add HTML for the HUD directly inside `#page_n_2`.
- Move section-specific styling into `css/home.css` unless an obvious split becomes necessary.
- Extend the particle script only as far as needed to expose mouse-driven states and telemetry hooks.
- Do not redesign unrelated sections during this change.

## Files Expected To Change

- `index.html`
  - Add HUD markup inside `#page_n_2`.
- `css/home.css`
  - Add section layout, HUD styling, responsive behavior, and animation polish.
- `js/canvasClass.js`
  - Extend the particle interaction model if needed for velocity-aware or state-aware behavior.
- `js/app.js` or a small dedicated homepage script
  - Update telemetry text and system log based on interaction state if the logic should stay separate from the particle class.

## Responsive Expectations

- Desktop should preserve the open center composition.
- Mobile should keep the interaction readable without filling the whole screen with panels.
- HUD blocks may stack or collapse on smaller screens.
- The section must remain usable even when hover precision is limited.

## Success Criteria

- `#page_n_2` clearly reads as a designed section, not only a background effect.
- Mouse movement feels like the user is operating a live lab instrument.
- The section contains enough foreground content to feel rich, but not crowded.
- The visual tone matches the industrial sci-fi identity already established by `#page_n_1`.
- The page still feels reversible and safe to iterate on from commit `4d5fc59`.
