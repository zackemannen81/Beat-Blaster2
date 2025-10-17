import Phaser from 'phaser'
import RhythmRing from '../ui/RhythmRing'
import BeatClock from '../audio/BeatClock'
import { latencyService } from '@systems/LatencyService'
import { profileService } from '@systems/ProfileService'

interface LatencySceneData {
  returnScene?: string
}

type WizardState = 'instructions' | 'countdown' | 'sampling' | 'preview'

export default class LatencyCalibrationScene extends Phaser.Scene {
  constructor() {
    super('LatencyCalibrationScene')
  }

  private state: WizardState = 'instructions'
  private ring?: RhythmRing
  private beatClock?: BeatClock
  private headline!: Phaser.GameObjects.Text
  private infoText!: Phaser.GameObjects.Text
  private promptText!: Phaser.GameObjects.Text
  private resultText?: Phaser.GameObjects.Text
  private sampleText?: Phaser.GameObjects.Text
  private countdownText?: Phaser.GameObjects.Text
  private targetSamples = 20
  private samples = 0
  private returnScene = 'OptionsScene'
  private sampleValues: number[] = []
  private backdrop?: Phaser.GameObjects.Rectangle
  private sampleBarBg?: Phaser.GameObjects.Rectangle
  private sampleBarFill?: Phaser.GameObjects.Rectangle
  private countdownRing?: Phaser.GameObjects.Graphics
  private confirmationText?: Phaser.GameObjects.Text
  private confirmationPulse?: Phaser.GameObjects.Graphics
  private pendingSnapshot?: ReturnType<typeof latencyService.getSnapshot>

  create(data: LatencySceneData = {}) {
    this.returnScene = data.returnScene ?? 'OptionsScene'
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.75)')

    this.backdrop = this.add.rectangle(width / 2, height / 2, width * 0.82, height * 0.82, 0x061423, 0.82)
      .setStrokeStyle(2, 0x1b4b66, 0.9)

