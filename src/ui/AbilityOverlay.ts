import Phaser from 'phaser'
import type { AbilityState } from '../types/ability'

interface AbilitySlot {
  container: Phaser.GameObjects.Container
  glow: Phaser.GameObjects.Graphics
  cooldown: Phaser.GameObjects.Graphics
  active: Phaser.GameObjects.Graphics
  icon?: Phaser.GameObjects.Image | Phaser.GameObjects.Text
  label: Phaser.GameObjects.Text
  hint?: Phaser.GameObjects.Text
  bonus?: Phaser.GameObjects.Text
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
  private order: string[] = []
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

    const bombLabel = scene.add.text(0, 60, 'Bomb', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '14px',
      color: '#a0e9ff'
    }).setOrigin(0.5)
    this.bombContainer.add(bombLabel)
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
    this.bombGauge.lineStyle(6, clamped >= 1 ? 0xffd866 : 0x00e5ff, 0.95)
    this.bombGauge.beginPath()
    this.bombGauge.arc(0, 0, 42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamped, false)
    this.bombGauge.strokePath()

    if (clamped >= 1) {
      this.bombPulse.clear()
      this.bombPulse.fillStyle(0xffd866, 0.35)
      this.bombPulse.fillCircle(0, 0, 52)
      if (!this.reducedMotion) {
        this.scene.tweens.add({
          targets: this.bombPulse,
          alpha: 0,
          scale: 1.2,
          duration: 320,
          ease: 'Cubic.easeOut',
          onComplete: () => this.bombPulse.clear()
        })
      }
    }
  }

  setAbilityStates(states: AbilityState[]): void {
    this.order = states.map((state) => state.id)
    if (states.length === 0) {
      this.slots.forEach((slot) => slot.container.destroy())
      this.slots.clear()
      return
    }
    const seen = new Set<string>()
    states.forEach((state) => {
      const slot = this.ensureSlot(state)
      this.applyState(slot, state)
      seen.add(state.id)
    })

    this.slots.forEach((slot, id) => {
      if (!seen.has(id)) {
        slot.container.destroy()
        this.slots.delete(id)
      }
    })

    this.layoutSlots()
  }

  updateAbilityState(state: AbilityState): void {
    const slot = this.slots.get(state.id)
    if (!slot) return
    this.applyState(slot, state)
  }

  flashBeat(): void {
    this.slots.forEach((slot) => {
      if (slot.state.status !== 'ready') return
      slot.glow.clear()
      slot.glow.fillStyle(0x00e5ff, 0.45)
      slot.glow.fillCircle(0, 0, 58)
      if (this.reducedMotion) {
        slot.glow.setAlpha(0.35)
        return
      }
      this.scene.tweens.add({
        targets: slot.glow,
        alpha: 0,
        scale: 1.2,
        duration: 240,
        ease: 'Quad.easeOut'
      })
    })
  }

  private ensureSlot(state: AbilityState): AbilitySlot {
    const existing = this.slots.get(state.id)
    if (existing) return existing

    const container = this.scene.add.container(0, 0)
    const glow = this.scene.add.graphics().setAlpha(0)
    const bg = this.scene.add.circle(0, 0, 46, 0x101a24, 0.85)
    bg.setStrokeStyle(2, 0x1f4260, 0.9)
    const active = this.scene.add.graphics()
    const cooldown = this.scene.add.graphics()

    container.add([glow, bg, active, cooldown])

    let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Text | undefined
    if (state.iconKey && this.scene.textures.exists(state.iconKey)) {
      icon = this.scene.add.image(0, 0, state.iconKey).setDisplaySize(48, 48)
      container.add(icon)
    } else {
      const initials = state.label
        .split(' ')
        .map((segment) => segment[0] ?? '')
        .join('')
        .slice(0, 2)
      icon = this.scene.add.text(0, 0, initials || '?', {
        fontFamily: 'HudFont, UiFont',
        fontSize: '22px',
        color: '#a0e9ff'
      }).setOrigin(0.5)
      container.add(icon)
    }

    const label = this.scene.add.text(0, 58, state.label, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '14px',
      color: '#a0e9ff'
    }).setOrigin(0.5)
    container.add(label)

    const hint = state.inputHint
      ? this.scene.add.text(0, 76, state.inputHint, {
          fontFamily: 'UiFont, sans-serif',
          fontSize: '12px',
          color: '#7ddff2'
        }).setOrigin(0.5)
      : undefined
    if (hint) container.add(hint)

    const bonus = state.beatBonus
      ? this.scene.add.text(0, hint ? 94 : 86, state.beatBonus, {
          fontFamily: 'UiFont, sans-serif',
          fontSize: '12px',
          color: '#7ddff2',
          align: 'center',
          wordWrap: { width: 120 }
        }).setOrigin(0.5)
      : undefined
    if (bonus) container.add(bonus)

    const tierText = this.scene.add.text(34, -44, `T${state.tier}`, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '12px',
      color: '#ffd866'
    }).setOrigin(0.5)
    container.add(tierText)

    this.container.add(container)

    const slot: AbilitySlot = {
      container,
      glow,
      cooldown,
      active,
      icon,
      label,
      hint,
      bonus,
      tierText,
      state: { ...state }
    }

    this.slots.set(state.id, slot)
    return slot
  }

  private applyState(slot: AbilitySlot, state: AbilityState): void {
    slot.state = { ...state }
    slot.label.setText(state.label)
    if (slot.hint) {
      slot.hint.setText(state.inputHint ?? '')
      slot.hint.setVisible(Boolean(state.inputHint))
    } else if (state.inputHint) {
      slot.hint = this.scene.add.text(0, 76, state.inputHint, {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '12px',
        color: '#7ddff2'
      }).setOrigin(0.5)
      slot.container.add(slot.hint)
    }

    if (slot.bonus) {
      slot.bonus.setText(state.beatBonus ?? '')
      slot.bonus.setVisible(Boolean(state.beatBonus))
    } else if (state.beatBonus) {
      slot.bonus = this.scene.add.text(0, slot.hint ? 94 : 86, state.beatBonus, {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '12px',
        color: '#7ddff2',
        align: 'center',
        wordWrap: { width: 120 }
      }).setOrigin(0.5)
      slot.container.add(slot.bonus)
    }

    slot.tierText.setText(`T${state.tier}`)
    if (slot.bonus) {
      slot.bonus.setY(slot.hint && slot.hint.visible ? 94 : 86)
    }
    this.drawState(slot)
  }

  private drawState(slot: AbilitySlot): void {
    const { cooldown, active } = slot
    const { remainingMs, cooldownMs, activeRemainingMs, durationMs, status } = slot.state
    cooldown.clear()
    active.clear()

    if (status === 'active' && durationMs && durationMs > 0) {
      const fraction = Phaser.Math.Clamp(activeRemainingMs ?? 0, 0, durationMs) / durationMs
      active.lineStyle(6, 0x66ffda, 0.95)
      active.beginPath()
      active.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction, false)
      active.strokePath()
    } else if (status === 'ready') {
      cooldown.lineStyle(4, 0x66ffda, 0.95)
      cooldown.strokeCircle(0, 0, 40)
    } else if (cooldownMs > 0) {
      const fraction = Phaser.Math.Clamp(remainingMs / cooldownMs, 0, 1)
      cooldown.lineStyle(6, 0x395a7a, 0.85)
      cooldown.beginPath()
      cooldown.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction, false)
      cooldown.strokePath()
    }

    if (slot.icon && 'setTint' in slot.icon) {
      if (status === 'ready') (slot.icon as Phaser.GameObjects.Image).setTint(0xffffff)
      else if (status === 'active') (slot.icon as Phaser.GameObjects.Image).setTint(0x66ffda)
      else (slot.icon as Phaser.GameObjects.Image).setTint(0x395a7a)
    } else if (slot.icon && 'setColor' in slot.icon) {
      const color = status === 'ready' ? '#a0e9ff' : status === 'active' ? '#66ffda' : '#395a7a'
      ;(slot.icon as Phaser.GameObjects.Text).setColor(color)
    }
  }

  private layoutSlots(): void {
    const count = this.order.length
    if (count === 0) return
    const spacing = 130
    const startX = -spacing * (count - 1) * 0.5
    this.order.forEach((id, index) => {
      const slot = this.slots.get(id)
      if (!slot) return
      slot.container.setPosition(startX + index * spacing, 0)
    })
  }
}
