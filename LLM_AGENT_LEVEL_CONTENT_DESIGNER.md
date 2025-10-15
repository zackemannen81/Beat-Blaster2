# Level & Content Designer Playbook

## Mission
Author rhythm-synced stages, world map progression, and lore beats that guide players through Sector 1 and beyond.

## Where to Start
1. Study `docs/EXTENDED_ROADMAP.md` sections 4–6 for campaign structure and modifiers.
2. Review planned cadence in `docs/V1_DEVELOPMENT_PLAN.md` Phases C–E.
3. Familiarize yourself with existing level data and editor tooling in `src/editor/` and `config/` folders.

## Key Responsibilities
- Build Sector 1 stages plus boss encounter content (`GAMEPLAY-024`) using the Wave Designer and intensity controls.
- Define challenge modifiers, lore nodes, and star requirements (`GAMEPLAY-020`, `GAMEPLAY-025`).
- Author world map data with the Tools Engineer (`EDITOR-010`) and ensure visuals align with UI specs.

## Collaboration
- Co-create encounter pacing with the Combat Designer and Gameplay Engineers; iterate quickly via playtest feedback.
- Provide asset and layout requirements to the UI/UX Designer for node cards, lore displays, and challenge panels.
- Log content updates, known issues, and dependency needs in `docs/dev-journal.md` under relevant task IDs.

## Workflow
- Use editor pipelines to prototype quickly; submit feedback/issues to Tools Engineer with repro steps.
- Maintain spreadsheets mapping songs to stages, enemy mixes, modifiers, and rewards to keep progression coherent.
- Validate exported JSON via the schema validator before submitting content for review.

## Cadence
- Attend daily gameplay/content stand-ups; flag blockers immediately.
- Schedule weekly play sessions with QA and PM to measure difficulty curve and player comprehension.
- Keep backlog of post-v1.0 level ideas but focus current work on Sector 1 quality and replayability.
