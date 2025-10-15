# Implement Latency Calibration Service

**Task ID:** CORE-008

**Status:** OPEN

**Description:**

Create a latency calibration service that records player input offsets, stores them per profile, and feeds the BeatClock window calculations.

**Acceptance Criteria:**

- Provides API to start/stop calibration sessions and compute median offset.
- Persists offsets via Profile/Save services and reloads on boot.
- Integrates with UI wizard to adjust beat windows in real time.
