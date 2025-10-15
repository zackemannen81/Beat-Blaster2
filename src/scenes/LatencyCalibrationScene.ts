import Phaser from 'phaser'
import RhythmRing from '../ui/RhythmRing'
import BeatClock from '../audio/BeatClock'
import { latencyService } from '../systems/LatencyService'
import { profileService } from '../systems/ProfileService'

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
  private targetSamples = 20
  private samples = 0
  private returnScene = 'OptionsScene'

  create(data: LatencySceneData = {}) {
    this.returnScene = data.returnScene ?? 'OptionsScene'
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.75)')

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

    this.input.keyboard!.once('keydown-SPACE', () => this.startCountdown())
    this.input.keyboard!.on('keydown-ESC', () => this.exit())
    this.input.on('pointerdown', () => this.captureSample())
    this.input.keyboard!.on('keydown-SPACE', () => this.captureSample())

    this.showInstructions()
  }

  private showInstructions() {
    this.state = 'instructions'
    this.samples = 0
    this.infoText.setText('Tap along with the beat to measure audio/input latency.\nWhen ready, press SPACE to begin the countdown.')
    this.promptText.setText('SPACE: Start   ESC: Cancel')
    this.resultText?.destroy()
  }

  private startCountdown() {
    if (this.state !== 'instructions') return
    this.state = 'countdown'
    this.promptText.setText('')
    let count = 3
    this.infoText.setText(`Starting in ${count}`)
    this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count -= 1
        if (count > 0) {
          this.infoText.setText(`Starting in ${count}`)
        } else {
          this.startSampling()
        }
      }
    })
  }

  private startSampling() {
    this.state = 'sampling'
    this.samples = 0
    latencyService.beginCalibration()
    this.infoText.setText('Tap on each beat. Collecting samples...')
    this.promptText.setText('SPACE / Click: Tap   ESC: Cancel')
    this.beatClock?.stop()
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
    this.samples += 1
    this.infoText.setText(`Samples: ${this.samples}/${this.targetSamples}`)
    if (this.samples >= this.targetSamples) {
      this.finishSampling()
    }
  }

  private finishSampling() {
    this.state = 'preview'
    this.beatClock?.stop()
    const snapshot = latencyService.completeCalibration()
    const { offsetMs } = snapshot
    this.resultText?.destroy()
    this.resultText = this.add.text(this.scale.width / 2, this.scale.height * 0.6, `Suggested Offset: ${offsetMs} ms`, {
      fontFamily: 'UiFont',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.infoText.setText('Apply this offset to adjust latency, retry to capture new samples, or cancel to discard changes.')
    this.promptText.setText('A: Apply   R: Retry   ESC: Cancel')
    this.input.keyboard!.once('keydown-A', () => this.apply(snapshot.offsetMs))
    this.input.keyboard!.once('keydown-R', () => this.retry())
  }

  private apply(offsetMs: number) {
    const profile = profileService.getActiveProfile()
    if (profile) {
      profileService.updateSettings(profile.id, { inputOffsetMs: offsetMs })
    } else {
      latencyService.setOffset(offsetMs, 'manual')
    }
    this.exit()
  }

  private retry() {
    this.beatClock?.stop()
    this.showInstructions()
    this.input.keyboard!.once('keydown-SPACE', () => this.startCountdown())
  }

  private exit() {
    this.beatClock?.stop()
    this.scene.stop()
    this.scene.resume(this.returnScene)
  }
}
