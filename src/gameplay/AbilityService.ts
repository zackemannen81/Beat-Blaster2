import { eventBus } from '../core/EventBus'
import type { AbilityDefinition, AbilityState, AbilityStatus } from '../types/ability'

const ABILITY_CHANGED_EVENT = 'ability:changed'

type AbilityInternalState = {
  definition: AbilityDefinition
  remainingMs: number
  activeRemainingMs: number
}

export class AbilityService {
  private states = new Map<string, AbilityInternalState>()
  private order: string[] = []

  constructor(definitions: AbilityDefinition[] = []) {
    if (definitions.length > 0) {
      this.setDefinitions(definitions)
    }
  }

  setDefinitions(definitions: AbilityDefinition[]): void {
    this.states.clear()
    this.order = []
    definitions.forEach((def) => {
      this.states.set(def.id, {
        definition: def,
        remainingMs: 0,
        activeRemainingMs: 0
      })
      this.order.push(def.id)
    })
    this.emitSnapshot()
  }

  getStates(): AbilityState[] {
    return this.order
      .map((id) => this.states.get(id))
      .filter((state): state is AbilityInternalState => Boolean(state))
      .map((state) => this.toPublicState(state))
  }

  getState(id: string): AbilityState | undefined {
    const internal = this.states.get(id)
    return internal ? this.toPublicState(internal) : undefined
  }

  canActivate(id: string): boolean {
    const state = this.states.get(id)
    if (!state) return false
    return state.remainingMs <= 0
  }

  activate(id: string, { force }: { force?: boolean } = {}): AbilityState | undefined {
    const state = this.states.get(id)
    if (!state) return undefined
    if (!force && state.remainingMs > 0) return undefined

    state.remainingMs = state.definition.cooldownMs
    state.activeRemainingMs = state.definition.durationMs ?? 0
    const snapshot = this.toPublicState(state)
    this.emitState(id, snapshot)
    return snapshot
  }

  update(deltaMs: number): boolean {
    if (deltaMs <= 0) return false
    let changed = false

    this.states.forEach((state) => {
      const prevRemaining = state.remainingMs
      const prevActive = state.activeRemainingMs

      if (state.remainingMs > 0) {
        state.remainingMs = Math.max(0, state.remainingMs - deltaMs)
      }
      if (state.activeRemainingMs > 0) {
        state.activeRemainingMs = Math.max(0, state.activeRemainingMs - deltaMs)
      }

      if (prevRemaining !== state.remainingMs || prevActive !== state.activeRemainingMs) {
        changed = true
      }
    })

    if (changed) {
      this.emitSnapshot()
    }
    return changed
  }

  reset(id: string): void {
    const state = this.states.get(id)
    if (!state) return
    state.remainingMs = 0
    state.activeRemainingMs = 0
    this.emitState(id, this.toPublicState(state))
  }

  private toPublicState(state: AbilityInternalState): AbilityState {
    const remainingMs = Math.max(0, Math.round(state.remainingMs))
    const activeRemainingMs = Math.max(0, Math.round(state.activeRemainingMs))
    const status: AbilityStatus = activeRemainingMs > 0
      ? 'active'
      : remainingMs > 0
        ? 'cooldown'
        : 'ready'

    const { definition } = state
    return {
      id: definition.id,
      label: definition.label,
      cooldownMs: definition.cooldownMs,
      remainingMs,
      durationMs: definition.durationMs,
      activeRemainingMs,
      tier: definition.tier,
      beatBonus: definition.beatBonus,
      iconKey: definition.iconKey,
      description: definition.description,
      inputHint: definition.inputHint,
      status
    }
  }

  private emitSnapshot(): void {
    eventBus.emit(ABILITY_CHANGED_EVENT, { states: this.getStates() })
  }

  private emitState(id: string, state: AbilityState): void {
    eventBus.emit(ABILITY_CHANGED_EVENT, { id, state, states: this.getStates() })
  }
}

export const abilityServiceEvent = ABILITY_CHANGED_EVENT
export type { AbilityState } from '../types/ability'
