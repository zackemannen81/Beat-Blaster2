# Refactor Asset Management

**Task ID:** CORE-001

**Description:**

The current asset management system is a bit messy. This task involves refactoring the asset loading and management to be more organized and efficient. This includes:

- Creating subdirectories in `src/assets` for different asset types (e.g., `images`, `audio`, `fonts`, `shaders`).
- Creating a centralized asset manifest to define all assets and their paths.
- Implementing a system for loading assets on demand to reduce initial load times.
