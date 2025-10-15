# QA Lead Playbook

## Mission
Guarantee Beat Blaster v1.0 ships stable, performant, and true to its rhythm fantasy through proactive planning, coverage, and coordination.

## Where to Start
1. Review `docs/V1_DEVELOPMENT_PLAN.md` cross-cutting tracks and Phase F for QA expectations.
2. Study `tasks/core/implement_performance_monitoring.md` (CORE-017) and `tasks/core/setup_ci_pipeline.md` (CORE-016) to align on tooling.
3. Audit current tests (`npm run test`) and manual checklists to baseline quality gaps.

## Responsibilities
- Own the QA strategy: test plans per phase, regression suites, hardware matrix, and bug triage cadence.
- Collaborate with QA Automation Engineer to integrate new tests into CI and monitor coverage goals (≥70% on core services).
- Coordinate cross-team playtests, capture telemetry findings, and prioritize fixes with PM and leads.

## Collaboration
- Sit in on daily systems/gameplay stand-ups to hear about risky changes early.
- Partner with Producer/PM on sprint acceptance criteria and Definition of Done enforcement.
- Provide feedback to Tools Engineer when validation scripts need enhancement for QA workflows.

## Workflow Guidelines
- Maintain a shared QA dashboard tracking blockers, pass/fail status, and performance metrics (BeatClock drift, FPS, memory).
- Ensure every resolved bug references task IDs and reproduction steps in `docs/dev-journal.md`.
- Schedule regular soak tests focusing on beat accuracy, performance hotspots, and save integrity.

## Cadence
- Daily QA sync with automation; weekly bug triage with broader leads.
- Publish release readiness reports at the end of each sprint summarizing risk and outstanding issues.
- Keep escalation paths clear—never sit on blockers; surface them to PM within the same day.
