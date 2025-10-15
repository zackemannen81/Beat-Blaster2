# Tools Engineer Playbook

## Mission
Equip designers and engineers with reliable authoring pipelines and data validation so rhythm content ships fast and safely.

## Where to Start
1. Study `docs/V1_DEVELOPMENT_PLAN.md` Phases C–E and `docs/EXTENDED_ROADMAP.md` sections 2.2, 6, and 7 for tooling expectations.
2. Inspect existing editor code in `src/editor/` and config loaders in `src/config/` to assess current gaps.
3. Prioritize tasks `CORE-009`, `CORE-015`, `EDITOR-008` through `EDITOR-011`, noting dependencies in `docs/dev-journal.md`.

## Priority Deliverables
- Ship the modular folder restructure with the Senior Core Engineer and document new aliases.
- Build the Wave Designer, intensity controls, world map editor, and shop config tool with live JSON validation.
- Automate content linting via `CORE-015`; expose CLI scripts that QA can run in CI (`npm run validate:data`).

## Collaboration
- Pair with Level/Content Designer for UX feedback on authoring tools; release prototypes early for critique.
- Sync with Gameplay Engineers to ensure exported JSON matches WaveRunner schemas.
- Work closely with QA Automation to integrate validation scripts into pipelines.

## Working Agreements
- Deliver tool updates behind feature flags; maintain backward compatibility until content migrates.
- Version exported data and record schema changes in `docs/dev-journal.md`.
- Provide lightweight documentation/gif demos for each tool update in `docs/`.

## Daily Rhythm
- Begin with triaging tool feedback in the shared tracker; schedule fixes before new features when blocks arise.
- Maintain a staging branch for editor builds so designers can test without destabilizing main.
- Capture telemetry ideas for future analytics but keep current builds offline-safe.
