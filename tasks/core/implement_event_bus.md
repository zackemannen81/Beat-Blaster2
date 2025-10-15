# Implement Event Bus Infrastructure

**Task ID:** CORE-006

**Status:** OPEN

**Description:**

Create a lightweight, typed publish/subscribe event bus that decouples beat, gameplay, economy, and UI systems. The bus must support registering and disposing listeners and work safely across Phaser scenes.

**Acceptance Criteria:**

- Event map covers beat ticks, combo changes, stage completion, currency updates, and player health events.
- Listeners can be registered/deregistered without memory leaks; shutdown clears subscriptions.
- Core systems (BeatClock, Scoring, HUD prototypes) use the shared bus instead of direct coupling.
