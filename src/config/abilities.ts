import type { AbilityDefinition } from '../types/ability'
import { playerMovementConfig } from './playerMovement'

export const DEFAULT_ABILITY_IDS: string[] = ['pulse_dash', 'overdrive']

export const abilityDefinitions: Record<string, AbilityDefinition> = {
  pulse_dash: {
    id: 'pulse_dash',
    label: 'Pulse Dash',
    cooldownMs: 6000,
    durationMs: playerMovementConfig.dash.durationMs,
    tier: 1,
    beatBonus: 'Perfect dashes travel +45%',
    iconKey: 'ability_pulse_dash',
    description: 'Quickly dart forward, phasing through danger.',
    inputHint: 'Q / LB'
  },
  overdrive: {
    id: 'overdrive',
    label: 'Overdrive',
    cooldownMs: 14000,
    durationMs: 6500,
    tier: 2,
    beatBonus: 'Perfect hits grant +25% damage',
    iconKey: 'ability_overdrive',
    description: 'Supercharge weapons with rapid fire and damage buffs.',
    inputHint: 'R / Y'
  }
}

export const getAbilityDefinitions = (ids: string[]): AbilityDefinition[] =>
  ids
    .map((id) => abilityDefinitions[id])
    .filter((def): def is AbilityDefinition => Boolean(def))

export const getAllAbilityDefinitions = (): AbilityDefinition[] =>
  Object.values(abilityDefinitions)
