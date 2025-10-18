import Phaser from 'phaser'
import RhythmRing from '../ui/RhythmRing'
import BeatClock from '../audio/BeatClock'
import { latencyService } from '@systems/LatencyService'
import { profileService } from '@systems/ProfileService'

interface LatencySceneData {
  returnScene?: string
}

type WizardState = 'instructions' | 'countdown' | 'sampling' | 'preview'

type SampleStats = {
  median: number
  mean: number
  spread: number
  stdDev: number
}

export default class LatencyCalibrationScene extends Phaser.Scene {
  constructor() {
    super('LatencyCalibrationScene')
  }

  private state: WizardState = 'instructions'
  private ring?: RhythmRing
  private beatClock?: BeatClock
  private beatSubscription?: () => void
  private headline!: Phaser.GameObjects.Text
  private stepLabel!: Phaser.GameObjects.Text
  private subheaderText!: Phaser.GameObjects.Text
  private infoText!: Phaser.GameObjects.Text
  private promptText!: Phaser.GameObjects.Text
  private resultText?: Phaser.GameObjects.Text
  private sampleText?: Phaser.GameObjects.Text
  private sampleStatsText?: Phaser.GameObjects.Text
  private countdownText?: Phaser.GameObjects.Text
  private previewHintText?: Phaser.GameObjects.Text
  private targetSamples = 20
  private samples = 0
  private returnScene = 'OptionsScene'
  private sampleValues: number[] = []
  private backdrop?: Phaser.GameObjects.Graphics
  private sampleBarBg?: Phaser.GameObjects.Rectangle
  private sampleBarFill?: Phaser.GameObjects.Rectangle
  private countdownRing?: Phaser.GameObjects.Graphics
  private confirmationText?: Phaser.GameObjects.Text
  private confirmationPulse?: Phaser.GameObjects.Graphics
  private pendingSnapshot?: ReturnType<typeof latencyService.getSnapshot>
  private settings = { musicVolume: 0.8, sfxVolume: 0.9, reducedMotion: false, colorblindMode: false, inputOffsetMs: 0 }
  private sfxVolume = 0.9
  private colorblind = false
  private reducedMotionFlag = false
  private previousOffset = 0
  private metronome?: Phaser.Sound.BaseSound
  private timelineGraphic?: Phaser.GameObjects.Graphics
  private timelineLabels: Phaser.GameObjects.Text[] = []
  private sampleSparkColor = 0x66ffda
  private accentColor = 0x00e5ff
  private accentAltColor = 0x66ffda

  create(data: LatencySceneData = {}) {
    this.returnScene = data.returnScene ?? 'OptionsScene'

    const profile = profileService.getActiveProfile()
    const snapshot = latencyService.getSnapshot()
    this.settings = {
      musicVolume: profile?.settings.musicVolume ?? 0.8,
      sfxVolume: profile?.settings.sfxVolume ?? 0.9,
      reducedMotion: profile?.settings.reducedMotion ?? false,
      colorblindMode: profile?.settings.colorblindMode ?? false,
      inputOffsetMs: profile?.settings.inputOffsetMs ?? snapshot.offsetMs
    }
    this.sfxVolume = Phaser.Math.Clamp(this.settings.sfxVolume ?? 0.9, 0, 1)
    this.colorblind = !!this.settings.colorblindMode
    this.reducedMotionFlag = !!this.settings.reducedMotion
    this.previousOffset = this.settings.inputOffsetMs ?? snapshot.offsetMs
    this.sampleSparkColor = this.colorblind ? 0xffb347 : 0x66ffda
    this.accentColor = this.colorblind ? 0xffb347 : 0x00e5ff
    this.accentAltColor = this.colorblind ? 0xfff4b8 : 0x66ffda
    if (this.sound.cache.exists('metronome')) {
      this.metronome = this.sound.add('metronome', {
        volume: Phaser.Math.Clamp(this.sfxVolume * 0.45, 0, 1),
        loop: false
      })
    }

    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.78)')

