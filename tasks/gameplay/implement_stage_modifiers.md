# Implement Dynamic Stage Modifiers

**Task ID:** GAMEPLAY-020

**Status:** OPEN

**Description:**

Introduce beat-triggered stage modifiers (Beat Surge, Overload, Power Surge, Sync Lock, Neon Bloom) that temporarily change rules, rewards, or visuals.

**Acceptance Criteria:**

- Modifier system schedules events within wave data or via DifficultyService.
- Each modifier applies gameplay effects, visual treatment, and UI messaging for its duration.
- Modifiers influence scoring/BeatCoins according to design and scale with difficulty tiers.
