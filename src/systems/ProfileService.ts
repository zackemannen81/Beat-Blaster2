import { eventBus } from '../core/EventBus'
import { DEFAULT_ABILITY_IDS } from '../config/abilities'
import { latencyService } from './LatencyService'
import { SaveService } from './SaveService'

export interface ProfileSettings {
  musicVolume: number
  sfxVolume: number
  reducedMotion: boolean
  colorblindMode: boolean
  inputOffsetMs: number
}

export interface ProfileStats {
  playTimeSec: number
  bestScore: number
  perfectHits: number
  stagesCleared: number
  totalScore: number
  totalKills: number
  gamesPlayed: number
}

export interface ProfileRecord {
  id: string
  name: string
  avatar: string
  createdAt: number
  lastPlayedAt: number
  settings: ProfileSettings
  stats: ProfileStats
  currency: number
  archived?: boolean
  achievements: string[]
  abilities: string[]
}

export interface ProfileSaveData {
  activeId: string | null
  profiles: ProfileRecord[]
}

const DEFAULT_SETTINGS: ProfileSettings = {
  musicVolume: 0.8,
  sfxVolume: 0.9,
  reducedMotion: false,
  colorblindMode: false,
  inputOffsetMs: 0
}

const DEFAULT_STATS: ProfileStats = {
  playTimeSec: 0,
  bestScore: 0,
  perfectHits: 0,
  stagesCleared: 0,
  totalScore: 0,
  totalKills: 0,
  gamesPlayed: 0
}

