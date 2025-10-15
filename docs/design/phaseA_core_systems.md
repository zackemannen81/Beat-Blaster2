# Phase A Core Systems Plan (CORE-006 & CORE-007)

## Goals
- Establish a shared event bus under `src/core/EventBus.ts` so subsystems can communicate without tight coupling.
- Build a deterministic BeatClock service that feeds beat/sub-beat callbacks and timing window checks to gameplay, UI, and economy systems.
- Provide clear migration steps from the current ad-hoc beat logic in `GameScene` and `AudioAnalyzer`.

## Current State Summary
- `GameScene` drives beat reactions directly off `AudioAnalyzer` events; there is no centralized pub/sub.
- `BeatWindow` offers a simple window calculation used only inside `GameScene`; combo logic is also local.
- Timing-sensitive systems (HUD, spawner, scoring) poll scene state rather than subscribe to a shared source.

## Event Bus Design (CORE-006)
- Location: `src/core/EventBus.ts`
- API surface:
  - `type EventPayloads = { ... }` typed map for events.
  - `class EventBus<T>` with `on`, `once`, `off`, `emit`, `clear`.
  - Singleton export `eventBus`.
- Initial channel set:
  - `beat:tick` → `{ beat: number; bar: number; timestamp: number }`
  - `beat:window` → `{ msUntilNext: number; windowMs: number }`
  - `combo:changed` → `{ value: number; multiplier: number }`
  - `player:hit` → `{ hp: number; damage: number; source?: string }`
  - `stage:completed` → `{ stageId: string; rank: string; stats: RunSummary }`
  - `currency:changed` → `{ delta: number; total: number; reason: string }`
- Usage Expectations:
  - Services emit domain events; UI/HUD subscribes during scene init and unsubscribes on shutdown.
  - Provide helper `subscribeToScene(scene, event, handler)` to auto-clean subscriptions when a scene exits.

## BeatClock API (CORE-007)
- Location: `src/audio/BeatClock.ts`.
- Responsibilities:
  - Track BPM, song offset, current beat index, and latency-adjusted time.
  - Expose callbacks: `onBeat(cb)`, `onSubBeat(division, cb)`, `off(id)`, `getBeatProgress()`, `isWithinWindow(windowMs)`.
  - Emit `beat:tick` via EventBus each time a beat fires.
  - Provide `syncFromAnalyzer(estPeriodMs, lastDetectedAt)` to align runtime with AudioAnalyzer until data-driven tracks are available.
- Implementation Notes:
  - Use Phaser's `clock.addEvent` for scheduled beats but derive timing from high-precision `scene.game.loop.now` + offsets.
  - Maintain accumulated error and resync gradually to avoid drift (lerp toward analyzer input).
  - Latency compensation pulls offsets from forthcoming LatencyService (CORE-008).

## Migration Strategy
1. Implement EventBus with minimal events and integrate into `GameScene` for combo updates and player health notifications.
2. Build BeatClock service, instantiating it in `GameScene` alongside `AudioAnalyzer`; forward analyzer detections to BeatClock for initial synchronization.
3. Replace direct analyzer callbacks in `GameScene` (`handleBeat`) with BeatClock subscriptions.
4. Update HUD to subscribe to `beat:tick` via EventBus (UI-004 spike) instead of direct scene calls.
5. Document new APIs in `docs/` and update affected task files with notes.

## Dependencies & Hand-offs
- Latency offsets (CORE-008) will plug into BeatClock once service exists; design BeatClock to accept setter early.
- Tools/Systems team needs the EventBus ready before starting modular refactor (CORE-009) to avoid double work.
- QA Automation: prepare to add unit tests for BeatClock accuracy once implementation lands.

## Open Questions
- Do we retain AudioAnalyzer long term or replace with pre-authored beat maps? For Phase A we continue using analyzer.
- Determine target tolerance for `isWithinWindow`; initial spec is ±30 ms Perfect window configurable per track.

## Next Actions
- Senior Core Engineer: create scaffolding files (`EventBus.ts`, `BeatClock.ts`) with TODO comments and initial typings.
- Gameplay Engineer: identify existing beat consumers in `GameScene` for replacement (combo, spawner, HUD pulse).
- QA Automation: draft test plan covering BeatClock jitter tolerance and subscription lifecycle.

## Implementation Status (2025-10-11)
- EventBus (CORE-006) scaffolding complete in `src/core/EventBus.ts` with typed channels and scene binding helper.
- BeatClock (CORE-007) implemented in `src/audio/BeatClock.ts`; supports beat scheduling, sub-beat callbacks, latency offsets, and EventBus emissions.
- Pending: integrate BeatClock into `GameScene`, replace BeatWindow usage, and update HUD to subscribe via EventBus.
- GAMEPLAY-013: BeatClock now governs shot timing, combo resets, and scoring multiplier via EventBus; HUD alignment pending UI polish.