    this.backdrop = this.add.graphics()
    const marginX = width * 0.08
    const marginY = height * 0.07
    const panelWidth = width - marginX * 2
    const panelHeight = height - marginY * 2
    const panelRadius = 28
    const panelColor = this.colorblind ? 0x101c2b : 0x061423
    this.backdrop.fillStyle(panelColor, 0.92)
    this.backdrop.fillRoundedRect(marginX, marginY, panelWidth, panelHeight, panelRadius)
    this.backdrop.lineStyle(2, this.colorblind ? 0xffb347 : 0x1b4b66, 0.9)
    this.backdrop.strokeRoundedRect(marginX, marginY, panelWidth, panelHeight, panelRadius)

    this.timelineGraphic = this.add.graphics().setDepth(2)

    this.headline = this.add.text(width / 2, marginY + 52, 'Latency Calibration', {
      fontFamily: 'HudFont, UiFont',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.stepLabel = this.add.text(width / 2, this.headline.y + 40, '', {
      fontFamily: 'UiFont',
      fontSize: '20px',
      color: this.colorblind ? '#ffe27a' : '#ffd866'
    }).setOrigin(0.5)

    this.subheaderText = this.add.text(width / 2, this.stepLabel.y + 26, '', {
      fontFamily: 'UiFont',
      fontSize: '16px',
      color: this.colorblind ? '#ffffff' : '#a0e9ff',
      align: 'center',
      wordWrap: { width: width * 0.7 }
    }).setOrigin(0.5)

    this.infoText = this.add.text(width / 2, height * 0.38, '', {
      fontFamily: 'UiFont',
      fontSize: '18px',
      color: this.colorblind ? '#ffe27a' : '#a0e9ff',
      align: 'center',
      wordWrap: { width: width * 0.72 }
    }).setOrigin(0.5)

    this.promptText = this.add.text(width / 2, height * 0.86, 'SPACE: Start   ESC: Cancel', {
      fontFamily: 'UiFont',
      fontSize: '16px',
      color: this.colorblind ? '#ffe27a' : '#7ddff2'
    }).setOrigin(0.5)

    this.ring = new RhythmRing(this, {
      reducedMotion: this.reducedMotionFlag,
      colorblindMode: this.colorblind
    })
    this.ring.create(width / 2, height * 0.52)

    this.sampleText = this.add.text(width / 2, height * 0.63, '', {
      fontFamily: 'UiFont',
      fontSize: '16px',
      color: this.colorblind ? '#ffe27a' : '#7ddff2'
    }).setOrigin(0.5)

    this.sampleStatsText = this.add.text(width / 2, height * 0.68, '', {
      fontFamily: 'UiFont',
      fontSize: '14px',
      color: this.colorblind ? '#ffffff' : '#a0e9ff'
    }).setOrigin(0.5)

    this.sampleBarBg = this.add.rectangle(width / 2, height * 0.72, width * 0.38, 12, this.colorblind ? 0x1e2f3a : 0x10303f, 0.7).setOrigin(0.5)
    const barLeft = (this.sampleBarBg?.x ?? width / 2) - (this.sampleBarBg?.width ?? 0) / 2
    this.sampleBarFill = this.add.rectangle(barLeft, height * 0.72, 0, 12, this.accentColor, 0.95).setOrigin(0, 0.5)

    this.previewHintText = this.add.text(width / 2, height * 0.78, '', {
      fontFamily: 'UiFont',
      fontSize: '14px',
      color: this.colorblind ? '#ffe27a' : '#7ddff2'
    }).setOrigin(0.5).setAlpha(0)

    this.countdownRing = this.add.graphics().setDepth(5)

    this.input.keyboard!.on('keydown-SPACE', this.handleSpace, this)
    this.input.keyboard!.on('keydown-A', this.handleApplyKey, this)
    this.input.keyboard!.on('keydown-R', this.handleRetryKey, this)
    this.input.keyboard!.on('keydown-ESC', this.exit, this)
    this.input.on('pointerdown', this.handlePointer, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopBeatClock()
      this.metronome?.stop()
      this.metronome?.destroy()
      this.metronome = undefined
      this.timelineLabels.forEach((label) => label.destroy())
      this.timelineLabels = []
    })

    this.showInstructions()
  }