    this.headline = this.add.text(width / 2, height * 0.2, 'Latency Calibration', {
      fontFamily: 'HudFont, UiFont',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.infoText = this.add.text(width / 2, height * 0.35, '', {
      fontFamily: 'UiFont',
      fontSize: '18px',
      color: '#a0e9ff',
      align: 'center',
      wordWrap: { width: width * 0.7 }
    }).setOrigin(0.5)

    this.promptText = this.add.text(width / 2, height * 0.8, 'Press SPACE to begin', {
      fontFamily: 'UiFont',
      fontSize: '16px',
      color: '#7ddff2'
    }).setOrigin(0.5)

    const settings = profileService.getActiveProfile()?.settings
    this.ring = new RhythmRing(this, {
      reducedMotion: settings?.reducedMotion ?? false,
      colorblindMode: settings?.colorblindMode ?? false
    })
    this.ring.create(width / 2, height * 0.5)

    this.sampleText = this.add.text(width / 2, height * 0.65, '', {
      fontFamily: 'UiFont',
      fontSize: '16px',
      color: '#7ddff2'
    }).setOrigin(0.5)

    this.sampleBarBg = this.add.rectangle(width / 2, height * 0.69, width * 0.36, 12, 0x10303f, 0.6).setOrigin(0.5)
    this.sampleBarFill = this.add.rectangle((this.sampleBarBg?.x ?? width / 2) - (this.sampleBarBg?.width ?? 0) / 2, height * 0.69, 0, 12, 0x00e5ff, 0.9).setOrigin(0, 0.5)

    this.countdownRing = this.add.graphics()
    this.countdownRing.setDepth(5)

    this.input.keyboard!.on('keydown-SPACE', this.handleSpace, this)
    this.input.keyboard!.on('keydown-A', this.handleApplyKey, this)
    this.input.keyboard!.on('keydown-R', this.handleRetryKey, this)
    this.input.keyboard!.on('keydown-ESC', this.exit, this)
    this.input.on('pointerdown', this.handlePointer, this)

    this.showInstructions()
  }

  private showInstructions() {
    this.state = 'instructions'
    this.samples = 0
    this.sampleValues = []
    this.infoText.setText('Tap along with the beat to measure audio/input latency.\nWhen ready, press SPACE to begin the countdown.')
    this.promptText.setText('SPACE: Start   ESC: Cancel')
    this.resultText?.destroy()
    this.sampleText?.setText('')
    this.countdownText?.destroy()
    this.countdownRing?.clear()
    if (this.sampleBarFill) this.sampleBarFill.width = 0
    this.confirmationText?.destroy()
    this.confirmationPulse?.destroy()
    this.confirmationText = undefined
    this.confirmationPulse = undefined
    this.pendingSnapshot = undefined
  }

  private startCountdown() {
    if (this.state !== 'instructions') return
    this.state = 'countdown'
    this.promptText.setText('')
    let count = 3
    this.infoText.setText('Get ready to tap on the beat…')
    this.countdownText?.destroy()
    this.countdownText = this.add.text(this.scale.width / 2, this.scale.height * 0.5, `${count}`, {
      fontFamily: 'HudFont, UiFont',
      fontSize: '72px',
      color: '#66ffda'
    }).setOrigin(0.5)
    this.sound.play('ui_select', { volume: 0.6 })
    this.drawCountdownRing(1)
    this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count -= 1
        if (count > 0) {
          this.countdownText?.setText(`${count}`)
          this.sound.play('ui_move', { volume: 0.65 })
          this.drawCountdownRing(count / 3)
        } else {
          this.countdownText?.destroy()
          this.startSampling()
        }
      }
    })
  }

  private startSampling() {
    this.state = 'sampling'
    this.samples = 0
    this.sampleValues = []
    latencyService.beginCalibration()
    this.infoText.setText('Tap on each beat. Collecting samples...')
    this.promptText.setText('SPACE / Click: Tap   ESC: Cancel')
    this.beatClock?.stop()
    this.countdownRing?.clear()
    if (this.sampleBarFill) this.sampleBarFill.width = 0
    this.sound.play('ui_select', { volume: 0.7 })
    this.beatClock = new BeatClock(this, {
      baseBpm: 120,
      latencyOffsetMs: latencyService.getOffset()
    })
    this.beatClock.onBeat((_beat, timestamp) => {
      this.ring?.handleBeat()
    })
    this.beatClock.start()
  }

  private captureSample() {
    if (this.state !== 'sampling') return
    if (!this.beatClock) return
    const since = this.beatClock.msSinceLastBeat()
    const until = this.beatClock.msUntilNextBeat()
    const delta = since <= until ? since : -until
    latencyService.recordSample(delta)
    this.sampleValues.push(delta)
    this.samples += 1
    this.sound.play('ui_move', { volume: 0.45 })
    this.renderSampleProgress()
    const estimate = this.estimateOffset()
    const estimateText = estimate !== null ? `  (est: ${estimate} ms)` : ''
    this.sampleText?.setText(`Samples: ${this.samples}/${this.targetSamples}${estimateText}`)
    if (this.samples >= this.targetSamples) {
      this.finishSampling()
    }
  }

  private finishSampling() {
    this.state = 'preview'
    this.beatClock?.stop()
    const snapshot = latencyService.completeCalibration()
    this.pendingSnapshot = snapshot
    const { offsetMs } = snapshot
    if (this.sampleBarFill && this.sampleBarBg) this.sampleBarFill.width = this.sampleBarBg.width
    this.resultText?.destroy()
    this.resultText = this.add.text(this.scale.width / 2, this.scale.height * 0.6, `Suggested Offset: ${offsetMs} ms`, {
      fontFamily: 'UiFont',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.infoText.setText('Press A to apply this offset, R to collect new samples, or ESC to cancel.')
    this.promptText.setText('A: Apply   R: Retry   ESC: Cancel')
    this.sound.play('ui_select', { volume: 0.75 })
  }

  private apply(offsetMs: number) {
    const profile = profileService.getActiveProfile()
    if (profile) {
      profileService.updateSettings(profile.id, { inputOffsetMs: offsetMs })
    } else {
      latencyService.setOffset(offsetMs, 'manual')
    }
    this.pendingSnapshot = latencyService.getSnapshot()
    this.sound.play('ui_select', { volume: 0.85 })
    this.promptText.setText('Offset applied! ESC to return.')
    this.infoText.setText(`Latency offset saved at ${offsetMs} ms.`)
    this.showConfirmation(offsetMs)
    this.time.delayedCall(1300, () => this.exit())
  }

  private retry() {
    this.beatClock?.stop()
    latencyService.cancelCalibration()
    this.showInstructions()
  }

  private exit = () => {
    this.beatClock?.stop()
    this.input.keyboard?.off('keydown-SPACE', this.handleSpace, this)
    this.input.keyboard?.off('keydown-A', this.handleApplyKey, this)
    this.input.keyboard?.off('keydown-R', this.handleRetryKey, this)
    this.input.keyboard?.off('keydown-ESC', this.exit, this)
    this.input.off('pointerdown', this.handlePointer, this)
    this.scene.stop()
    this.scene.resume(this.returnScene)
  }

  private estimateOffset(): number | null {
    if (this.sampleValues.length === 0) return null
    const sorted = [...this.sampleValues].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : Math.round(sorted[mid])
    return median
  }

  private handleSpace() {
    if (this.state === 'instructions') {
      this.startCountdown()
      return
    }
    if (this.state === 'sampling') {
      this.captureSample()
    }
  }

  private handlePointer() {
    if (this.state === 'sampling') this.captureSample()
  }

  private handleApplyKey() {
    if (this.state !== 'preview') return
    const snapshot = this.pendingSnapshot ?? latencyService.getSnapshot()
    this.apply(snapshot.offsetMs)
  }

  private handleRetryKey() {
    if (this.state !== 'preview') return
    this.retry()
  }

  private renderSampleProgress(): void {
    if (!this.sampleBarBg || !this.sampleBarFill) return
    const ratio = Phaser.Math.Clamp(this.samples / this.targetSamples, 0, 1)
    this.sampleBarFill.width = this.sampleBarBg.width * ratio
    const sparkX = this.sampleBarFill.x + this.sampleBarFill.width
    const spark = this.add.graphics({ x: sparkX, y: this.sampleBarFill.y })
    spark.fillStyle(0x66ffda, 0.9)
    spark.fillCircle(0, 0, 6)
    if (!this.reducedMotion()) {
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 1.6,
        duration: 240,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      })
    } else {
      this.time.delayedCall(160, () => spark.destroy())
    }
  }

  private reducedMotion(): boolean {
    return profileService.getActiveProfile()?.settings.reducedMotion ?? false
  }

  private showConfirmation(offsetMs: number): void {
    const { width, height } = this.scale
    this.confirmationText?.destroy()
    this.confirmationPulse?.destroy()

    this.confirmationPulse = this.add.graphics({ x: width / 2, y: height * 0.74 })
    this.confirmationPulse.fillStyle(0x00e5ff, 0.3)
    this.confirmationPulse.fillCircle(0, 0, 52)

    this.confirmationText = this.add.text(width / 2, height * 0.74, `Offset saved: ${offsetMs} ms`, {
      fontFamily: 'UiFont',
      fontSize: '18px',
      color: '#66ffda'
    }).setOrigin(0.5).setAlpha(0)

    if (!this.reducedMotion()) {
      this.tweens.add({
        targets: this.confirmationPulse,
        alpha: 0,
        scale: 1.4,
        duration: 420,
        ease: 'Quad.easeOut'
      })
    }

    this.tweens.add({
      targets: this.confirmationText,
      alpha: 1,
      duration: 180,
      ease: 'Sine.easeOut',
      yoyo: false
    })

    this.tweens.add({
      targets: this.confirmationText,
      alpha: 0,
      delay: 900,
      duration: 260,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.confirmationText?.destroy()
        this.confirmationPulse?.destroy()
        this.confirmationText = undefined
        this.confirmationPulse = undefined
      }
    })
  }

  private drawCountdownRing(progress: number) {
    if (!this.countdownRing) return
    const { width, height } = this.scale
    const radius = Math.min(width, height) * 0.18
    this.countdownRing.clear()
    this.countdownRing.lineStyle(6, 0x00e5ff, 0.75)
    this.countdownRing.beginPath()
    this.countdownRing.arc(width / 2, height * 0.5, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress, false)
    this.countdownRing.strokePath()
  }
}
