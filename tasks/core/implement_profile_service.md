# Implement Profile Service

**Task ID:** CORE-011

**Status:** OPEN

**Description:**

Introduce a ProfileService that supports multiple player profiles, avatar selection, stats aggregation, and per-profile settings.

**Acceptance Criteria:**

- Can create, rename, switch, and delete profiles without restarting the game.
- Exposes API for retrieving stats, achievements, cosmetics, and preferences.
- Integrates with SaveService and notifies UI of profile changes via EventBus.
