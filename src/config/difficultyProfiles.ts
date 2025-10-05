import { WaveCategory } from '../types/waves'

export type DifficultyProfileId = 'easy' | 'normal' | 'hard' | 'wip'

export type StageTuning = {
  stage: number
  scrollMultiplier: number
  spawnMultiplier: number
  enemyHpMultiplier: number
  bossHpMultiplier: number
  enemyCap: number
  maxQueuedWaves: number
  maxSimultaneousHeavy?: number
  heavyCooldownMs?: number
}

export type DifficultyProfile = {
  id: DifficultyProfileId
  label: string
  description: string
  baseScrollSpeed: number
  baseSpawnRate: number
  baseEnemyHpMultiplier: number
  baseBossHpMultiplier: number
  waveDelayMs: number
  waveRepeatCooldownMs: number
  fallbackCooldownMs: number
  wavePlaylistId: string
  laneCount: number
  missPenalty: number
  bossMissPenalty: number
  categoryCooldowns: Partial<Record<WaveCategory, number>>
  heavyControls: {
    cooldownMs: number
    windowMs: number
    maxInWindow: number
    maxSimultaneous: number
  }
  stageTuning: StageTuning[]
}

const WIP_STAGE_TUNING: StageTuning[] = [
  { stage: 1, scrollMultiplier: 0.64, spawnMultiplier: 0.41, enemyHpMultiplier: 0.6, bossHpMultiplier: 0.7, enemyCap: 6, maxQueuedWaves: 2 },
  { stage: 2, scrollMultiplier: 0.71, spawnMultiplier: 0.49, enemyHpMultiplier: 0.65, bossHpMultiplier: 0.75, enemyCap: 7, maxQueuedWaves: 2 },
  { stage: 3, scrollMultiplier: 0.77, spawnMultiplier: 0.57, enemyHpMultiplier: 0.71, bossHpMultiplier: 0.8, enemyCap: 9, maxQueuedWaves: 2 },
  { stage: 4, scrollMultiplier: 0.84, spawnMultiplier: 0.65, enemyHpMultiplier: 0.79, bossHpMultiplier: 0.87, enemyCap: 10, maxQueuedWaves: 3 }
]

const NORMAL_STAGE_TUNING: StageTuning[] = [
  { stage: 1, scrollMultiplier: 0.76, spawnMultiplier: 0.65, enemyHpMultiplier: 0.73, bossHpMultiplier: 0.84, enemyCap: 9, maxQueuedWaves: 2 },
  { stage: 2, scrollMultiplier: 0.83, spawnMultiplier: 0.73, enemyHpMultiplier: 0.83, bossHpMultiplier: 0.92, enemyCap: 11, maxQueuedWaves: 2 },
  { stage: 3, scrollMultiplier: 0.9, spawnMultiplier: 0.82, enemyHpMultiplier: 0.93, bossHpMultiplier: 1.02, enemyCap: 13, maxQueuedWaves: 3, maxSimultaneousHeavy: 2 },
  { stage: 4, scrollMultiplier: 0.98, spawnMultiplier: 0.92, enemyHpMultiplier: 1.03, bossHpMultiplier: 1.12, enemyCap: 15, maxQueuedWaves: 3, maxSimultaneousHeavy: 2, heavyCooldownMs: 4700 }
]

const HARD_STAGE_TUNING: StageTuning[] = [
  { stage: 1, scrollMultiplier: 0.92, spawnMultiplier: 0.85, enemyHpMultiplier: 0.92, bossHpMultiplier: 1.1, enemyCap: 12, maxQueuedWaves: 2, maxSimultaneousHeavy: 2 },
  { stage: 2, scrollMultiplier: 1, spawnMultiplier: 0.95, enemyHpMultiplier: 1.06, bossHpMultiplier: 1.22, enemyCap: 14, maxQueuedWaves: 3, maxSimultaneousHeavy: 2 },
  { stage: 3, scrollMultiplier: 1.08, spawnMultiplier: 1.05, enemyHpMultiplier: 1.2, bossHpMultiplier: 1.32, enemyCap: 16, maxQueuedWaves: 3, maxSimultaneousHeavy: 3, heavyCooldownMs: 4200 },
  { stage: 4, scrollMultiplier: 1.16, spawnMultiplier: 1.15, enemyHpMultiplier: 1.3, bossHpMultiplier: 1.42, enemyCap: 18, maxQueuedWaves: 3, maxSimultaneousHeavy: 3, heavyCooldownMs: 4000 }
]