const createId = () => {
  const cryptoObj = (globalThis as any)?.crypto
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID()
  return `profile_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
}

class ProfileService {
  private profiles = new Map<string, ProfileRecord>()
  private activeId: string | null = null
  private saveService = new SaveService<ProfileSaveData>()
  private saveTimeout?: ReturnType<typeof setTimeout>
  private pendingSave = false

  constructor() {
    this.ensureDefaultProfile()
    void this.loadFromStorage()
  }

  getActiveProfile(): ProfileRecord | undefined {
    return this.activeId ? this.profiles.get(this.activeId) : undefined
  }

  getAllProfiles(): ProfileRecord[] {
    return Array.from(this.profiles.values()).filter((p) => !p.archived)
  }

  setActiveProfile(id: string): void {
    const profile = this.profiles.get(id)
    if (!profile) throw new Error(`Profile ${id} not found`)
    this.activeId = id
    profile.lastPlayedAt = Date.now()
    latencyService.loadFromProfile({ offsetMs: profile.settings.inputOffsetMs, updatedAt: profile.lastPlayedAt })
    eventBus.emit('profile:changed', { id, profile })
    this.scheduleSave()
  }

  createProfile(partial: Partial<ProfileRecord> = {}): ProfileRecord {
    const id = partial.id ?? createId()
    const now = Date.now()
    const record: ProfileRecord = {
      id,
      name: partial.name ?? 'Player',
      avatar: partial.avatar ?? 'pilot_default',
      createdAt: now,
      lastPlayedAt: now,
      settings: { ...DEFAULT_SETTINGS, ...partial.settings },
      stats: { ...DEFAULT_STATS, ...partial.stats },
      currency: partial.currency ?? 0,
      archived: false,
      achievements: partial.achievements ?? [],
      abilities: Array.isArray(partial.abilities) && partial.abilities.length > 0
        ? [...partial.abilities]
        : [...DEFAULT_ABILITY_IDS]
    }
    this.profiles.set(id, record)
    if (!this.activeId) {
      this.setActiveProfile(id)
    } else {
      eventBus.emit('profile:updated', { id, profile: record })
      this.scheduleSave()
    }
    return record
  }

  renameProfile(id: string, name: string): void {
    const profile = this.profiles.get(id)
    if (!profile) throw new Error(`Profile ${id} not found`)
    profile.name = name
    this.flagUpdated(profile)
    this.scheduleSave()
  }

  deleteProfile(id: string): void {
    const profile = this.profiles.get(id)
    if (!profile) return
    profile.archived = true
    if (this.activeId === id) {
      this.activeId = null
      const next = this.getAllProfiles()[0]
      if (next) {
        this.setActiveProfile(next.id)
      }
    }
    this.flagUpdated(profile)
    this.scheduleSave()
  }

  updateSettings(id: string, settings: Partial<ProfileSettings>): void {
    const profile = this.profiles.get(id)
    if (!profile) throw new Error(`Profile ${id} not found`)
    profile.settings = { ...profile.settings, ...settings }
    if (typeof settings.inputOffsetMs === 'number' && id === this.activeId) {
      latencyService.setOffset(settings.inputOffsetMs, 'manual')
    }
    this.flagUpdated(profile)
    this.scheduleSave()
  }

  updateAbilities(id: string, abilities: string[]): void {
    const profile = this.profiles.get(id)
    if (!profile) throw new Error(`Profile ${id} not found`)
    const sanitized = abilities.filter((id) => typeof id === 'string' && id.length > 0)
    if (sanitized.length === 0) return
    profile.abilities = [...new Set(sanitized)]
    this.flagUpdated(profile)
    this.scheduleSave()
  }

  applyCurrencyDelta(delta: number): number {
    const profile = this.getActiveProfile()
    if (!profile) throw new Error('No active profile')
    profile.currency = Math.max(0, profile.currency + delta)
    this.flagUpdated(profile)
    this.scheduleSave()
    return profile.currency
  }

  recordRunStats(payload: { score: number; kills: number; accuracy?: number }): void {
    const profile = this.getActiveProfile()
    if (!profile) return
    profile.stats.totalScore += payload.score
    profile.stats.totalKills += payload.kills
    profile.stats.gamesPlayed += 1
    if (payload.score > profile.stats.bestScore) {
      profile.stats.bestScore = payload.score
    }
    this.flagUpdated(profile)
    this.scheduleSave()
  }

  hydrate(data: ProfileSaveData | null | undefined): void {
    if (!data || !Array.isArray(data.profiles)) {
      this.ensureDefaultProfile()
      return
    }
    this.profiles.clear()
    data.profiles.forEach((record) => {
      this.profiles.set(record.id, {
        ...record,
        stats: { ...DEFAULT_STATS, ...record.stats },
        achievements: record.achievements ?? [],
        abilities: Array.isArray(record.abilities) && record.abilities.length > 0
          ? [...record.abilities]
          : [...DEFAULT_ABILITY_IDS]
      })
    })
    this.activeId = data.activeId && this.profiles.has(data.activeId) ? data.activeId : null
    if (!this.activeId) {
      const first = this.getAllProfiles()[0]
      if (first) this.activeId = first.id
    }
    if (this.activeId) {
      const active = this.profiles.get(this.activeId)
      if (active) {
        latencyService.loadFromProfile({ offsetMs: active.settings.inputOffsetMs, updatedAt: active.lastPlayedAt })
      }
    }
  }

  serialize(): ProfileSaveData {
    return {
      activeId: this.activeId,
      profiles: Array.from(this.profiles.values())
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const payload = await this.saveService.load()
      if (payload?.data) {
        this.hydrate(payload.data)
        return
      }
    } catch (error) {
      console.warn('[ProfileService] Failed to load profiles', error)
    }
    this.ensureDefaultProfile()
    this.scheduleSave()
  }

  private flagUpdated(profile: ProfileRecord): void {
    profile.lastPlayedAt = Date.now()
    eventBus.emit('profile:updated', { id: profile.id, profile })
    if (this.activeId === profile.id) {
      eventBus.emit('profile:changed', { id: profile.id, profile })
    }
  }

  private ensureDefaultProfile(): void {
    if (this.profiles.size === 0) {
      this.createProfile({ name: 'Pilot', avatar: 'pilot_default' })
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout)
    this.emitSavePending('auto')
    this.saveTimeout = setTimeout(() => {
      void this.persist('auto')
    }, 500)
  }

  async saveNow(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = undefined
    }
    this.emitSavePending('manual')
    await this.persist('manual')
  }

  private emitSavePending(reason: 'auto' | 'manual'): void {
    eventBus.emit('profile:save:pending', { reason })
    this.pendingSave = true
  }

  private async persist(reason: 'auto' | 'manual'): Promise<void> {
    try {
      await this.saveService.save(this.serialize())
      eventBus.emit('profile:save:completed', { reason, savedAt: Date.now() })
    } catch (error) {
      console.warn('[ProfileService] Failed to save profiles', error)
    } finally {
      this.pendingSave = false
      this.saveTimeout = undefined
    }
  }
}

export const profileService = new ProfileService()
