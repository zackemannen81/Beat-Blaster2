# Phase A HUD v2 (UI-004) Notes

## Implemented
- Added `RhythmRing` component that listens to beat events and visualizes timing windows with per-judgement pulses.
- HUD now subscribes to `beat:tick`, `beat:window`, and `currency:changed` via EventBus, keeping combo, BeatCoins, and rhythm cues in sync.
- BeatCoin tracker renders near the top-right corner and updates whenever the EconomyService emits currency changes.
- Added ability overlay (`AbilityOverlay`) displaying bomb charge and ability cooldown tiers with beat-ready highlights.
- Added accessibility hooks: `setReducedMotion` and new `setColorblindMode` propagate to the Rhythm Ring and ability overlay.

## Next Steps
- Polish ability overlay visuals (icons, tooltip styling) and hook into real ability systems once implemented.
- Integrate colorblind toggle once accessibility settings surface the option.
- Add automated visual tests or snapshots around RhythmRing rendering when QA tooling is available.
