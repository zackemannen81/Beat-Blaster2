# Add Config Schema Validation Pipeline

**Task ID:** CORE-015

**Status:** IN_PROGRESS

**Description:**

Set up schema validation for game content JSON (weapons, enemies, waves, worlds, shop) so malformed data fails fast during load.

**Acceptance Criteria:**

- Define Zod/Ajv schemas for each content type and run validation during preload.
- CLI or npm script reports validation errors with file and property context.
- CI fails when content validation fails; documented workflow for adding new schemas.
