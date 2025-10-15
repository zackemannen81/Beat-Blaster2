# Phase A Latency Service Plan (CORE-008)

## Objectives
- Provide a reusable service that measures, stores, and applies input/audio latency offsets per profile.
- Expose an API for BeatClock and UI flows to read/write latency values without duplicating logic.
- Support the upcoming Latency Calibration Wizard (UI-011) and settings screens.

## Requirements
- Persist latency offsets (ms) per profile via the future Profile/Save services (stubs acceptable until CORE-010/011 land).
- Allow temporary overrides for calibration sessions before committing values.
- Emit events when latency changes so BeatClock and HUD can react.
- Handle default values (0 ms) gracefully when no calibration has been performed.

## Proposed Architecture
- Location: `src/systems/LatencyService.ts`.
- Dependencies: EventBus (`latency:changed` event), BeatClock (`setLatencyOffset`), future ProfileService.
- API surface:
  ```ts
  interface LatencySnapshot {
    offsetMs: number
    updatedAt: number
    source: 'default' | 'calibration' | 'manual'
  }

  class LatencyService {
    getOffset(): number
    setOffset(ms: number, source?: LatencySnapshot['source']): void
    beginCalibration(): void
    recordSample(deltaMs: number): void
    completeCalibration(): LatencySnapshot
    cancelCalibration(): void
    loadFromProfile(profile: ProfileLatencyData): void
    serialize(): ProfileLatencyData
  }
  ```
- Calibration algorithm: simple average/median of tap deltas vs BeatClock reference; keep minimal for Phase A.
- Storage structure to integrate with ProfileService later (`{ offsetMs: number, updatedAt: number }`).

## Integration Steps
1. Implement `LatencyService` with in-memory storage and event emissions.
2. Instantiate service in `GameScene` (or game bootstrap) and pass offset to BeatClock.
3. Expose service via a simple singleton/factory until ProfileService exists.
4. Update BeatClock usage in `GameScene` to call `beatClock.setLatencyOffset(latencyService.getOffset())` when stage loads.
5. Document hooks for the upcoming UI wizard and settings menu.

## Testing Considerations
- Unit tests (future) should validate tap averaging, offset persistence, and event emission.
- For now, log calibration results in `docs/dev-journal.md` when manual testing occurs.

## Open Questions
- Exact location of LatencyService instantiation once ProfileService lands (likely in boot/preload).
- Whether to support per-device offsets; defer to later phase.

## Next Actions
- Senior Core Engineer: scaffold `src/systems/LatencyService.ts` with offset storage and set/get behavior.
- Gameplay Engineer: ensure `GameScene` applies latency before BeatClock starts.
- UI Engineer: plan wizard UI to drive `beginCalibration`/`recordTap`/`completeCalibration`.
