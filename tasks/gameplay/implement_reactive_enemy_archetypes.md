# Implement Reactive Enemy Archetypes

**Task ID:** GAMEPLAY-018

**Status:** OPEN

**Description:**

Add Pulse Scouts, Bass Guards, Sync Splitters, and Phase Weavers with modular behavior components that react to beat phases and player accuracy.

**Acceptance Criteria:**

- Movement, shield, teleport, and split behaviors are authored as reusable modules wired through WaveRunner.
- Each new enemy exposes beat-driven weak points or reactions per roadmap spec.
- Difficulty settings adjust spawn composition and behavior aggressiveness without duplicating code.
