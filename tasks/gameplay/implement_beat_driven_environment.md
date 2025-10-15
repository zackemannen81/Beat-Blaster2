# Implement Beat-Driven Environmental Hazards

**Task ID:** GAMEPLAY-026

**Status:** OPEN

**Description:**

Add stage elements (doors, shutters, lasers) that open, close, or pulse on specific beats to reinforce rhythm-driven level flow.

**Acceptance Criteria:**

- Hazards subscribe to BeatClock events and expose config for beat pattern and telegraph timing.
- Player feedback (VFX/SFX) communicates safe vs. dangerous windows clearly.
- Hazards integrate with wave data and do not introduce unfair unavoidable damage.
