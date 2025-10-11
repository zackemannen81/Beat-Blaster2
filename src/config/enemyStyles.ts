import { CubeSkinOptions } from '../systems/CubeSkin'

export type EnemyType =
  | 'brute'
  | 'dasher'
  | 'swarm'
  | 'exploder'
  | 'weaver'
  | 'formation'
  | 'mirrorer'
  | 'teleporter'
  | 'flooder'
  | 'boss_swarm'
  | 'boss_juggernaut'
  | 'boss_trickster'

export interface EnemyStyle extends CubeSkinOptions {
  /** Collision radius for physics body */
  bodyRadius: number
  /** Pulse amplitude multiplier */
  pulseScale: number
}

export const enemyStyles: Record<EnemyType, EnemyStyle> = {
  brute: {
    variant: 'solid',
    size: 50,
    bodyRadius: 30,
    primaryColor: 0xff2d9a,
    secondaryColor: 0x1a0116,
    glowColor: 0xff81e5,
    pulseScale: 0.2,
    pulseDuration: 240,
    rotationDuration: 4800,
    design: 'cube'
  },
  dasher: {
    variant: 'wire',
    size: 30,
    bodyRadius: 22,
    primaryColor: 0x2efcff,
    secondaryColor: 0x022a35,
    glowColor: 0x7dffff,
    pulseScale: 0.16,
    pulseDuration: 150,
    rotationDuration: 2400,
    design: 'diamond'
  },
  swarm: {
    variant: 'plasma',
    size: 28,
    bodyRadius: 20,
    primaryColor: 0xfff74d,
    secondaryColor: 0x332500,
    glowColor: 0xffd966,
    pulseScale: 0.12,
    pulseDuration: 160,
    rotationDuration: 3600,
    design: 'triangle'
  },
  exploder: {
    variant: 'solid',
    size: 54,
    bodyRadius: 32,
    primaryColor: 0xff6b1a,
    secondaryColor: 0x3a0b00,
    glowColor: 0xffb347,
    pulseScale: 0.24,
    pulseDuration: 320,
    rotationDuration: 2400,
    design: 'hex'
  },
  weaver: {
    variant: 'wire',
    size: 36,
    bodyRadius: 24,
    primaryColor: 0x63ffb3,
    secondaryColor: 0x052720,
    glowColor: 0xa0ffd8,
    pulseScale: 0.18,
    pulseDuration: 210,
    rotationDuration: 3000,
    design: 'triangle'
  },
  formation: {
    variant: 'solid',
    size: 42,
    bodyRadius: 26,
    primaryColor: 0x9f6dff,
    secondaryColor: 0x1d0b3d,
    glowColor: 0xd3b5ff,
    pulseScale: 0.14,
    pulseDuration: 260,
    rotationDuration: 3200,
    design: 'hex'
  },
  mirrorer: {
    variant: 'wire',
    size: 34,
    bodyRadius: 24,
    primaryColor: 0xff63be,
    secondaryColor: 0x33001f,
    glowColor: 0xff9edb,
    pulseScale: 0.2,
    pulseDuration: 220,
    rotationDuration: 3000,
    design: 'diamond'
  },
  teleporter: {
    variant: 'plasma',
    size: 34,
    bodyRadius: 22,
    primaryColor: 0x4f9dff,
    secondaryColor: 0x081a3e,
    glowColor: 0x98c3ff,
    pulseScale: 0.24,
    pulseDuration: 180,
    rotationDuration: 2200,
    design: 'ring'
  },
  flooder: {
    variant: 'solid',
    size: 86,
    bodyRadius: 40,
    primaryColor: 0x1fffb1,
    secondaryColor: 0x003328,
    glowColor: 0x6bffd7,
    pulseScale: 0.16,
    pulseDuration: 340,
    rotationDuration: 0,
    design: 'bar'
  },
  boss_swarm: {
    variant: 'plasma',
    size: 92,
    bodyRadius: 44,
    primaryColor: 0xfccf3a,
    secondaryColor: 0x452500,
    glowColor: 0xfff06a,
    pulseScale: 0.22,
    pulseDuration: 220,
    rotationDuration: 2800,
    design: 'ring'
  },
  boss_juggernaut: {
    variant: 'solid',
    size: 108,
    bodyRadius: 52,
    primaryColor: 0x7c93ff,
    secondaryColor: 0x0b0f3a,
    glowColor: 0xc4d3ff,
    pulseScale: 0.18,
    pulseDuration: 360,
    rotationDuration: 5200,
    design: 'cube'
  },
  boss_trickster: {
    variant: 'wire',
    size: 88,
    bodyRadius: 42,
    primaryColor: 0xff6ff1,
    secondaryColor: 0x2a0534,
    glowColor: 0xffbdf9,
    pulseScale: 0.24,
    pulseDuration: 260,
    rotationDuration: 2600,
    design: 'diamond'
  }
}
