# Implement BeatClock Timing API

**Task ID:** CORE-007

**Status:** OPEN

**Description:**

Build a deterministic BeatClock service that exposes beat callbacks, sub-beat divisions, and timing window checks so gameplay and UI elements stay synced to music.

**Acceptance Criteria:**

- API exposes `onBeat`, `onSubBeat(division)`, `isWithinWindow(ms)`, and `getBeatProgress()`.
- Supports configurable BPM, song offset, and latency compensation.
- Unit tests cover beat drift tolerance (≤10 ms over 3 minutes) and subdivision accuracy.
