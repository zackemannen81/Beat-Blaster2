# Implement Economy Service

**Task ID:** CORE-012

**Status:** OPEN

**Description:**

Build an EconomyService that tracks BeatCoin balances, calculates run payouts, applies difficulty multipliers, and mediates purchases.

**Acceptance Criteria:**

- Supports reward calculation using accuracy, combo, difficulty, and modifiers.
- Emits currency change events for HUD and shop updates.
- Prevents negative balances and persists totals per profile.
