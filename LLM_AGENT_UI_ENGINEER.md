# UI Engineer Playbook

## Mission
Deliver a reactive, accessible UI suite—from HUD to menus—that pulses with the beat while staying performant.

## Where to Start
1. Review `docs/EXTENDED_ROADMAP.md` section 3 and relevant portions of section 4 for HUD expectations.
2. Study `docs/V1_DEVELOPMENT_PLAN.md` Phases A, D, E, and F for UI milestones.
3. Audit current UI layers in `src/ui/` and `src/scenes/MenuScene.ts` to identify legacy assumptions.

## Priority Deliverables
- HUD v2 (`UI-004`), ability overlay (`UI-012`), and stage result screen (`UI-005`) in Sprints 1–4.
- Main menu, world map, profile, and shop experiences (`UI-006`–`UI-009`) before Sector 1 content lock.
- Settings & accessibility suite and latency wizard (`UI-010`, `UI-011`) for release readiness.
- Boss cinematics and challenge UI (`UI-013`, `UI-014`) supporting campaign polish.

## Collaboration
- Partner with the UI/UX Designer for wireframes and motion language before coding.
- Sync with Senior Core Engineer on event payloads and BeatClock hooks feeding the HUD.
- Coordinate with Economy/Profile services so UI reflects persistent state accurately.

## Engineering Practices
- Build UI components modularly under `src/ui/`; expose props for beat state, accessibility, and input method.
- Maintain 60 FPS by profiling transitions; fall back to lightweight shaders or CSS-like effects when needed.
- Cover critical UI logic with Vitest where feasible (e.g., rank computation rendering, accessibility toggles).

## Daily Rhythm
- Kick off with design review stand-up; confirm assets and copy before implementation.
- Test UI in keyboard, mouse, and gamepad modes every day; log control inconsistencies.
- Update `docs/dev-journal.md` with release notes and known UX gaps tied to task IDs.

### Heads-Up
- EventBus and BeatClock services are live; plan HUD v2 (UI-004) to consume `beat:tick` via EventBus once `GameScene` integration lands.

### Recent Changes
- HUD now subscribes to `beat:band` via EventBus; GameScene no longer calls `flashBeat` directly. Use this pattern for upcoming UI-004 work.

### Profile UI Work
- ProfileScene now consumed ProfileService data; added create/rename/delete controls and rhythm-friendly layout. Coordinate with design to polish avatars and list styling.

### Latency Wizard
- LatencyCalibrationScene (UI-011) now includes countdown rings, sample progress bars, audio cues, and apply confirmations; OptionsScene still launches it via the dedicated row.

### Current Work
- Ability overlay now consumes live AbilityService states (Pulse Dash, Overdrive) with input hints and status arcs; next step is exposing loadout management/rebinds in the profile menus.
- OptionsScene surfaces autosave/manual-save status and a manual save action via the new ProfileService save events; wire this into broader profile management UI next.
- ProfileScene now supports cycling ability loadouts directly; follow up with richer ability detail cards and controller-friendly navigation.
