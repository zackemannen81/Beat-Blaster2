# Beat Blaster: Neon Overdrive – v1.0 Development Plan

## Overview
This plan translates the EXTENDED_ROADMAP into a concrete delivery path from v0.5 to a polished v1.0. Work is organized into eight two-week sprints grouped under six phases. Each phase lists the roadmap goals it satisfies, the new task IDs that track the work, dependencies, and exit criteria. Cross-cutting threads (tooling, QA, content) run in parallel and have their own checkpoints.

## Timeline by Phase
| Phase | Sprint(s) | Focus | Exit Criteria |
| --- | --- | --- | --- |
| A. Rhythm Core & Architecture | 1 | BeatClock, EventBus, modular restructure | Beat systems drive HUD prototype; new folder layout builds cleanly |
| B. Player Feel & HUD Feedback | 2 | Player controller, dash, HUD v2, bomb prep | Movement/dash tuned, HUD showing rhythm feedback, latency service hooked |
| C. Enemy & Wave Systems | 3 | Reactive enemies, wave runner, tooling | First intensity-aware waves authored via designer and playable |
| D. Progression & Economy Loop | 4–5 | Scoring 2.0, abilities, save/profile, shop/economy | Runs grant BeatCoins, purchases persist, ability/bomb systems integrated |
| E. Campaign & Content Expansion | 6–7 | World map, Sector 1 content, boss, challenges | Sector 1 playable end-to-end, Syncopate Prime fight complete |
| F. Polish & Release Prep | 8 | Accessibility, balance, CI, performance | Settings suite complete, CI green, release checklist satisfied |

## Phase Details
### Phase A – Rhythm Core & Architecture (Sprint 1)
- Deliverables: Event bus, BeatClock API, latency service scaffolding, modular folder structure, HUD spike.
- Tasks: CORE-006, CORE-007, CORE-008, CORE-009, CORE-015, UI-004 (prototype subset).
- Dependencies: none; can run in parallel with documentation updates.
- Exit criteria: BeatClock drives test harness with ≤10 ms drift; HUD prototype renders Rhythm Ring off sample data; engineers onboarded to new folder layout.

### Phase B – Player Feel & HUD Feedback (Sprint 2)
- Deliverables: Rebuilt movement, beat-synced dash, bomb foundation, HUD v2, combo/score hooks.
- Tasks: GAMEPLAY-014, GAMEPLAY-017, GAMEPLAY-013, UI-004 (final), UI-012, CORE-017.
- Dependencies: Phase A BeatClock/EventBus in place.
- Exit criteria: Playtesters report “tight” controls; combo meter, BeatCoin chip, and bomb meter pulse on beat; latency offsets adjustable through service.

### Phase C – Enemy & Wave Systems (Sprint 3)
- Deliverables: Modular enemy behaviors, intensity-aware wave runner, beat-driven hazards, authoring tools.
- Tasks: GAMEPLAY-018, GAMEPLAY-019, GAMEPLAY-026, EDITOR-008, EDITOR-009, CORE-015 (schema coverage expanded).
- Dependencies: EventBus + BeatClock; HUD ready to visualize combos.
- Exit criteria: Designers can author waves with new tool and preview them; four new enemy archetypes functional; hazards sync to beat without fairness issues.

### Phase D – Progression & Economy Loop (Sprints 4–5)
- Deliverables: Loadouts, ability framework, scoring/rank system, BeatCoin economy, save/profile stack, shop UI, ability upgrades.
- Tasks: GAMEPLAY-015, GAMEPLAY-016, GAMEPLAY-022, GAMEPLAY-023, GAMEPLAY-027, CORE-010, CORE-011, CORE-012, CORE-013, CORE-014, UI-005, UI-008, UI-009, UI-012 (polish), UI-013, EDITOR-011.
- Dependencies: Game data validation (CORE-015) and performance instrumentation (CORE-017).
- Exit criteria: Completing a stage grants BeatCoins and stars, records leaderboard-ready stats, allows purchases that persist. Ability upgrades and loadouts affect subsequent runs. Profiles switch without restarting.

### Phase E – Campaign & Content Expansion (Sprints 6–7)
- Deliverables: World map, Sector 1 stages, Syncopate Prime boss, daily/weekly challenges, world map tooling, stage results flow, boss cinematics.
- Tasks: GAMEPLAY-020, GAMEPLAY-021, GAMEPLAY-024, GAMEPLAY-025, UI-005 (final polish), UI-007, UI-014, UI-013, CORE-014 (challenge buckets), EDITOR-010, EDITOR-008/009 (content iteration).
- Dependencies: Shop/economy live, save/profile stable.
- Exit criteria: Sector 1 (5 stages + boss) playable start-to-finish from world map, with boss intros/outros and challenge cards visible. Stage complete screen feeds unlocks to world map.

### Phase F – Polish & Release Prep (Sprint 8)
- Deliverables: Settings & accessibility suite, latency wizard, calibration UI, performance pass, CI pipeline, documentation, QA bug bash.
- Tasks: UI-010, UI-011, UI-006 (cinematic polish), UI-008 (achievement polish), CORE-016, CORE-017 (final tuning), CORE-008 (wizard integration), CORE-012 (balance pass), CORE-013 (achievement content), UI-009 (pricing adjustments).
- Dependencies: All core systems integrated.
- Exit criteria: Settings cover all required toggles, latency wizard repeatability ±3 ms, CI green for lint/test/build, release checklist and changelog complete, performance verified at 60 FPS with effects enabled.

## Cross-Cutting Tracks
- **Content & Narrative:** GAMEPLAY-024, UI-014, CORE-013. Coordinate weekly with design to ensure lore nodes, achievements, and boss narratives unlock coherently.
- **Tooling & Data Integrity:** EDITOR-008/009/010/011 and CORE-015 ensure designers can ship content safely; schedule schema reviews every sprint.
- **Testing & QA:** CORE-016, CORE-017, GAMEPLAY-013. Target ≥70% unit coverage on core services, add integration scenarios for BeatClock, WaveRunner, EconomyService, and Save migrations.
- **Live Ops Prep (Optional backlog):** GAMEPLAY-025, CORE-014 leave hooks for future online leaderboards; document API contracts.

## Risk Management
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Beat/audio drift on varied hardware | Undermines rhythm fantasy | Complete CORE-007 accuracy tests, ship latency wizard (UI-011) early, run soak tests on target hardware |
| Scope creep in weapons/enemies | Delays campaign content | Lock feature set post Sprint 5; defer extra archetypes to backlog; enforce data-driven additions |
| Save schema instability | Player progression loss | Versioned saves (CORE-010), migration tests, automated backups |
| Performance regressions from VFX | Impacts playability | CORE-017 instrumentation, staged FX rollouts, low-spec profile in settings |
| Tooling bottlenecks | Designers blocked | Prioritize EDITOR-008/009 in Sprint 3, hold tool feedback sessions weekly |

## Definition of Done (per feature)
- Feature guarded behind config until complete; no new lint/test failures; documentation updated (docs/dev-journal.md + relevant guides); telemetry/log hooks wired (via CORE-006/017).
- UI elements meet accessibility requirements (UI-010) and support controller + mouse.
- Runbooks updated for save data migrations and challenge rotations.

## Release Checklist Snapshot
- Sector 1 stages + Syncopate Prime boss cleared internally on Standard and Hardcore difficulty.
- BeatClock accuracy verified post-calibration across three reference machines.
- Shop pricing curve vetted; no soft locks without grind (CORE-012, UI-009).
- CI (CORE-016) green on release tag; build artifacts archived.
