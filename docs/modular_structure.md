# Modular Architecture

The project is structured into the following domain-focused folders:

*   `src/core/`: Core systems like the EventBus.
*   `src/audio/`: Audio-related systems like the BeatClock.
*   `src/systems/`: Shared systems that don't fit into other categories.
*   `src/gameplay/`: Gameplay-specific systems like Powerups, Scoring, Spawner, etc.
*   `src/ui/`: UI components like the HUD and menus.
*   `src/config/`: Game configuration files.
*   `src/content/`: Game assets like audio, images, and fonts.
*   `src/net/`: Networking-related code for leaderboards, etc.
*   `src/editor/`: The level editor code.
*   `src/types/`: Shared TypeScript types and interfaces.
*   `src/scenes/`: Phaser scenes.

## Path Aliases

The following path aliases are configured in `tsconfig.json` to make it easier to import modules from different parts of the application:

*   `@core/*`: `src/core/*`
*   `@audio/*`: `src/audio/*`
*   `@systems/*`: `src/systems/*`
*   `@gameplay/*`: `src/gameplay/*`
*   `@ui/*`: `src/ui/*`
*   `@config/*`: `src/config/*`
*   `@content/*`: `src/content/*`
*   `@net/*`: `src/net/*`
*   `@editor/*`: `src/editor/*`
*   `@types/*`: `src/types/*`
*   `@scenes/*`: `src/scenes/*`
