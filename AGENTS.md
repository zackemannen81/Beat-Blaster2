# Repository Guidelines
These notes keep Beat Blaster 2 contributions consistent.

## Project Structure & Module Organization
- `src/` holds all TypeScript: `scenes/` for Phaser screens, `systems/` for shared gameplay, `editor/` for the level tools, and `ui/` overlays.
- Runtime data sits in `src/assets/` and `src/config/`; Vite copies both on build, so respect their structure.
- Planning material lives in `docs/` (notably `dev-journal.md`) and work briefs in `tasks/`; update them whenever gameplay or tooling shifts.
- Tooling is configured at the root (`tsconfig.json`, `vite.config.ts`, `vitest.config.ts`); extend those files instead of adding ad-hoc configs.

## Build, Test, and Development Commands
- `npm install` pulls dependencies tracked by `package-lock.json`.
- `npm run dev` starts Vite on port 5173 with hot reload.
- `npm run build` produces the production bundle and stages static assets under `dist/src/`.
- `npm run preview` validates the bundle locally; `npm run test` executes the Vitest suite and should pass before every PR.

## Coding Style & Naming Conventions
- Two-space indentation, single quotes, and strict TypeScript are the baseline—mirror the surrounding file.
- Classes and scenes use `PascalCase`, functions and variables use `camelCase`, and reserve `UPPER_SNAKE_CASE` for constants.
- Share cross-scene helpers via `systems/` or the `@scenes/*` alias defined in `tsconfig.json`.
- Wrap Phaser side effects in thin scene classes and keep pure utilities exported for testing.

## Testing Guidelines
- Co-locate new specs as `*.test.ts` files next to the code they cover.
- Leverage Vitest's node environment; stub Phaser APIs rather than launching the full game loop.
- Target new logic and regression paths, and call out unavoidable gaps in the PR description.

## Commit & Pull Request Guidelines
- Run `git config core.hooksPath .githooks`; the pre-commit hook blocks `main` commits and requires a `Task ID:` line.
- Branch names follow `feature/<summary>` or `fix/<summary>`; align them with the relevant file in `tasks/`.
- Write imperative commit titles plus a Task ID (`feat: add bomb meter HUD` + `Task ID: UI-004`).
- PRs need a clear scope, test evidence, linked task/doc updates, and screenshots for UI shifts.

## Work Coordination
- Log progress in `docs/dev-journal.md` from the coordination worktree before pushing feature code.
- Fetch in both worktrees regularly so task status stays current.
- When touching shared assets or configs, flag downstream impacts in the journal and PR notes.
