# Phase A Save Service Plan (CORE-010)

## Purpose
Manage profile persistence for the single-player prototype using JSON files with schema versioning and rolling backups. Must cooperate with ProfileService and future systems (economy, achievements).

## Requirements
- Store all profiles plus active profile id in `saves/profiles.json` (workspace-relative).
- Include schema version (`version`) and metadata (`savedAt`).
- Provide migrations map `Record<number, (data) => data>` to upgrade older saves.
- Create rolling backups (`profiles.bak1.json`, `profiles.bak2.json`) before overwriting.
- Expose async API for load/save to keep door open for async storage later.
- Validate data structure before writing ProfileService; fallback to default profile on corruption.

## Proposed API
`src/systems/SaveService.ts`
```ts
interface SavePayload {
  version: number
  savedAt: number
  data: ProfileSaveData
}

class SaveService {
  loadProfiles(): Promise<ProfileSaveData | null>
  saveProfiles(data: ProfileSaveData): Promise<void>
  registerMigration(version: number, fn: (payload: SavePayload) => SavePayload): void
  getCurrentVersion(): number
}
```
- Default version = 1.
- Use `fs/promises` when available; in browser fallback to localStorage (for dev). Since CLI running in Node, implement Node path with graceful catch.

## Integration Plan
1. Implement SaveService with Node filesystem support (using `window.require` guard) and browser localStorage fallback.
2. Hook ProfileService hydrate/serialize to SaveService load/save on startup and on profile changes.
3. Add simple auto-save debounce (e.g., 1 second) to avoid frequent writes.
4. Expose manual `saveNow()` for future menus.
5. Document save file location and recovery instructions.

## Testing Strategy
- Manual testing: switch profiles, reload process, confirm data persists.
- Future vitest tests can mock fs/localStorage to verify migrations/backups.

## Open Questions
- Multiplayer or cloud sync (out of scope).
- Encryption/obfuscation for production (deferred).

## Next Actions
- Implement SaveService with Node + localStorage fallback and backup rotation.
- Update ProfileService to call `hydrate`/`serialize` through SaveService.
- Log activity in dev journal and update agent playbooks.