const wipProfile: DifficultyProfile = {
  id: 'wip',
  label: 'wip',
  description: 'Gentle pacing with generous telegraphs and capped heavy waves for onboarding.',
  baseScrollSpeed: 64,
  baseSpawnRate: 0.04,
  baseEnemyHpMultiplier: 0.115,
  baseBossHpMultiplier: 0.285,
  waveDelayMs: 6700,
  waveRepeatCooldownMs: 22000,
  fallbackCooldownMs: 77000,
  wavePlaylistId: 'wip',
  laneCount: 3,
  missPenalty: 0,
  bossMissPenalty: 80,
  categoryCooldowns: {
    light: 0,
    standard: 900,
    heavy: 23600,
    boss: 100800
  },
  heavyControls: {
    cooldownMs: 5200,
    windowMs: 14000,
    maxInWindow: 1,
    maxSimultaneous: 1
  },
  stageTuning: WIP_STAGE_TUNING.map(stage => ({ ...stage }))
}

const easyProfile: DifficultyProfile = {
  ...wipProfile,
  id: 'easy',
  label: 'Easy',
  description: 'Gentle pacing with generous telegraphs and capped heavy waves for onboarding.',
  wavePlaylistId: 'easy',
  stageTuning: WIP_STAGE_TUNING.map(stage => ({ ...stage }))
}

const normalProfile: DifficultyProfile = {
  id: 'normal',
  label: 'Normal',
  description: 'Calibrated pacing after onboarding with denser waves and moderate penalties.',
  baseScrollSpeed: 96,
  baseSpawnRate: 0.14,
  baseEnemyHpMultiplier: 0.5,
  baseBossHpMultiplier: 0.66,
  waveDelayMs: 5200,
  waveRepeatCooldownMs: 15000,
  fallbackCooldownMs: 68000,
  wavePlaylistId: 'normal',
  laneCount: 5,
  missPenalty: 15,
  bossMissPenalty: 60,
  categoryCooldowns: {
    light: 0,
    standard: 850,
    heavy: 23900,
    boss: 12000
  },
  heavyControls: {
    cooldownMs: 5900,
    windowMs: 17000,
    maxInWindow: 2,
    maxSimultaneous: 2
  },
  stageTuning: NORMAL_STAGE_TUNING.map(stage => ({ ...stage }))
}

const hardProfile: DifficultyProfile = {
  id: 'hard',
  label: 'Hard',
  description: 'Accelerated scroll, dense formations, and aggressive heavy cadence for veterans.',
  baseScrollSpeed: 128,
  baseSpawnRate: 0.23,
  baseEnemyHpMultiplier: 0.725,
  baseBossHpMultiplier: 0.885,
  waveDelayMs: 4700,
  waveRepeatCooldownMs: 13500,
  fallbackCooldownMs: 58000,
  wavePlaylistId: 'hard',
  laneCount: 7,
  missPenalty: 25,
  bossMissPenalty: 85,
  categoryCooldowns: {
    light: 0,
    standard: 660,
    heavy: 8900,
    boss: 40800
  },
  heavyControls: {
    cooldownMs: 5500,
    windowMs: 16000,
    maxInWindow: 2,
    maxSimultaneous: 2
  },
  stageTuning: HARD_STAGE_TUNING.map(stage => ({ ...stage }))
}

const profiles: Record<DifficultyProfileId, DifficultyProfile> = {
  easy: easyProfile,
  normal: normalProfile,
  hard: hardProfile,
  wip: wipProfile
}

export function getDifficultyProfile(id: string | undefined | null): DifficultyProfile {
  if (!id) return profiles.normal
  const key = id.toLowerCase() as DifficultyProfileId
  return profiles[key] ?? profiles.normal
}

export function listDifficultyProfiles(): DifficultyProfile[] {
  return Object.values(profiles)
}
