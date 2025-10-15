
# Social Features

This document describes the implementation of the social features in Beat Blaster 2, including Leaderboards, Achievements, and Player Profiles.

## Leaderboards

The leaderboard system allows players to compete for high scores on each track and difficulty level.

### Data Structure

The leaderboard data is stored in `src/net/onlineLeaderboard.ts` in the `MOCK_LEADERBOARDS` object. The data is structured as a nested object, with the track ID as the first key and the difficulty (`easy`, `normal`, `hard`) as the second key. The value is an array of `ScoreEntry` objects, where each object contains a `name` and a `score`.

### API

The `onlineLeaderboard.ts` file exports two functions for interacting with the leaderboard:

- `getScores(trackId: string, difficulty: string): Promise<ScoreEntry[]>`: Fetches the leaderboard for a given track and difficulty.
- `submitScore(trackId: string, difficulty: string, name: string, score: number): Promise<void>`: Submits a new score to the leaderboard.

## Achievements

The achievement system rewards players for completing certain tasks.

### Data Structure

Achievements are defined in `src/config/achievements.json`. Each achievement has an `id`, a `name`, a `description`, and a `criteria` object that specifies the conditions for unlocking the achievement.

### Achievement System

The `AchievementSystem` in `src/systems/AchievementSystem.ts` is responsible for managing achievements. It loads achievement definitions, tracks player progress, and unlocks achievements when the criteria are met. Unlocked achievements are saved to the player's local storage.

When an achievement is unlocked, the `AchievementSystem` dispatches a global `achievement_unlocked` event. The HUD listens for this event and displays a notification.

### Adding New Achievements

To add a new achievement, simply add a new entry to the `src/config/achievements.json` file.

## Player Profiles

The profile system stores player information, including stats and unlocked achievements.

### Data Structure

Player profiles are managed by `ProfileService` and include display name, avatar, stats (kills, score, games played), and unlocked achievements.

### Profile System

Profiles are now managed by `ProfileService` (`src/systems/ProfileService.ts`), which persists data through the SaveService and tracks run stats at the end of each game.
