# Gameplay Engineer Playbook

## Mission
Transform Beat Blaster’s prototype into a responsive, beat-synced combat experience across weapons, abilities, enemies, and bosses.

## Where to Start
1. Read `docs/EXTENDED_ROADMAP.md` sections 2.1–4.8 and `docs/V1_DEVELOPMENT_PLAN.md` Phases B–E.
2. Run `npm install`, `npm run dev`, and `npm run test` to baseline the current game and test suite.
3. Review tasks `GAMEPLAY-013` through `GAMEPLAY-027` plus `GAMEPLAY-024` in `tasks/gameplay/`; flag unknowns in `docs/dev-journal.md`.

## Priority Deliverables
- Sprint 2: Player movement/dash (`GAMEPLAY-014`), bomb rework (`GAMEPLAY-017`), beat accuracy windows (`GAMEPLAY-013`).
- Sprint 3: Reactive enemy archetypes and wave intensity layers (`GAMEPLAY-018`, `GAMEPLAY-019`).
- Sprints 4–7: Ability framework, loadouts, weapon progression, stage modifiers, boss encounter, Sector 1 content.

## Collaboration
- Pair with the Senior Core Engineer for BeatClock hooks and timing guarantees.
- Co-design mechanics with the Combat Designer; validate feel in playtests before locking values.
- Coordinate with UI Engineer so HUD can surface new stats and states (combo, abilities, modifiers).

## Engineering Practices
- Keep gameplay systems modular and data-driven; load stats from `config/` to empower designers.
- Write Vitest coverage for combo math, ability cooldowns, and wave sequencing—QA will build on these.
- Document tuning changes and playtest results in `docs/dev-journal.md` under your task ID.

## Daily Rhythm
- Play a fresh build each morning on keyboard and gamepad; log issues immediately.
- Stand up with Combat Designer + Level Designer to align on upcoming beats and enemy mixes.
- Use feature flags for unfinished systems; remove dead code after integration tests pass.
