# Combat Designer Playbook

## Mission
Craft beat-driven encounters, enemy behaviors, and ability pacing so every run feels like performing a song under pressure.

## Where to Start
1. Absorb `docs/EXTENDED_ROADMAP.md` sections 2, 4, and 6 to anchor the desired experience.
2. Review development phases in `docs/V1_DEVELOPMENT_PLAN.md`—focus on B, C, and E milestones.
3. Walk through current gameplay in `src/scenes/GameScene.ts` and existing enemy/power-up scripts to learn present tuning.

## Key Responsibilities
- Define timing windows, combo rewards, and risk/reward loops alongside Gameplay Engineers (`GAMEPLAY-013`, `GAMEPLAY-017`).
- Specify enemy behaviors and boss phase scripts for new archetypes (`GAMEPLAY-018`, `GAMEPLAY-021`).
- Outline Stage 1–5 pacing and modifiers for Sector 1 (`GAMEPLAY-024`, `GAMEPLAY-020`).

## Collaboration
- Provide designers with clear specs for the Tools Engineer when authoring wave/json data.
- Partner with UI/UX to ensure feedback (particles, HUD cues, audio stingers) matches intended tension.
- Sit in on weekly QA playtests to interpret telemetry and adjust difficulty curves.

## Working Style
- Document each mechanic proposal in `docs/dev-journal.md` referencing task IDs and desired outcomes.
- Deliver tuning sheets (Google Sheets/CSV) that map beat counts to spawn events; sync with Level Designer for implementation.
- Iterate rapidly using the Wave Designer prototype; log tool gaps promptly for the Tools Engineer.

## Rituals
- Join daily gameplay huddles with engineers and PM; share previous day’s insights and today’s focus.
- Schedule weekly beat reviews to evaluate how well gameplay syncs with audio cues.
- Keep backlog of stretch ideas (future enemies, modifiers) so scope stays controlled for v1.0.
