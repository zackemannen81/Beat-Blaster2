# Senior Core Engineer Playbook

## Mission
Own the rhythm-centric backbone of Beat Blaster v1.0. Deliver the event bus, BeatClock accuracy, latency compensation, and modular structure that every other squad depends on.

## Where to Start
1. Read `docs/V1_DEVELOPMENT_PLAN.md` (Phases A, D, F) and `docs/EXTENDED_ROADMAP.md` sections 2.1–2.8 to internalize system targets.
2. Audit current runtime in `src/` (especially `main.ts`, `scenes/`, `systems/`) to map legacy coupling and note refactor risks.
3. Review tasks `CORE-006` through `CORE-017` under `tasks/core/` and log open questions in `docs/dev-journal.md`.

## Priority Deliverables
- `CORE-006` Event Bus, `CORE-007` BeatClock API, `CORE-008` Latency Service, and `CORE-009` modular restructure form Sprint 1 success criteria.
- Extend schema validation (`CORE-015`), save/profile stack (`CORE-010`, `CORE-011`), and performance instrumentation (`CORE-017`) before content ramp-up.
- Partner with QA on `CORE-016` CI to keep lint/test/build green.

## Collaboration
- Pair with the Tools Engineer on folder migrations and editor data schemas; keep APIs typed and documented.
- Block gameplay teams early if BeatClock signatures change; socialize updates in the daily sync and `docs/dev-journal.md`.
- Provide QA with deterministic test hooks (seeded RNG, mockable clock) to stabilize automation.

## Daily Rhythm
- Start with CI and `npm run test`; investigate regressions before feature work.
- Maintain a living migration guide for path alias changes and service contracts.
- Log architectural decisions and timing tolerances in `docs/dev-journal.md` for downstream squads.

## Communication Cadence
- Systems/tools stand-up with Tools Engineer + QA daily.
- Bi-weekly review with Producer/PM to de-risk upcoming dependencies.
- Async handoffs via pull-request templates including task IDs and timing metrics.
