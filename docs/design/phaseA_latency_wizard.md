# Phase A Latency Calibration Wizard (UI-011)

## Objectives
Provide an in-game flow where players tap along to the beat to calibrate latency. The wizard should guide the user through instructions, capture samples, preview adjustments, and commit the offset to ProfileService/LatencyService.

## Flow Outline
1. Entry point from Settings/Profile menus (`Calibrate Latency`).
2. Screen 1: Instructions + Start button.
3. Screen 2: Countdown (3-2-1) then calibration phase – highlight beat arc, collect taps for ~20 beats.
4. Screen 3: Preview results – show computed offset, allow replay with adjusted beat indicator.
5. Actions: Apply (writes to ProfileService settings), Retry (restart sampling), Cancel (discard changes).

## Data & Services
- `LatencyService.beginCalibration()`, `recordSample(deltaMs)`, `completeCalibration()` used to compute median offset.
- ProfileService `updateSettings` to persist `inputOffsetMs` on Apply.
- EventBus `latency:changed` already updates BeatClock globally.

## Wizard Scene Components
- `createCalibrationScene` with states: `idle`, `countdown`, `sampling`, `preview`.
- Use `BeatClock` progress via EventBus for visual cues (reuse RhythmRing).
- Capture user taps via keyboard (`SPACE`) + gamepad button.
- Store sample `(tapTimestamp - expectedBeatTimestamp)` using `latencyService.msUntilNextBeat()`/`msSinceLastBeat()`.

## UI Requirements
- Display instructions text at top, beat circle center, progress meter bottom.
- Show live sample count & estimated offset during sampling.
- Preview shows before/after latency with apply/cancel buttons.
- Respect reduced motion settings and colorblind palettes.

## Implementation Steps
1. Add new scene `LatencyCalibrationScene` in `src/scenes/` handling state machine and visuals.
2. Reuse RhythmRing for beat visualization (pass in colorblind/reduced motion from Profile settings).
3. Register scene in Menu/Options flow (Settings UI adds `Calibrate Latency` button).
4. On Apply, call `latencyService.completeCalibration()` and `profileService.updateSettings(activeId, { inputOffsetMs: snapshot.offsetMs })`.
5. Debounce in ProfileService triggers autosave automatically.

## Next Actions
- Implement `LatencyCalibrationScene` skeleton with instructions and placeholder beat handling.
- Hook up Menu/Options button to launch the scene.
- Iterate on visuals and validation once basic flow works.
