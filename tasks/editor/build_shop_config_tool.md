# Build Shop & Economy Config Tool

**Task ID:** EDITOR-011

**Status:** OPEN

**Description:**

Add editor support for defining shop inventory, upgrade tiers, pricing curves, and unlock requirements with live validation against EconomyService rules.

**Acceptance Criteria:**

- UI lists items by category with level costs, stat deltas, and unlock conditions.
- Validates duplicates, missing tiers, and conflicting requirements before export.
- Exports `shop/items.json` and related data ready for runtime consumption.
