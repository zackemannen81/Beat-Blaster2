// LaneManager.ts
// Hanterar lane-geometri (3/5/7), centerX-beräkning, "nearest", index-mapping och lane-byten.
// Emittar "lanes:changed" när antalet lanes ändras, så spelare/fiender kan tweena om.

// Phaser referens: ScaleManager (scene.scale), Scenes & Events (scene.events / EventEmitter).
// Tweens/easing som oftast används: Sine.InOut för mjuk snap. 
// Docs: ScaleManager, Scenes/Events, Tweens/Easing, Sprite/Physics. 
// (Se README/ROADMAP för integrationstips.)

import Phaser from 'phaser'

export type LaneIndex = number // 0 .. (count-1)

export interface Lane {
  index: LaneIndex
  centerX: number
}

export type LaneCount = 3 | 5 | 7

export type LaneSnapPointType = 'lane' | 'between'

export interface LaneSnapPoint {
  type: LaneSnapPointType
  centerX: number
  /** Sorted list of lane indices this snap point is associated with. */
  laneIndices: LaneIndex[]
}

export interface LaneConfig {
  scene: Phaser.Scene
  /** Hur många lanes initialt (3/5/7). */
  count: LaneCount
  /** Vänster kant där lanes börjar i world-space. Vanligtvis 0. */
  left?: number
  /** Bredd på lane-området i px (oftast scene.scale.width). */
  width?: number
  /** Om true, ritar debug-linjer och etiketter. */
  debug?: boolean
  /** Färg på debug-linjer. */
  debugColor?: number
}