  private showInstructions() {
    this.state = 'instructions'
    this.samples = 0
    this.sampleValues = []
    this.stopBeatClock()
    this.metronome?.stop()
    this.updateStepIndicator(0, 'Prepare', 'Find a quiet moment and get ready to tap along with the beat pulse.')
    this.infoText.setText('When the countdown finishes you will hear a short metronome click and see the ring pulse. Tap SPACE or click each time you perceive the beat to capture a latency sample.')
    this.promptText.setText('SPACE: Start   ESC: Cancel')
    this.resultText?.destroy()
    this.sampleText?.setText('')
    this.sampleStatsText?.setText('')
    this.countdownText?.destroy()
    this.countdownRing?.clear()
    if (this.sampleBarFill) this.sampleBarFill.width = 0
    this.confirmationText?.destroy()
    this.confirmationPulse?.destroy()
    this.confirmationText = undefined
    this.confirmationPulse = undefined
    this.pendingSnapshot = undefined
    this.previewHintText?.setAlpha(0)
  }

  private startCountdown() {
    if (this.state !== 'instructions') return
    this.state = 'countdown'
    this.promptText.setText('')
    this.updateStepIndicator(1, 'Countdown', 'Watch the timer — tapping begins the moment it reaches zero.')
    let count = 3
    this.infoText.setText('Get ready! The metronome will begin as soon as the countdown ends.')
    this.previewHintText?.setAlpha(0)
    this.countdownText?.destroy()
    this.countdownText = this.add.text(this.scale.width / 2, this.scale.height * 0.5, `${count}`, {
      fontFamily: 'HudFont, UiFont',
      fontSize: '72px',
      color: this.colorblind ? '#ffe27a' : '#66ffda'
    }).setOrigin(0.5)
    this.playSfx('ui_select', 0.7)
    this.drawCountdownRing(1)
    this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count -= 1
        if (count > 0) {
          this.countdownText?.setText(`${count}`)
          this.playSfx('ui_move', 0.7)
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
    this.updateStepIndicator(2, 'Sampling', 'Tap whenever you hear the click and see the ring pulse. Aim for steady rhythm.')
    this.infoText.setText('Tap on each beat to collect samples. You can use SPACE, mouse, or controller face buttons.')
    this.promptText.setText('SPACE / Click: Tap   ESC: Cancel')
    this.previewHintText?.setAlpha(0)
    this.stopBeatClock()
    this.metronome?.stop()
    this.countdownRing?.clear()
    if (this.sampleBarFill) this.sampleBarFill.width = 0
    this.sampleText?.setText('Samples: 0/' + this.targetSamples)
    this.sampleStatsText?.setText('')
    this.playSfx('ui_select', 0.75)
    this.beatClock = new BeatClock(this, {
      baseBpm: 120,
      latencyOffsetMs: latencyService.getOffset()
    })
    this.beatSubscription = this.beatClock.onBeat(() => {
      this.ring?.handleBeat()
      this.playMetronomeCue()
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
    this.playSfx('ui_move', 0.55)
    this.renderSampleProgress()
    const stats = this.computeStats(this.sampleValues)
    const estimateText = `  (median: ${stats.median} ms)`
    this.sampleText?.setText(`Samples: ${this.samples}/${this.targetSamples}${estimateText}`)
    this.renderSampleStats(stats)
    if (this.samples >= this.targetSamples) {
      this.finishSampling()
    }
  }

  private finishSampling() {
    this.state = 'preview'
    this.stopBeatClock()
    const snapshot = latencyService.completeCalibration()
    this.pendingSnapshot = snapshot
    const { offsetMs } = snapshot
    const stats = this.computeStats(this.sampleValues)
    this.renderSampleStats(stats)
    if (this.sampleBarFill && this.sampleBarBg) this.sampleBarFill.width = this.sampleBarBg.width
    this.resultText?.destroy()
    const diff = offsetMs - this.previousOffset
    const diffText = diff === 0 ? 'Δ 0 ms' : `Δ ${diff > 0 ? '+' : ''}${diff} ms`
    this.resultText = this.add.text(this.scale.width / 2, this.scale.height * 0.6, `Suggested Offset: ${offsetMs} ms  (${diffText})`, {
      fontFamily: 'UiFont',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.updateStepIndicator(3, 'Review', 'Preview the suggested offset. Apply it if the cue now lines up, or retry to gather fresh samples.')
    this.infoText.setText('Keep tapping with the preview to confirm the timing. Press A to apply this offset, R to collect new samples, or ESC to cancel.')
    this.promptText.setText('A: Apply   R: Retry   ESC: Cancel')
    this.previewHintText?.setText('Metronome preview uses the suggested offset. Tap along to confirm the feel before applying.')
    this.previewHintText?.setAlpha(1)
    this.playSfx('ui_select', 0.8)
    this.startPreviewLoop(offsetMs)
  }

  private apply(offsetMs: number) {
    const profile = profileService.getActiveProfile()
    if (profile) {
      profileService.updateSettings(profile.id, { inputOffsetMs: offsetMs })
    } else {
      latencyService.setOffset(offsetMs, 'manual')
    }
    this.previousOffset = offsetMs
    this.pendingSnapshot = latencyService.getSnapshot()
    this.playSfx('ui_select', 0.9)
    this.updateStepIndicator(3, 'Saved', 'Offset applied to your profile. Keep previewing or press ESC to return to settings.')
    this.promptText.setText('ESC: Return   R: Resample')
    const profileName = profile?.name ?? 'Active profile'
    this.infoText.setText(`${profileName} now uses an input offset of ${offsetMs} ms.`)
    this.previewHintText?.setText('Preview will continue with the saved offset. Press R to collect new samples or ESC to exit.')
    this.previewHintText?.setAlpha(1)
    this.showConfirmation(offsetMs)
    this.startPreviewLoop(offsetMs)
  }

  private retry() {
    this.stopBeatClock()
    this.metronome?.stop()
    latencyService.cancelCalibration()
    this.showInstructions()
  }

  private exit = () => {
    this.stopBeatClock()
    this.metronome?.stop()
    this.metronome?.destroy()
    this.metronome = undefined
    this.input.keyboard?.off('keydown-SPACE', this.handleSpace, this)
    this.input.keyboard?.off('keydown-A', this.handleApplyKey, this)
    this.input.keyboard?.off('keydown-R', this.handleRetryKey, this)
    this.input.keyboard?.off('keydown-ESC', this.exit, this)
    this.input.off('pointerdown', this.handlePointer, this)
    this.timelineLabels.forEach((label) => label.destroy())
    this.timelineLabels = []
    this.scene.stop()
    this.scene.resume(this.returnScene)
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
    if (this.state === 'instructions') {
      this.startCountdown()
      return
    }
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
    spark.fillStyle(this.sampleSparkColor, 0.9)
    spark.fillCircle(0, 0, 6)
    if (!this.isReducedMotion()) {
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

  private updateStepIndicator(stepIndex: number, label: string, caption: string): void {
    const totalSteps = 4
    this.stepLabel.setText(`Step ${stepIndex + 1} of ${totalSteps} · ${label}`)
    this.subheaderText.setText(caption)
    this.drawStepTimeline(stepIndex)
  }

  private drawStepTimeline(activeIndex: number): void {
    if (!this.timelineGraphic) return
    const steps = ['Prepare', 'Countdown', 'Sample', 'Review']
    const { width } = this.scale
    const lineY = this.stepLabel.y - 20
    const startX = width * 0.22
    const endX = width * 0.78
    const stepSpacing = (endX - startX) / (steps.length - 1)
    this.timelineGraphic.clear()
    this.timelineGraphic.lineStyle(2, this.accentColor, 0.35)
    this.timelineGraphic.beginPath()
    this.timelineGraphic.moveTo(startX, lineY)
    this.timelineGraphic.lineTo(endX, lineY)
    this.timelineGraphic.strokePath()

    while (this.timelineLabels.length < steps.length) {
      const label = this.add.text(0, 0, '', {
        fontFamily: 'UiFont',
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(3)
      this.timelineLabels.push(label)
    }

    steps.forEach((step, index) => {
      const x = startX + stepSpacing * index
      const isPast = index < activeIndex
      const isActive = index === activeIndex
      const fillColor = isActive ? this.accentColor : (isPast ? this.accentAltColor : (this.colorblind ? 0x3c5063 : 0x23374a))
      const alpha = isActive ? 1 : isPast ? 0.9 : 0.45
      this.timelineGraphic.fillStyle(fillColor, alpha)
      this.timelineGraphic.fillCircle(x, lineY, 8)
      this.timelineGraphic.lineStyle(2, this.accentColor, 0.55)
      this.timelineGraphic.strokeCircle(x, lineY, 8)
      const label = this.timelineLabels[index]
      label.setText(step)
      label.setPosition(x, lineY + 18)
      label.setColor(isActive || isPast ? '#ffffff' : '#9aaabf')
      label.setAlpha(isActive ? 1 : isPast ? 0.85 : 0.6)
      label.setVisible(true)
    })
  }

  private playSfx(key: string, multiplier = 1) {
    const volume = Phaser.Math.Clamp(this.sfxVolume * multiplier, 0, 1)
    if (volume <= 0) return
    if (!this.sound.get(key) && !this.sound.cache.exists(key)) return
    this.sound.play(key, { volume })
  }

  private playMetronomeCue(multiplier = 1) {
    if (!this.metronome) return
    if (this.metronome.isPlaying) this.metronome.stop()
    this.metronome.setVolume(Phaser.Math.Clamp(this.sfxVolume * 0.5 * multiplier, 0, 1))
    this.metronome.play()
  }

  private stopBeatClock() {
    if (this.beatSubscription) {
      this.beatSubscription()
      this.beatSubscription = undefined
    }
    this.beatClock?.stop()
    this.beatClock = undefined
  }

  private startPreviewLoop(offsetMs: number) {
    this.stopBeatClock()
    this.beatClock = new BeatClock(this, {
      baseBpm: 120,
      latencyOffsetMs: offsetMs
    })
    this.beatSubscription = this.beatClock.onBeat(() => {
      this.ring?.handleBeat()
      this.playMetronomeCue()
      this.flashPreviewGlow()
    })
    this.beatClock.start()
  }

  private flashPreviewGlow() {
    if (this.isReducedMotion()) return
    const glow = this.add.graphics()
    const radius = Math.min(this.scale.width, this.scale.height) * 0.18 + 16
    glow.lineStyle(2, this.accentAltColor, 0.8)
    glow.strokeCircle(this.scale.width / 2, this.scale.height * 0.52, radius)
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.8, to: 0 },
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => glow.destroy()
    })
  }

  private renderSampleStats(stats: SampleStats | null = null): void {
    const target = this.sampleStatsText
    if (!target) return
    if (!stats && this.sampleValues.length === 0) {
      target.setText('')
      return
    }
    const data = stats ?? this.computeStats(this.sampleValues)
    const spreadText = `${data.spread} ms`
    const stdText = data.stdDev > 0 ? `${data.stdDev} ms σ` : '0 ms σ'
    target.setText(`Median ${data.median} ms  •  Avg ${data.mean} ms  •  Spread ${spreadText}  •  Std ${stdText}`)
  }

  private computeStats(values: number[]): SampleStats {
    if (values.length === 0) {
      return { median: 0, mean: 0, spread: 0, stdDev: 0 }
    }
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : Math.round(sorted[mid])
    const mean = Math.round(values.reduce((acc, val) => acc + val, 0) / values.length)
    const spread = Math.round(Math.max(...sorted) - Math.min(...sorted))
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.round(Math.sqrt(variance))
    return { median, mean, spread, stdDev }
  }

  private isReducedMotion(): boolean {
    return this.reducedMotionFlag
  }

  private showConfirmation(offsetMs: number): void {
    const { width, height } = this.scale
    this.confirmationText?.destroy()
    this.confirmationPulse?.destroy()

    this.confirmationPulse = this.add.graphics({ x: width / 2, y: height * 0.74 })
    this.confirmationPulse.fillStyle(this.accentColor, 0.3)
    this.confirmationPulse.fillCircle(0, 0, 52)

    this.confirmationText = this.add.text(width / 2, height * 0.74, `Offset saved: ${offsetMs} ms`, {
      fontFamily: 'UiFont',
      fontSize: '18px',
      color: this.colorblind ? '#ffe27a' : '#66ffda'
    }).setOrigin(0.5).setAlpha(0)

    if (!this.isReducedMotion()) {
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
    this.countdownRing.lineStyle(6, this.accentColor, 0.75)
    this.countdownRing.beginPath()
    this.countdownRing.arc(width / 2, height * 0.5, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress, false)
    this.countdownRing.strokePath()
  }
}
