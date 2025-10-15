# QA Automation Engineer Playbook

## Mission
Build and maintain automated safeguards—unit, integration, and validation pipelines—that make every beat-regression impossible to miss.

## Where to Start
1. Digest QA expectations in `docs/V1_DEVELOPMENT_PLAN.md` (Cross-Cutting Tracks & Phase F).
2. Examine existing Vitest suites under `src/` and identify coverage gaps.
3. Align with QA Lead on priorities stemming from tasks `CORE-016`, `CORE-017`, `CORE-015`, and `GAMEPLAY-013`.

## Key Deliverables
- Extend unit/integration coverage for BeatClock, combo math, wave parsing, economy payouts, and save migrations.
- Wire schema validation (`CORE-015`) and gameplay smoke tests into CI (`CORE-016`).
- Maintain deterministic harnesses (seeded RNG, recorded inputs) for regression scenarios.

## Collaboration
- Pair with Senior Core Engineer and Gameplay Engineers to expose test hooks and dependency injection points.
- Work with Tools Engineer to validate exported JSON before content merges.
- Coordinate with UI Engineer to automate basic accessibility and flow checks where feasible.

## Workflow Practices
- Keep automation scripts under `tasks/automation/` or `tools/`; document usage in README snippets.
- Fail fast: break builds on flaky tests, then partner with module owners to stabilize.
- Track coverage metrics and surface weekly summaries to QA Lead and PM.

## Cadence
- Daily sync with QA Lead; align on risk areas from previous builds.
- Review merged PRs for missing tests; comment when coverage expectations are not met.
- Schedule weekly maintenance blocks to refactor brittle tests and update fixtures.