export default class LaneManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene
  private count: LaneCount
  private left: number
  private width: number
  private lanes: Lane[] = []
  private step: number = 0
  private snapPoints: LaneSnapPoint[] = []
  private debugGfx?: Phaser.GameObjects.Graphics
  private debugTxt?: Phaser.GameObjects.Text[]

  // Event-namn
  static EVT_CHANGED = 'lanes:changed'

  constructor(cfg: LaneConfig) {
    super()
    this.scene = cfg.scene
    this.count = cfg.count
    this.left = cfg.left ?? 0
    this.width = cfg.width ?? this.scene.scale.width
    this.build()

    if (cfg.debug) {
      this.enableDebug(cfg.debugColor ?? 0x00ffff)
    }

    // Om canvasen resizas: uppdatera geometri (om du vill att lanes följer skalan)
    // Annars kan du ta bort detta om du kör fixed resolution.
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this)
  }

  destroy(fromScene?: boolean) {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this)
    this.disableDebug()
    super.removeAllListeners()
    super.destroy?.()
  }

  /** Återuppbygger lanes när count/width ändras. */
  private build() {
    // "Steg" mellan centers = width / (count + 1) (ger luft i kanterna)
    this.step = this.width / (this.count + 1)
    const lanes: Lane[] = []
    for (let i = 0; i < this.count; i++) {
      const rawCenter = this.left + this.step * (i + 1)
      const centerX = Math.round(rawCenter)
      lanes.push({ index: i, centerX })
    }
    this.lanes = lanes

    const snapPoints: LaneSnapPoint[] = []
    for (const lane of lanes) {
      snapPoints.push({
        type: 'lane',
        centerX: lane.centerX,
        laneIndices: [lane.index]
      })
    }
    for (let i = 0; i < lanes.length - 1; i++) {
      const left = lanes[i]
      const right = lanes[i + 1]
      const centerX = Math.round((left.centerX + right.centerX) / 2)
      snapPoints.push({
        type: 'between',
        centerX,
        laneIndices: [left.index, right.index]
      })
    }
    snapPoints.sort((a, b) => a.centerX - b.centerX)
    this.snapPoints = snapPoints

    this.emit(LaneManager.EVT_CHANGED, this.getSnapshot())
    this.redrawDebug()
  }

  /** Byt antal lanes (3/5/7) – triggar EVT_CHANGED. */
  rebuild(count: LaneCount, opts?: { left?: number; width?: number }) {
    this.count = count
    if (typeof opts?.left === 'number') this.left = opts.left
    if (typeof opts?.width === 'number') this.width = opts.width
    this.build()
  }

  /** Returnerar en shallow-kopia av lanes + metadata (för HUD). */
  getSnapshot() {
    return {
      count: this.count,
      left: this.left,
      width: this.width,
      lanes: this.lanes.map(l => ({ ...l }))
    }
  }

  getCount(): LaneCount {
    return this.count
  }

  getAll(): Lane[] {
    return this.lanes
  }

  getSnapPoints(): LaneSnapPoint[] {
    return this.snapPoints
  }

  /** Returns the snap point associated with a specific lane index, if any. */
  getLaneSnapPoint(index: LaneIndex): LaneSnapPoint | undefined {
    return this.snapPoints.find(point =>
      point.type === 'lane' && point.laneIndices[0] === index
    )
  }

  /** Center-X för ett lane-index. */
  centerX(index: LaneIndex): number {
    return this.lanes[Math.max(0, Math.min(this.lanes.length - 1, index))].centerX
  }

  /** Returnera närmaste lane till en given X-position. */
  nearest(x: number): Lane {
    return this.lanes.reduce((a, b) =>
      Math.abs(a.centerX - x) < Math.abs(b.centerX - x) ? a : b
    )
  }

  nearestSnap(x: number): LaneSnapPoint | undefined {
    if (this.snapPoints.length === 0) return undefined
    return this.snapPoints.reduce((a, b) =>
      Math.abs(a.centerX - x) <= Math.abs(b.centerX - x) ? a : b
    )
  }

  /** Returnera mitt-lane om udda antal lanes (t.ex. 7 → index 3). Annars null. */
  middle(): Lane | null {
    return this.lanes.length % 2 === 1 ? this.lanes[(this.lanes.length - 1) >> 1] : null
  }

  /**
   * Mappar en godtycklig X-position till lane-index (närmsta).
   * Bra när du vill “re-snap:a” sprites efter lane-antal ändras.
   */
  indexAt(x: number): LaneIndex {
    return this.nearest(x).index
  }

  /**
   * Hjälp för sticky snap: returnerar target-X att gå mot.
   * Om ‘deadzone’ anges och du redan är nära center → returnerar center direkt.
   */
  snap(x: number, deadzone = 0): number {
    const lane = this.nearest(x)
    return Math.abs(lane.centerX - x) <= deadzone ? lane.centerX : lane.centerX
  }

  /** Debug-overlay (linjer + index). */
  enableDebug(color = 0x00ffff) {
    if (this.debugGfx) return
    this.debugGfx = this.scene.add.graphics().setDepth(1e6)
    this.debugTxt = []
    this.redrawDebug(color)
  }

  disableDebug() {
    this.debugGfx?.destroy()
    this.debugGfx = undefined
    this.debugTxt?.forEach(t => t.destroy())
    this.debugTxt = undefined
  }

  private redrawDebug(color = 0x00ffff) {
    if (!this.debugGfx) return
    const g = this.debugGfx
    g.clear()
    g.lineStyle(1, color, 0.6)

    this.debugTxt?.forEach(t => t.destroy())
    this.debugTxt = []

    const h = this.scene.scale.height
    for (const lane of this.lanes) {
      g.beginPath()
      g.moveTo(lane.centerX, 0)
      g.lineTo(lane.centerX, h)
      g.strokePath()

      const label = this.scene.add
        .text(lane.centerX, 8, `L${lane.index}`, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#00ffff'
        })
        .setOrigin(0.5, 0)
        .setDepth(1e6)
      this.debugTxt!.push(label)
    }
  }

  private onResize() {
    // Om du vill att lanes följer ny bredd automatiskt:
    this.width = this.scene.scale.width
    this.build()
  }
}
