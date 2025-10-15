# Implement Performance Monitoring & Object Pooling

**Task ID:** CORE-017

**Status:** OPEN

**Description:**

Instrument the game with lightweight performance diagnostics (FPS, beat lag, object counts) and introduce pooled projectiles/FX to keep GC pressure low.

**Acceptance Criteria:**

- Provides in-game debug overlay toggled via dev flag showing FPS, beat delta, active entities, pool usage.
- Replaces hot-path projectile/effect instantiation with pool reuse; GC allocations per frame stay near zero during heavy combat.
- Document guidelines for adding new pooled objects and profiling workflow.
