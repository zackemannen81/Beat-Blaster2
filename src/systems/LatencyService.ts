import { eventBus } from '../core/EventBus'

type LatencySource = 'default' | 'calibration' | 'manual'

export interface ProfileLatencyData {
  offsetMs: number
  updatedAt: number
}

export interface LatencySnapshot {
  offsetMs: number
  updatedAt: number
  source: LatencySource
}

export class LatencyService {
  private offsetMs = 0
  private updatedAt = 0
  private source: LatencySource = 'default'
  private calibrationSamples: number[] = []
  private calibrating = false

  getOffset(): number {
    return this.offsetMs
  }

  getSnapshot(): LatencySnapshot {
    return {
      offsetMs: this.offsetMs,
      updatedAt: this.updatedAt,
      source: this.source
    }
  }

  setOffset(ms: number, source: LatencySource = 'manual'): LatencySnapshot {
    const clamped = Number.isFinite(ms) ? Math.round(ms) : 0
    this.offsetMs = clamped
    this.updatedAt = Date.now()
    this.source = source
    const snapshot = this.getSnapshot()
    eventBus.emit('latency:changed', snapshot)
    return snapshot
  }

  beginCalibration(): void {
    this.calibrationSamples = []
    this.calibrating = true
  }

  recordSample(deltaMs: number): void {
    if (!this.calibrating) return
    if (!Number.isFinite(deltaMs)) return
    this.calibrationSamples.push(deltaMs)
  }

  completeCalibration(): LatencySnapshot {
    if (!this.calibrating || this.calibrationSamples.length === 0) {
      this.calibrating = false
      return this.getSnapshot()
    }
    const sorted = [...this.calibrationSamples].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : Math.round(sorted[mid])
    this.calibrating = false
    this.calibrationSamples = []
    return this.setOffset(median, 'calibration')
  }

  cancelCalibration(): void {
    this.calibrating = false
    this.calibrationSamples = []
  }

  loadFromProfile(data?: ProfileLatencyData | null): void {
    if (!data) {
      this.offsetMs = 0
      this.updatedAt = 0
      this.source = 'default'
      return
    }
    this.offsetMs = Number.isFinite(data.offsetMs) ? Math.round(data.offsetMs) : 0
    this.updatedAt = data.updatedAt || Date.now()
    this.source = 'default'
  }

  serialize(): ProfileLatencyData {
    return {
      offsetMs: this.offsetMs,
      updatedAt: this.updatedAt || Date.now()
    }
  }
}

export const latencyService = new LatencyService()
