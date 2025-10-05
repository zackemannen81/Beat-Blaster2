# Announcer System

This document provides a comprehensive overview of the announcer system in Beat Blaster 2, including voice clips, triggers, and implementation details.

## System Overview

The announcer system is responsible for playing voice clips in response to in-game events. The central logic is handled by the `Announcer` class in `src/systems/Announcer.ts`.

- **Event-Driven:** The system is event-driven, with the `GameScene` dispatching announcer events for game flow, powerups, combos, bombs, and wave telegraphs.
- **Voice Profiles:** The system supports multiple voice profiles, each with its own set of voice clips. The currently supported voices are `default`, `bee`, and `cyborg`.
- **Priority and Cooldowns:** The system manages priorities and cooldowns to prevent voice clips from overlapping or playing too frequently.

## Voice Clips

Voice clips are defined in the `VOICE_CLIPS` constant in `src/systems/Announcer.ts`. Each voice profile has a record of event keys and their corresponding audio keys.

### Triggers

The following events can trigger announcer voice clips:

- **`new_game`:** When a new game starts.
- **`get_ready`:** After a boss is defeated.
- **`boss`:** When a boss spawns.
- **`warning`:** When a heavy telegraph or scripted danger occurs.
- **`enemies_approching`:** When a non-heavy telegraph occurs.
- **`powerup`:** When a powerup is picked up.
- **`shield` / `rapid_fire` / `split_shot` / `slowmo`:** When a specific powerup is picked up.
- **`bomb_ready`:** When the bomb meter is full.
- **`combo`:** When the player reaches a combo milestone (10, 20, 30, etc.).

## Implementation Details

- **`Announcer` Class:** The `Announcer` class is responsible for managing the announcer system. It is initialized in the `GameScene` and provides methods for playing voice clips for different events.
- **`playClip` Method:** The `playClip` method is the core of the announcer system. It resolves the appropriate audio key for the given event and voice profile, and then plays the sound.
- **`resolveClipKeys` Method:** This method resolves the audio key for a given event and voice profile. It first checks the current voice profile, then the `default` profile, and finally falls back to a generic key.

## Adding New Voice Clips

To add a new voice clip, you need to:

1.  Add the audio file to the `src/assets/audio/sfx/voices` directory.
2.  Add a new entry to the `VOICE_CLIPS` constant in `src/systems/Announcer.ts` for the new voice clip.
3.  Call the `playAudioKey` method in the `Announcer` class to play the new voice clip in response to a game event.
