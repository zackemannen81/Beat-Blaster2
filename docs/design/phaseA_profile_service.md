# Phase A Profile Service Plan (CORE-010)

## Goals
- Provide an in-memory profile manager that can switch between named profiles, surface stats/settings, and coordinate with SaveService once available.
- Expose events for profile changes so UI and systems respond immediately.
- Persist latency offsets, settings, and runtime stats when SaveService integration is ready.

## Requirements
- Support multiple profiles with metadata: `id`, `name`, `avatar`, `createdAt`, `lastPlayedAt`, `settings`, `latency`, `stats`.
- Provide methods to create, delete (soft), rename, and activate profiles.
- Serialize profile list for SaveService consumption (`ProfileSaveData`), even if SaveService is still a stub.
- Emit `profile:changed` when the active profile changes, and `profile:updated` when metadata updates.
- Offer convenience getters for downstream services (Economy, Latency, Achievements).

## Proposed API
`src/systems/ProfileService.ts`
```ts
interface ProfileSettings {
  musicVolume: number
  sfxVolume: number
  reducedMotion: boolean
  colorblindMode: boolean
  inputOffsetMs: number
}

interface ProfileRecord {
  id: string
  name: string
  avatar: string
  createdAt: number
  lastPlayedAt: number
  settings: ProfileSettings
  stats: ProfileStats
  currency: number
}

class ProfileService {
  getActiveProfile(): ProfileRecord | undefined
  getAllProfiles(): ProfileRecord[]
  setActiveProfile(id: string): void
  createProfile(payload: Partial<ProfileRecord>): ProfileRecord
  renameProfile(id: string, name: string): void
  deleteProfile(id: string): void
  updateSettings(id: string, settings: Partial<ProfileSettings>): void
  applyCurrencyDelta(delta: number): number
  serialize(): ProfileSaveData
  hydrate(data: ProfileSaveData): void
}
```

## EventBus Extensions
- `profile:changed` → `{ id: string; profile: ProfileRecord }`
- `profile:updated` → `{ id: string; profile: ProfileRecord }`

## Integration Plan
1. Implement the ProfileService with simple in-memory storage and a singleton export.
2. Extend EventBus payloads with `profile:changed` and `profile:updated`.
3. Update EconomyService/LatencyService to pull data from active profile once SaveService lands (future work).
4. Provide placeholder persistence via `serialize()`/`hydrate()` so SaveService can plug in later.
5. Log default profile creation in dev journal for visibility.

## Testing Strategy
- Add unit tests later (after SaveService) to validate create/switch/delete flows.
- For now, manual testing through dev console or integration with upcoming UI screens.

## Open Questions
- Avatar asset pipeline: rely on static list for now; UI can validate IDs.
- Soft delete vs hard delete: begin with soft removal (preserve data until SaveService confirms deletion).

## Next Actions
- Scaffold `ProfileService.ts` with default profile creation and event emission.
- Wire `latencyService.loadFromProfile` as a temporary call when profile switches.
- Update dev-journal after scaffolding and run build to ensure no regressions.
