# Enemy System

This document provides a comprehensive overview of the enemy system in Beat Blaster 2, including enemy types, spawning mechanics, and behaviors.

## Enemy Types

The game features a variety of enemy types, each with unique movement patterns and behaviors:

- **Lane Hoppers:** Jump between two lanes on the beat.
- **Weavers:** Move in sine waves across multiple lanes.
- **Formation Dancers:** Fly in formations and rotate or change positions on the beat.
- **Exploders:** Slowly move towards the player and explode if not destroyed in time.
- **Mirrorers:** Mirror the player's horizontal movement.
- **Teleporters:** Disappear and reappear in different lanes on the beat.
- **Lane Flooders:** Fill an entire lane, forcing the player to move.
- **Bosses:** Large, durable enemies with complex, beat-based attack patterns.

## Spawning Mechanics

Enemy spawning is handled by the `Spawner` and `WaveDirector` systems.

- **`WaveDirector`:** Schedules waves of enemies based on the current difficulty profile and stage. It uses a combination of pre-defined wave playlists and a deterministic 16-beat loop to create varied and challenging enemy encounters.
- **`Spawner`:** Responsible for creating and positioning enemies. It provides methods for spawning individual enemies, waves of enemies in different formations, and bosses.

### Formations

The `Spawner` can create enemies in a variety of formations:

- **Lane:** Enemies spawn in a single lane.
- **Sine Wave:** Enemies spawn in a sine wave pattern.
- **V-Formation:** Enemies spawn in a V-shape.
- **Swirl:** Enemies spawn in a swirling pattern.
- **Circle:** Enemies spawn in a circular pattern.
- **Spiral:** Enemies spawn in a spiral pattern.

## Enemy Lifecycle

The `EnemyLifecycle` system manages the lifecycle of active enemies.

- **Registration:** When an enemy is spawned, it is registered with the `EnemyLifecycle` system.
- **Updates:** The system checks for out-of-bounds enemies and timeouts, and removes them from the game as needed.
- **Expiration:** When an enemy is removed, the `onExpire` callback is invoked, which can trigger scoring penalties or other game events.

## Behavior and AI

Enemy behavior is determined by the `pattern` data assigned to each enemy when it is spawned. The `GameScene` updates the position of each enemy based on its pattern.

- **Lane Hoppers:** The `lane_hopper` pattern causes the enemy to jump between two lanes on the beat.
- **Weavers:** The `weaver` pattern causes the enemy to move in a sine wave.
- **Formation Dancers:** The `formation_dancer` pattern causes the enemy to rotate around a central point with other enemies in the formation.
- **Mirrorers:** The `mirrorer` pattern causes the enemy to mirror the player's horizontal movement.
- **Teleporters:** The `teleporter` pattern causes the enemy to disappear and reappear in a different lane on the beat.
