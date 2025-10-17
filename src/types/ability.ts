export type AbilityStatus = 'ready' | 'active' | 'cooldown'

export interface AbilityState {
  id: string
  label: string
  cooldownMs: number
  remainingMs: number
  tier: number
  beatBonus?: string
  iconKey?: string
  durationMs?: number
  activeRemainingMs?: number
  status: AbilityStatus
  description?: string
  inputHint?: string
}

export interface AbilityDefinition {
  id: string
  label: string
  cooldownMs: number
  tier: number
  beatBonus?: string
  iconKey?: string
  durationMs?: number
  description?: string
  inputHint?: string
}
