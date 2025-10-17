# Refactor Source Structure into Modular Architecture

**Task ID:** CORE-009

**Status:** IN_PROGRESS

**Description:**

Restructure the project into domain-focused folders (`core/`, `audio/`, `systems/`, `gameplay/`, `ui/`, `config/`, `content/`) with clear entry points and path aliases so teams can scale features independently.

**Acceptance Criteria:**

- New folder layout is documented and reflected in `tsconfig.json` path aliases.
- Existing code compiles and runs after relocation with no circular imports.
- Migration guide added to docs describing responsibilities of each module.
