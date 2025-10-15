const STORAGE_KEY = 'beatblaster:profiles'
const BACKUP_KEYS = ['beatblaster:profiles:bak1', 'beatblaster:profiles:bak2']
const SCHEMA_VERSION = 1

type StorageAdapter = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

const createLocalStorageAdapter = (): StorageAdapter => {
  if (typeof window === 'undefined' || !window.localStorage) {
    const memory = new Map<string, string>()
    return {
      async getItem(key) { return memory.get(key) ?? null },
      async setItem(key, value) { memory.set(key, value) },
      async removeItem(key) { memory.delete(key) }
    }
  }
  return {
    async getItem(key) { return window.localStorage.getItem(key) },
    async setItem(key, value) { window.localStorage.setItem(key, value) },
    async removeItem(key) { window.localStorage.removeItem(key) }
  }
}

const storage: StorageAdapter = createLocalStorageAdapter()

export interface SavePayload<T> {
  version: number
  savedAt: number
  data: T
}

export type MigrationFn<T> = (payload: SavePayload<any>) => SavePayload<T>

export class SaveService<T> {
  private migrations = new Map<number, MigrationFn<T>>()
  private key: string

  constructor(key = STORAGE_KEY) {
    this.key = key
  }

  registerMigration(fromVersion: number, fn: MigrationFn<T>): void {
    this.migrations.set(fromVersion, fn)
  }

  getCurrentVersion(): number {
    return SCHEMA_VERSION
  }

  async load(): Promise<SavePayload<T> | null> {
    const raw = await storage.getItem(this.key)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as SavePayload<T>
      return this.applyMigrations(parsed)
    } catch (error) {
      console.warn('[SaveService] Failed to parse save, attempting backups', error)
      return this.restoreFromBackups()
    }
  }

  async save(payload: T): Promise<void> {
    const previous = await storage.getItem(this.key)
    if (previous) {
      await storage.setItem(BACKUP_KEYS[1], await storage.getItem(BACKUP_KEYS[0]) ?? previous)
      await storage.setItem(BACKUP_KEYS[0], previous)
    }
    const wrapped: SavePayload<T> = {
      version: SCHEMA_VERSION,
      savedAt: Date.now(),
      data: payload
    }
    await storage.setItem(this.key, JSON.stringify(wrapped))
  }

  private async restoreFromBackups(): Promise<SavePayload<T> | null> {
    for (const key of BACKUP_KEYS) {
      const backup = await storage.getItem(key)
      if (!backup) continue
      try {
        const parsed = JSON.parse(backup) as SavePayload<T>
        const migrated = this.applyMigrations(parsed)
        await storage.setItem(this.key, JSON.stringify(migrated))
        return migrated
      } catch (error) {
        console.warn('[SaveService] Failed to restore backup', key, error)
      }
    }
    await storage.removeItem(this.key)
    return null
  }

  private applyMigrations(payload: SavePayload<any>): SavePayload<T> {
    let current = payload
    let safety = 0
    while (current.version < SCHEMA_VERSION && safety < 10) {
      const migration = this.migrations.get(current.version)
      if (!migration) break
      current = migration(current)
      safety++
    }
    if (current.version !== SCHEMA_VERSION) {
      current = {
        version: SCHEMA_VERSION,
        savedAt: Date.now(),
        data: current.data as T
      }
    }
    return current as SavePayload<T>
  }
}
