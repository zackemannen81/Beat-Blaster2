import Phaser from 'phaser'
import { eventBus } from '../core/EventBus'

export type BeatSubscription = () => void

export interface BeatClockOptions {
  baseBpm: number
  offsetMs?: number
  latencyOffsetMs?: number
}

interface BeatListener {
  division: number
  handler: (beatIndex: number, timestamp: number) => void
}

export default class BeatClock {
  private scene: Phaser.Scene
  private bpm: number
  private offsetMs: number
  private latencyOffsetMs: number
  private beatIndex = 0
  private startedAt = 0
  private schedule?: Phaser.Time.TimerEvent
  private listeners: BeatListener[] = []

  constructor(scene: Phaser.Scene, options: BeatClockOptions) {
    this.scene = scene
    this.bpm = Math.max(30, options.baseBpm)
    this.offsetMs = options.offsetMs ?? 0
    this.latencyOffsetMs = options.latencyOffsetMs ?? 0
  }

  start(): void {
    this.stop()
    this.startedAt = this.now() + this.offsetMs + this.latencyOffsetMs
    this.beatIndex = 0
    const interval = this.beatPeriodMs()
    this.schedule = this.scene.time.addEvent({
      delay: interval,
      loop: true,
      callback: () => this.tick()
    })
  }

  stop(): void {
    this.schedule?.remove()
    this.schedule = undefined
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(30, bpm)
    if (this.schedule) {
      this.start()
    }
  }

  setLatencyOffset(ms: number): void {
    this.latencyOffsetMs = ms
    if (this.schedule) {
      this.start()
    }
  }

  syncFromAnalyzer(estPeriodMs: number, lastBeatAtMs: number): void {
    this.startedAt = lastBeatAtMs - this.beatIndex * estPeriodMs
    this.bpm = 60000 / estPeriodMs
  }

  onBeat(handler: (beatIndex: number, timestamp: number) => void): BeatSubscription {
    this.listeners.push({ division: 1, handler })
    return () => this.removeListener(handler)
  }

  onSubBeat(division: number, handler: (beatIndex: number, timestamp: number) => void): BeatSubscription {
    const div = Math.max(1, Math.floor(division))
    this.listeners.push({ division: div, handler })
    return () => this.removeListener(handler)
  }

  getBeatProgress(): number {
    const now = this.now()
    const elapsed = now - this.lastBeatTimestamp()
    return Phaser.Math.Clamp(elapsed / this.beatPeriodMs(), 0, 1)
  }

  isWithinWindow(windowMs: number): boolean {
    const now = this.now()
    const delta = Math.abs(now - this.lastBeatTimestamp())
    return delta <= windowMs
  }

  msSinceLastBeat(): number {
    const now = this.now()
    return now - this.lastBeatTimestamp()
  }

  msUntilNextBeat(): number {
    return this.nextBeatTimestamp() - this.now()
  }

  private tick(): void {
    const timestamp = this.lastBeatTimestamp()
    const beatNumber = this.beatIndex
    eventBus.emit('beat:tick', {
      beat: beatNumber,
      bar: Math.floor(beatNumber / 4),
      timestamp
    })

    const windowPayload = {
      msUntilNext: this.nextBeatTimestamp() - this.now(),
      windowMs: this.beatPeriodMs()
    }
    eventBus.emit('beat:window', windowPayload)

    for (const listener of this.listeners) {
      if (beatNumber % listener.division === 0) {
        listener.handler(beatNumber, timestamp)
      }
    }

    this.beatIndex += 1
  }

  private lastBeatTimestamp(): number {
    return this.startedAt + this.beatIndex * this.beatPeriodMs()
  }

  private nextBeatTimestamp(): number {
    return this.startedAt + (this.beatIndex + 1) * this.beatPeriodMs()
  }

  private beatPeriodMs(): number {
    return 60000 / this.bpm
  }

  private now(): number {
    return this.scene.game.loop.now
  }

  private removeListener(handler: (beatIndex: number, timestamp: number) => void): void {
    this.listeners = this.listeners.filter((entry) => entry.handler !== handler)
  }
}
