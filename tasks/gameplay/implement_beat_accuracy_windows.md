# Implement Beat Accuracy Windows and Combo System

**Task ID:** GAMEPLAY-013

**Status:** OPEN

**Description:**

Add Perfect/Good/Miss timing windows tied to the BeatClock, with combo multipliers, combo fever, and BeatCoin bonuses for precision.

**Acceptance Criteria:**

- Timing windows default to ±30 ms (Perfect) and ±75 ms (Good) and are configurable per track.
- Combo multiplier increases every 10 Perfect/Good hits, resets on Miss or damage, and triggers Overdrive at 100 combo.
- Score, BeatCoin rewards, and HUD feedback respond instantly to combo changes.
