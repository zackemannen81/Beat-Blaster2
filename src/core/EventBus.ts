import type Phaser from 'phaser'
import type { ProfileRecord } from '../systems/ProfileService'
import type { AbilityState } from '../types/ability'

export type EventUnsubscribe = () => void

export interface EventPayloads {
  'beat:tick': { beat: number; bar: number; timestamp: number }
  'beat:window': { msUntilNext: number; windowMs: number }
  'beat:band': { band: 'low' | 'mid' | 'high'; timestamp: number }
  'combo:changed': { value: number; multiplier: number }
  'player:hit': { hp: number; damage: number; source?: string }
  'currency:changed': { delta: number; total: number; reason: string }
  'stage:completed': { stageId: string; rank: string; stats: unknown }
  'latency:changed': { offsetMs: number; updatedAt: number; source: 'default' | 'calibration' | 'manual' }
  'profile:changed': { id: string; profile: ProfileRecord }
  'profile:updated': { id: string; profile: ProfileRecord }
  'profile:save:pending': { reason: 'auto' | 'manual' }
  'profile:save:completed': { reason: 'auto' | 'manual'; savedAt: number }
  'ability:changed': { id?: string; state?: AbilityState; states?: AbilityState[] }
}

type Listener<T> = (payload: T) => void

type ListenerSet<T> = Set<Listener<T>>

export class EventBus<TEvents extends Record<string, any>> {
  private listeners = new Map<keyof TEvents, ListenerSet<any>>()

  on<TKey extends keyof TEvents>(event: TKey, handler: Listener<TEvents[TKey]>): EventUnsubscribe {
    const set = this.getOrCreate(event)
    set.add(handler)
    return () => this.off(event, handler)
  }

  once<TKey extends keyof TEvents>(event: TKey, handler: Listener<TEvents[TKey]>): EventUnsubscribe {
    const wrapper: Listener<TEvents[TKey]> = (payload) => {
      this.off(event, wrapper)
      handler(payload)
    }
    return this.on(event, wrapper)
  }

  off<TKey extends keyof TEvents>(event: TKey, handler: Listener<TEvents[TKey]>): void {
    const set = this.listeners.get(event)
    set?.delete(handler)
    if (set && set.size === 0) {
      this.listeners.delete(event)
    }
  }

  emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const handler of Array.from(set)) {
      handler(payload)
    }
  }

  clear(): void {
    this.listeners.clear()
  }

  bindToScene<TKey extends keyof TEvents>(scene: Phaser.Scene, event: TKey, handler: Listener<TEvents[TKey]>): void {
    const unsubscribe = this.on(event, handler)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => unsubscribe())
  }

  private getOrCreate<TKey extends keyof TEvents>(event: TKey): ListenerSet<TEvents[TKey]> {
    const existing = this.listeners.get(event)
    if (existing) return existing
    const created: ListenerSet<TEvents[TKey]> = new Set()
    this.listeners.set(event, created)
    return created
  }
}

export const eventBus = new EventBus<EventPayloads>()
