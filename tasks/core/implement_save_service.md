# Implement Save Service with Versioning

**Task ID:** CORE-010

**Status:** OPEN

**Description:**

Develop a SaveService that manages versioned profile data, handles migrations, and maintains rolling backups for corruption recovery.

**Acceptance Criteria:**

- Supports loading/saving JSON profiles with schema version field.
- Provides migration hooks so future schema bumps can upgrade old saves.
- Writes rotating `.bak` files and verifies integrity before overwriting.
