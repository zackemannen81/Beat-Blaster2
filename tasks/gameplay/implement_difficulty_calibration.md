# Implement Difficulty Calibration

**Task ID:** GAMEPLAY-004

**Description:**

Build a comprehensive difficulty calibration workflow so players can tune the game before playing. The work should cover:

- Latency calibration flow in Options, including audio/visual feedback and persistence.
- Difficulty tuning tools that adjust scroll speed, spawn density, and enemy HP based on calibration results.
- A short guided experience (preview track or scripted segment) that demonstrates the impact of calibration choices.
- Telemetry or logging hooks to help evaluate calibration effectiveness and guide future adjustments.

## Status

- **State:** Completed
- **Notes:** Rebalanced difficulty profiles and lane patterns for calibration workflow, improved wave previews, added custom pattern registration, expanded input handling (double-click bomb), and tuned power-up pacing for post-calibration play.
- **Related Files:** `src/config/difficultyProfiles.ts`, `src/scenes/GameScene.ts`, `src/systems/LanePatternController.ts`, `docs/dev-journal.md`
