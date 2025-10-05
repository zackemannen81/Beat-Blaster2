import Phaser from 'phaser'

export type PowerupType =
  | 'shield'
  | 'rapid'
  | 'split'
  | 'slowmo'
  | 'chain_lightning'
  | 'homing_missiles'
  | 'time_stop'

export interface PowerupEvent {
  type: PowerupType
  durationMs: number
  remainingMs: number
  endAt: number
}

export default class Powerups extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene
  private rapidUntil = 0
  private splitUntil = 0
  private shieldUntil = 0
  private slowmoUntil = 0
  private chainLightningUntil = 0
  private homingMissilesUntil = 0
  private timeStopUntil = 0
  private durationMs: Record<PowerupType, number> = {
    shield: 0,
    rapid: 0,
    split: 0,
    slowmo: 0,
    chain_lightning: 0,
    homing_missiles: 0,
    time_stop: 0,
  }

  constructor(scene: Phaser.Scene) {
    super()
    this.scene = scene
  }

  get hasRapid() { return this.scene.time.now < this.rapidUntil }
  get hasSplit() { return this.scene.time.now < this.splitUntil }
  get hasShield() { return this.scene.time.now < this.shieldUntil }
  get hasSlowmo() { return this.scene.time.now < this.slowmoUntil }
  get hasChainLightning() { return this.scene.time.now < this.chainLightningUntil }
  get hasHomingMissiles() { return this.scene.time.now < this.homingMissilesUntil }
  get hasTimeStop() { return this.scene.time.now < this.timeStopUntil }

  apply(type: PowerupType, durationSec: number) {
    const now = this.scene.time.now
    const end = now + durationSec * 1000
    const durationMs = durationSec * 1000
    this.durationMs[type] = durationMs
    switch (type) {
      case 'rapid': this.rapidUntil = Math.max(this.rapidUntil, end); break
      case 'split': this.splitUntil = Math.max(this.splitUntil, end); break
      case 'shield': this.shieldUntil = Math.max(this.shieldUntil, end); break
      case 'slowmo': {
        this.slowmoUntil = Math.max(this.slowmoUntil, end)
        this.scene.time.timeScale = 0.8
        // physics
        
        if (this.scene.physics?.world) this.scene.physics.world.timeScale = 0.8
        this.scene.time.delayedCall(durationSec * 1000, () => {
          if (!this.hasSlowmo) {
            this.scene.time.timeScale = 1
        
            if (this.scene.physics?.world) this.scene.physics.world.timeScale = 1
          }
        })
        break
      }
      case 'chain_lightning':
        this.chainLightningUntil = Math.max(this.chainLightningUntil, end)
        break
      case 'homing_missiles':
        this.homingMissilesUntil = Math.max(this.homingMissilesUntil, end)
        break
      case 'time_stop':
        this.timeStopUntil = Math.max(this.timeStopUntil, end)
        break
    }
    this.emit('powerup', this.buildEvent(type))
  }

  getRemainingMs(type: PowerupType) {
    const now = this.scene.time.now
    const until = (() => {
      switch (type) {
        case 'rapid': return this.rapidUntil
        case 'split': return this.splitUntil
        case 'shield': return this.shieldUntil
        case 'slowmo': return this.slowmoUntil
        case 'chain_lightning': return this.chainLightningUntil
        case 'homing_missiles': return this.homingMissilesUntil
        case 'time_stop': return this.timeStopUntil
        default: return 0
      }
    })()
    return Math.max(0, until - now)
  }

  getDurationMs(type: PowerupType) {
    return this.durationMs[type]
  }

  getRemainingRatio(type: PowerupType) {
    const dur = this.getDurationMs(type)
    if (dur <= 0) return 0
    return Phaser.Math.Clamp(this.getRemainingMs(type) / dur, 0, 1)
  }

  getActiveTypes(): PowerupType[] {
    const types: PowerupType[] = [
      'shield',
      'rapid',
      'split',
      'slowmo',
      'chain_lightning',
      'homing_missiles',
      'time_stop'
    ]
    return types.filter((t) => this.getRemainingMs(t) > 0)
  }

  private buildEvent(type: PowerupType): PowerupEvent {
    const remainingMs = this.getRemainingMs(type)
    return {
      type,
      durationMs: this.getDurationMs(type),
      remainingMs,
      endAt: this.scene.time.now + remainingMs
    }
  }
}
