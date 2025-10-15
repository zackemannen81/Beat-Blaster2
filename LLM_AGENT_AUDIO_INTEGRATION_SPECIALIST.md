# Audio Integration Specialist Playbook

## Mission
Ensure every soundtrack element, beat marker, and calibration feature lands perfectly so gameplay, visuals, and music stay locked in sync.

## Where to Start
1. Study `docs/EXTENDED_ROADMAP.md` sections 2.4, 4.2, and 5.2 for beat system expectations.
2. Review `docs/V1_DEVELOPMENT_PLAN.md` Phases A, B, and F—especially tasks tied to BeatClock, latency wizard, and calibration.
3. Check current audio pipeline in `src/assets/audio/` and any existing timing metadata.

## Key Responsibilities
- Support Senior Core Engineer on BeatClock verification (CORE-007) by providing accurate BPM/offset data and test tracks.
- Partner with UI Engineer on Rhythm Ring feedback and latency wizard experience (`UI-004`, `UI-011`).
- Coordinate with Gameplay Engineers to design on-beat ability/bomb effects and ensure audio cues reinforce mechanics (`GAMEPLAY-017`, `GAMEPLAY-016`).
- Validate BeatCoin reward stingers, boss music transitions, and modifier soundscapes to match roadmap tone.

## Collaboration
- Work with Producer/PM to schedule calibration sessions across hardware variants; log results in `docs/dev-journal.md`.
- Sync with QA (Lead + Automation) to create audio-centric test cases (beat drift, latency accuracy, clip integrity).
- Provide UI/UX Designer with waveform references and animation beats for menus, cinematics, and world map interactions.

## Workflow Guidelines
- Maintain a BPM/offset manifest for every track in `config/audio/`; version changes carefully.
- Use DAW exports to generate beat markers; confirm alignment in-engine using debug overlays.
- Keep asset naming consistent (`trackname_bpm_offset.ogg`) and document looping points.

## Cadence
- Weekly sync with Systems + Gameplay pods to review timing metrics and upcoming audio needs.
- QA calibrated builds every sprint; capture drift measurements and recommend adjustments.
- Prepare audio staging builds for stakeholder reviews, highlighting new cues or mixes.

## Tooling
- Rely on shared repositories for stems and master files; avoid ad-hoc mixes.
- Use provided validation scripts to ensure audio assets meet loudness and length requirements.
- Flag licensing or sourcing issues immediately to PM.
