# Rebuild Player Movement and Dash

**Task ID:** GAMEPLAY-014

**Status:** OPEN

**Description:**

Revise the player controller with acceleration/deceleration curves, tuned collision boxes, and a beat-synced dash mechanic with invulnerability frames.

**Acceptance Criteria:**

- Movement uses configurable acceleration/drag delivering responsive "magnetic" feel without drift.
- Dash grants at least 12 frames of i-frames, extends distance by ≥40% on Perfect beats, and respects cooldowns.
- Hurtboxes align to ship art (≤90% sprite bounds) and difficulty settings adjust leniency.
