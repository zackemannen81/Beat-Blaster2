import { z } from 'zod';

const enemySchema = z.object({
  hp: z.number(),
  speed: z.number(),
  damage: z.number(),
  score: z.number(),
});

export const balanceSchema = z.object({
  player: z.object({
    speed: z.number(),
    accel: z.number(),
    friction: z.number(),
    hp: z.number(),
  }),
  bullets: z.object({
    speed: z.number(),
    cooldownMs: z.number(),
    damage: z.number(),
    ttlMs: z.number(),
  }),
  enemies: z.object({
    brute: enemySchema,
    dasher: enemySchema,
    swarm: enemySchema,
    elite: enemySchema,
  }),
  spawn: z.object({
    baseDensity: z.number(),
    eliteEveryNBars: z.number(),
  }),
  scoring: z.object({
    perfectMs: z.number(),
    goodMs: z.number(),
    comboStep: z.number(),
    comboMax: z.number(),
  }),
  powerups: z.object({
    dropRates: z.object({
      shield: z.number(),
      rapid: z.number(),
      split: z.number(),
      magnet: z.number(),
      slowmo: z.number(),
      chain_lightning: z.number(),
      homing_missiles: z.number(),
      time_stop: z.number(),
    }),
    durations: z.object({
      shield: z.number(),
      rapid: z.number(),
      magnet: z.number(),
      slowmo: z.number(),
      chain_lightning: z.number(),
      homing_missiles: z.number(),
      time_stop: z.number(),
    }),
    stackRules: z.string(),
  }),
  difficultyRamp: z.object({
    perMinuteHpPct: z.number(),
    spawnRatePct: z.number(),
    patternVariety: z.number(),
  }),
});

export type Balance = z.infer<typeof balanceSchema>;
