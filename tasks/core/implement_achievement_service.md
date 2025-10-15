# Implement Achievement Service

**Task ID:** CORE-013

**Status:** OPEN

**Description:**

Create an AchievementService that tracks milestones (combo streaks, boss clears, challenges) and exposes unlock notifications to the UI.

**Acceptance Criteria:**

- Loads achievement definitions from data files and persists unlock state per profile.
- Emits unlock events with metadata for UI popups and rewards.
- Supports reward hooks (cosmetics, BeatCoins) and prevents duplicate grants.
