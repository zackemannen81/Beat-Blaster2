import Phaser from 'phaser'

export interface AbilityState {
  id: string
  label: string
  cooldownMs: number
  remainingMs: number
  tier: number
  beatBonus?: string
  iconKey?: string
}

interface AbilitySlot {
  container: Phaser.GameObjects.Container
  cooldown: Phaser.GameObjects.Graphics
  glow: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  tierText: Phaser.GameObjects.Text
  state: AbilityState
}

export default class AbilityOverlay {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private bombContainer: Phaser.GameObjects.Container
  private bombGauge: Phaser.GameObjects.Graphics
  private bombPulse: Phaser.GameObjects.Graphics
  private slots = new Map<string, AbilitySlot>()
  private reducedMotion = false

  constructor(scene: Phaser.Scene, position: { x: number; y: number }) {
    this.scene = scene
    this.container = scene.add.container(position.x, position.y).setDepth(88)

    this.bombContainer = scene.add.container(0, 0)
    this.container.add(this.bombContainer)

    const bombBg = scene.add.circle(0, 0, 46, 0x101a24, 0.85)
    bombBg.setStrokeStyle(2, 0x1f4260, 0.9)
    this.bombGauge = scene.add.graphics()
    this.bombPulse = scene.add.graphics()
    this.bombContainer.add([bombBg, this.bombGauge, this.bombPulse])

    scene.add.text(0, 60, 'Bomb', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '14px',
      color: '#a0e9ff'
    }).setOrigin(0.5).setDepth(1).setScrollFactor(0).setData('hud', true)
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y)
  }

  destroy(): void {
    this.container.destroy(true)
    this.slots.clear()
  }

  setReducedMotion(flag: boolean): void {
    this.reducedMotion = flag
  }

  setBombCharge(pct: number): void {
    const clamped = Phaser.Math.Clamp(pct, 0, 1)
    this.bombGauge.clear()
    this.bombGauge.lineStyle(6, 0x00e5ff, 0.9)
    this.bombGauge.beginPath()
    this.bombGauge.arc(0, 0, 42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamped, false)
    this.bombGauge.strokePath()
  }

  setAbilityStates(states: AbilityState[]): void {
    // Remove old slots
    this.slots.forEach((slot) => slot.container.destroy())
    this.slots.clear()

    if (states.length === 0) {
      return
    }

    const spacing = 130
    const startX = -spacing * (states.length - 1) * 0.5

    states.forEach((state, index) => {
      const slotX = startX + index * spacing
      const slot = this.createSlot(slotX, 0, state)
      this.slots.set(state.id, slot)
    })
  }

  updateAbilityCooldown(id: string, remainingMs: number, cooldownMs?: number): void {
    const slot = this.slots.get(id)
    if (!slot) return
    slot.state.remainingMs = remainingMs
    if (typeof cooldownMs === 'number') slot.state.cooldownMs = cooldownMs
    this.drawCooldown(slot)
  }

  flashBeat(): void {
    this.slots.forEach((slot) => {
      if (slot.state.remainingMs <= 0) {
        slot.glow.clear()
        slot.glow.fillStyle(0x00e5ff, 0.4)
        slot.glow.fillCircle(0, 0, 58)
        if (!this.reducedMotion) {
          this.scene.tweens.add({
            targets: slot.glow,
            alpha: 0,
            scale: 1.2,
            duration: 220,
            ease: 'Quad.easeOut'
          })
        } else {
          slot.glow.setAlpha(0.3)
        }
      }
    })
  }

  private createSlot(x: number, y: number, state: AbilityState): AbilitySlot {
    const container = this.scene.add.container(x, y)
    const glow = this.scene.add.graphics().setAlpha(0)
    const bg = this.scene.add.circle(0, 0, 46, 0x101a24, 0.85)
    bg.setStrokeStyle(2, 0x1f4260, 0.9)
    const cooldown = this.scene.add.graphics()

    container.add([glow, bg, cooldown])

    if (state.iconKey && this.scene.textures.exists(state.iconKey)) {
      const icon = this.scene.add.image(0, 0, state.iconKey).setDisplaySize(48, 48)
      container.add(icon)
    } else {
      const initials = state.label.split(' ').map((p) => p[0] ?? '').join('').slice(0, 2)
      const iconText = this.scene.add.text(0, 0, initials || '?', {
        fontFamily: 'HudFont, UiFont',
        fontSize: '22px',
        color: '#a0e9ff'
      }).setOrigin(0.5)
      container.add(iconText)
    }

    const label = this.scene.add.text(0, 58, state.label, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '14px',
      color: '#a0e9ff'
    }).setOrigin(0.5)
    container.add(label)

    const tierText = this.scene.add.text(34, -44, `T${state.tier}`, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '12px',
      color: '#ffd866'
    }).setOrigin(0.5)
    container.add(tierText)

    if (state.beatBonus) {
      const bonus = this.scene.add.text(0, 82, state.beatBonus, {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '12px',
        color: '#7ddff2'
      }).setOrigin(0.5)
      container.add(bonus)
    }

    this.container.add(container)

    const slot: AbilitySlot = {
      container,
      cooldown,
      glow,
      label,
      tierText,
      state: { ...state }
    }

    this.drawCooldown(slot)
    return slot
  }

  private drawCooldown(slot: AbilitySlot): void {
    const { remainingMs, cooldownMs } = slot.state
    const fraction = cooldownMs > 0 ? Phaser.Math.Clamp(remainingMs / cooldownMs, 0, 1) : 0
    slot.cooldown.clear()
    if (fraction <= 0) {
      slot.cooldown.lineStyle(4, 0x66ffda, 0.95)
      slot.cooldown.strokeCircle(0, 0, 40)
    } else {
      slot.cooldown.lineStyle(6, 0x395a7a, 0.85)
      slot.cooldown.beginPath()
      slot.cooldown.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction, false)
      slot.cooldown.strokePath()
    }
  }
}
