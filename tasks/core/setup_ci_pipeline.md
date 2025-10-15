# Set Up CI Pipeline

**Task ID:** CORE-016

**Status:** OPEN

**Description:**

Configure GitHub Actions (or equivalent) to run install, lint, tests, and production builds on every push and pull request.

**Acceptance Criteria:**

- CI workflow installs dependencies with `npm ci` and caches node_modules.
- Runs `npm run lint`, `npm run test`, and `npm run build`, failing on regressions.
- Publishes build artifacts for tagged releases and documents badge integration for README.
