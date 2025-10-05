# Difficulty System

This document provides a comprehensive overview of the difficulty system in Beat Blaster 2, including difficulty profiles, stage tuning, and how to create new difficulty profiles.

## System Overview

The difficulty system is driven by difficulty profiles, which are defined in `src/config/difficultyProfiles.ts`. Each profile defines a set of parameters that control the game's difficulty, such as scroll speed, spawn rate, and enemy health.

- **`GameScene`:** Loads the active track and its corresponding difficulty profile.
- **`WaveDirector`:** Schedules waves of enemies based on the rate limits and other parameters defined in the difficulty profile.
- **`Spawner`:** Applies HP multipliers and other properties to enemies based on the current difficulty.

## Difficulty Profiles

Each difficulty profile is a `DifficultyProfile` object with the following properties:

- **`id`:** The unique identifier for the profile (e.g., `easy`, `normal`, `hard`).
- **`label`:** The display name for the profile.
- **`description`:** A brief description of the profile.
- **`baseScrollSpeed`:** The base scroll speed of the game.
- **`baseSpawnRate`:** The base spawn rate of enemies.
- **`baseEnemyHpMultiplier`:** The base HP multiplier for enemies.
- **`baseBossHpMultiplier`:** The base HP multiplier for bosses.
- **`waveDelayMs`:** The delay between waves of enemies.
- **`waveRepeatCooldownMs`:** The cooldown before a wave can be repeated.
- **`fallbackCooldownMs`:** The cooldown for fallback waves.
- **`wavePlaylistId`:** The ID of the wave playlist to use.
- **`laneCount`:** The number of lanes in the game.
- **`missPenalty`:** The penalty for missing a note.
- **`bossMissPenalty`:** The penalty for missing a note during a boss battle.
- **`categoryCooldowns`:** Cooldowns for different wave categories (e.g., `light`, `standard`, `heavy`, `boss`).
- **`heavyControls`:** Controls for heavy waves, including cooldowns, window, and maximum number of simultaneous heavy waves.
- **`stageTuning`:** An array of `StageTuning` objects that define how the difficulty scales as the game progresses.

## Stage Tuning

Each `StageTuning` object defines a set of parameters that control the difficulty for a specific stage:

- **`stage`:** The stage number.
- **`scrollMultiplier`:** A multiplier for the scroll speed.
- **`spawnMultiplier`:** A multiplier for the spawn rate.
- **`enemyHpMultiplier`:** A multiplier for enemy HP.
- **`bossHpMultiplier`:** A multiplier for boss HP.
- **`enemyCap`:** The maximum number of enemies that can be on the screen at once.
- **`maxQueuedWaves`:** The maximum number of waves that can be queued.
- **`maxSimultaneousHeavy`:** The maximum number of simultaneous heavy waves.
- **`heavyCooldownMs`:** The cooldown for heavy waves.

## Creating a New Difficulty Profile

To create a new difficulty profile, you need to:

1.  Add a new `DifficultyProfile` object to the `profiles` constant in `src/config/difficultyProfiles.ts`.
2.  Define the properties for the new profile, including the `id`, `label`, `description`, and all the other parameters.
3.  Create a new wave playlist for the new profile in `src/config/waves`.
4.  Update the `getDifficultyProfile` function in `src/config/difficultyProfiles.ts` to return the new profile.
