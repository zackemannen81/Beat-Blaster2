import Phaser from 'phaser'
import { BeatJudgement } from '@systems/BeatWindow'

interface RhythmRingOptions {
  radius?: number
  thickness?: number
  reducedMotion?: boolean
  colorblindMode?: boolean
}

const JUDGEMENT_COLORS: Record<'normal' | 'perfect' | 'good', number> = {
  normal: 0x3ac7ff,
  perfect: 0x66ffda,
  good: 0xffd866
}

const JUDGEMENT_COLORS_COLORBLIND: Record<'normal' | 'perfect' | 'good', number> = {
  normal: 0xffffff,
  perfect: 0x00ffff,
  good: 0xff7f00
}

export default class RhythmRing {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private baseCircle!: Phaser.GameObjects.Graphics
  private progressCircle!: Phaser.GameObjects.Graphics
  private judgementPulse!: Phaser.GameObjects.Graphics
  private currentProgress = 0
  private windowMs = 600
  private tween?: Phaser.Tweens.Tween
  private reducedMotion: boolean
  private colorblindMode: boolean
  private readonly radius: number
  private readonly thickness: number

  constructor(scene: Phaser.Scene, options: RhythmRingOptions = {}) {
    this.scene = scene
    this.radius = options.radius ?? 46
    this.thickness = options.thickness ?? 6
    this.reducedMotion = Boolean(options.reducedMotion)
    this.colorblindMode = Boolean(options.colorblindMode)
  }

  create(x: number, y: number): void {
    this.container = this.scene.add.container(x, y).setDepth(85)
    this.baseCircle = this.scene.add.graphics()
    this.progressCircle = this.scene.add.graphics()
    this.judgementPulse = this.scene.add.graphics()
    this.container.add([this.baseCircle, this.progressCircle, this.judgementPulse])
    this.drawBase()
    this.drawProgress(0)
  }

  destroy(): void {
    this.tween?.stop()
    this.container?.destroy(true)
  }

  setReducedMotion(flag: boolean): void {
    this.reducedMotion = flag
  }

  setColorblindMode(flag: boolean): void {
    this.colorblindMode = flag
    this.drawBase()
    this.drawProgress(this.currentProgress)
  }

  setPosition(x: number, y: number): void {
    if (!this.container) return
    this.container.setPosition(x, y)
  }

  updateWindow(windowMs: number): void {
    if (Number.isFinite(windowMs)) {
      this.windowMs = Math.max(50, Math.round(windowMs))
    }
  }

  handleBeat(windowMs?: number): void {
    if (typeof windowMs === 'number') this.updateWindow(windowMs)
    this.currentProgress = 1
    this.drawProgress(this.currentProgress)
    this.tween?.stop()
    if (this.reducedMotion) {
      return
    }
    this.tween = this.scene.tweens.addCounter({
      from: this.windowMs,
      to: 0,
      duration: this.windowMs,
      ease: 'Linear',
      onUpdate: (tw) => {
        const remaining = tw.getValue() as number
        this.currentProgress = Phaser.Math.Clamp(remaining / this.windowMs, 0, 1)
        this.drawProgress(this.currentProgress)
      },
      onComplete: () => {
        this.currentProgress = 0
        this.drawProgress(this.currentProgress)
      }
    })
  }

  showJudgement(judgement: BeatJudgement, accuracy: 'Perfect' | 'Good' | 'Offbeat'): void {
    if (!this.judgementPulse) return
    const palette = this.colorblindMode ? JUDGEMENT_COLORS_COLORBLIND : JUDGEMENT_COLORS
    const key = judgement === 'perfect' ? 'perfect' : accuracy === 'Good' ? 'good' : 'normal'
    this.judgementPulse.clear()
    this.judgementPulse.lineStyle(this.thickness, palette[key], 0.9)
    this.judgementPulse.strokeCircle(0, 0, this.radius + this.thickness)
    this.scene.tweens.killTweensOf(this.judgementPulse)
    this.judgementPulse.setAlpha(1)
    this.judgementPulse.setScale(1)
    this.scene.tweens.add({
      targets: this.judgementPulse,
      alpha: 0,
      scale: 1.2,
      duration: this.reducedMotion ? 200 : 320,
      ease: 'Cubic.easeOut'
    })
  }

  private drawBase(): void {
    if (!this.baseCircle) return
    const color = this.colorblindMode ? 0xffffff : 0x2a4f6b
    this.baseCircle.clear()
    this.baseCircle.lineStyle(this.thickness, color, 0.35)
    this.baseCircle.strokeCircle(0, 0, this.radius)
  }

  private drawProgress(progress: number): void {
    if (!this.progressCircle) return
    this.progressCircle.clear()
    const palette = this.colorblindMode ? JUDGEMENT_COLORS_COLORBLIND : JUDGEMENT_COLORS
    const color = palette.normal
    const endAngle = -Math.PI / 2 + Phaser.Math.Clamp(progress, 0, 1) * Math.PI * 2
    this.progressCircle.lineStyle(this.thickness, color, 0.9)
    this.progressCircle.beginPath()
    this.progressCircle.arc(0, 0, this.radius, -Math.PI / 2, endAngle, false)
    this.progressCircle.strokePath()
  }
}
