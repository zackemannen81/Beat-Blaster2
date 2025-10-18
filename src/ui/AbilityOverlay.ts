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
  statusText: Phaser.GameObjects.Text
  bindingHint?: string
  state: AbilityState
}

type BombStatus = 'charging' | 'ready' | 'beat'

type AbilityBindingHint = {
  id: string
  hint: string
}

export default class AbilityOverlay {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private bombContainer: Phaser.GameObjects.Container
  private bombGauge: Phaser.GameObjects.Graphics
  private bombPulse: Phaser.GameObjects.Graphics
  private bombFlash: Phaser.GameObjects.Graphics
  private bombChargeValue = 0
  private bombStatus: BombStatus = 'charging'
  private bombBeatActive = false
  private bombPulseTween?: Phaser.Tweens.Tween
  private slots = new Map<string, AbilitySlot>()
  private order: string[] = []
  private reducedMotion = false
  private highContrast = false

  constructor(scene: Phaser.Scene, position: { x: number; y: number }) {
    this.scene = scene
    this.container = scene.add.container(position.x, position.y).setDepth(88)

    this.bombContainer = scene.add.container(0, 0)
    this.container.add(this.bombContainer)

    const bombBg = scene.add.circle(0, 0, 46, 0x101a24, 0.85)
    bombBg.setStrokeStyle(2, 0x1f4260, 0.9)
    this.bombGauge = scene.add.graphics()
    this.bombPulse = scene.add.graphics()
    this.bombFlash = scene.add.graphics()
    this.bombContainer.add([bombBg, this.bombGauge, this.bombFlash, this.bombPulse])

    const bombLabel = scene.add.text(0, 60, 'Bomb', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '14px',
      color: '#a0e9ff'
    }).setOrigin(0.5)
    this.bombContainer.add(bombLabel)
    this.renderBombGauge()
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
    const targetStatus: BombStatus = this.bombChargeValue >= 1
      ? (this.bombBeatActive ? 'beat' : 'ready')
      : 'charging'
    if (targetStatus !== 'charging') {
      this.bombStatus = 'charging'
      this.setBombStatus(targetStatus)
    } else {
      this.setBombStatus('charging')
    }
    this.renderBombGauge()
  }

  setHighContrast(flag: boolean): void {
    if (this.highContrast === flag) return
    this.highContrast = flag
    this.slots.forEach((slot) => this.applyState(slot, slot.state))
    this.renderBombGauge()
    if (this.bombStatus !== 'charging') {
      this.setBombStatus(this.bombStatus)
    }
  }

  setBombCharge(pct: number): void {
    this.bombChargeValue = Phaser.Math.Clamp(pct, 0, 1)
    if (this.bombChargeValue < 1) {
      this.bombBeatActive = false
    }
    const status: BombStatus = this.bombChargeValue >= 1
      ? (this.bombBeatActive ? 'beat' : 'ready')
      : 'charging'
    this.setBombStatus(status)
    this.renderBombGauge()
    if (this.bombChargeValue < 1) {
      this.bombFlash.clear()
    }
  }

  setBombBeatWindow(active: boolean): void {
    if (this.bombBeatActive === active) return
    this.bombBeatActive = active
    if (this.bombChargeValue >= 1) {
      this.setBombStatus(active ? 'beat' : 'ready')
      this.renderBombGauge()
    }
  }

  flashBombDetonate(result: 'perfect' | 'good'): void {
    this.bombFlash.clear()
    const color = this.highContrast
      ? 0xffffff
      : result === 'perfect'
        ? 0xfff4b8
        : 0x9ad2ff
    const startAlpha = result === 'perfect' ? 0.55 : 0.4
    const targetScale = result === 'perfect' ? 1.26 : 1.18
    this.bombFlash.setAlpha(1)
    this.bombFlash.setScale(1)
    this.bombFlash.fillStyle(color, startAlpha)
    this.bombFlash.fillCircle(0, 0, 56)

    if (this.reducedMotion) {
      this.scene.time.delayedCall(220, () => {
        this.bombFlash.clear()
        this.bombFlash.setAlpha(1)
        this.bombFlash.setScale(1)
      })
      return
    }

    this.scene.tweens.add({
      targets: this.bombFlash,
      alpha: { from: startAlpha, to: 0 },
      scale: { from: 1, to: targetScale },
      duration: result === 'perfect' ? 360 : 280,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.bombFlash.clear()
        this.bombFlash.setAlpha(1)
        this.bombFlash.setScale(1)
      }
    })
  }

  private setBombStatus(status: BombStatus): void {
    if (this.bombStatus === status) return
    this.bombStatus = status
    this.bombPulse.clear()
    this.bombPulse.setAlpha(1)
    this.bombPulse.setScale(1)
    this.bombFlash.setAlpha(1)
    this.bombFlash.setScale(1)
    if (this.bombPulseTween) {
      this.bombPulseTween.stop()
      this.bombPulseTween = undefined
    }

    if (status === 'charging') {
      return
    }

    const fillColor = status === 'beat'
      ? (this.highContrast ? 0xffffff : 0xffd866)
      : (this.highContrast ? 0xffffff : 0x00e5ff)
    const radius = status === 'beat' ? 50 : 48
    const alpha = status === 'beat' ? 0.5 : 0.32
    this.bombPulse.fillStyle(fillColor, alpha)
    this.bombPulse.fillCircle(0, 0, radius)

    if (this.reducedMotion) return

    const duration = status === 'beat' ? 200 : 420
    const scaleTo = status === 'beat' ? 1.12 : 1.08
    const alphaTo = status === 'beat' ? alpha * 0.35 : alpha * 0.45
    this.bombPulseTween = this.scene.tweens.add({
      targets: this.bombPulse,
      alpha: { from: alpha, to: alphaTo },
      scale: { from: 1, to: scaleTo },
      yoyo: true,
      repeat: -1,
      duration,
      ease: 'Sine.easeInOut'
    })
  }

  private renderBombGauge(): void {
    const pct = Phaser.Math.Clamp(this.bombChargeValue, 0, 1)
    const color = this.bombStatus === 'beat'
      ? (this.highContrast ? 0xffffff : 0xffd866)
      : this.bombStatus === 'ready'
        ? (this.highContrast ? 0xffffff : 0x00e5ff)
        : (this.highContrast ? 0x9ad2ff : 0x1f4260)
    const alpha = this.bombStatus === 'charging' ? (this.highContrast ? 0.9 : 0.6) : 0.95
    this.bombGauge.clear()
    this.bombGauge.lineStyle(6, color, alpha)
    this.bombGauge.beginPath()
    this.bombGauge.arc(0, 0, 42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct, false)
    this.bombGauge.strokePath()
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

  setAbilityBindings(bindings: AbilityBindingHint[]): void {
    bindings.forEach((binding) => {
      const slot = this.slots.get(binding.id)
      if (!slot) return
      slot.bindingHint = binding.hint.trim()
      if (slot.hint) {
        slot.hint.setText(slot.bindingHint || slot.hint.text)
        slot.hint.setVisible(Boolean(slot.bindingHint))
      } else if (slot.bindingHint) {
        slot.hint = this.scene.add.text(0, 76, slot.bindingHint, {
          fontFamily: 'UiFont, sans-serif',
          fontSize: '12px',
          color: '#7ddff2'
        }).setOrigin(0.5)
        slot.container.add(slot.hint)
      }
      if (slot.hint) {
        slot.hint.setColor(this.highContrast ? '#ffe27a' : '#7ddff2')
      }
      if (slot.bonus) {
        slot.bonus.setY(slot.hint && slot.hint.visible ? 94 : 86)
      }
    })
  }

  flashBeat(): void {
    this.slots.forEach((slot) => {
      if (slot.state.status !== 'ready') return
      slot.glow.clear()
      const glowColor = this.highContrast ? 0xffffff : 0x00e5ff
      const glowAlpha = this.highContrast ? 0.55 : 0.45
      slot.glow.fillStyle(glowColor, glowAlpha)
      slot.glow.fillCircle(0, 0, 58)
      if (this.reducedMotion) {
        slot.glow.setAlpha(glowAlpha * 0.8)
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
    const statusText = this.scene.add.text(0, 0, '', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(5).setVisible(false)

    container.add([glow, bg, active, cooldown, statusText])

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
      statusText,
      state: { ...state }
    }

    this.slots.set(state.id, slot)
    return slot
  }

  private applyState(slot: AbilitySlot, state: AbilityState): void {
    slot.state = { ...state }
    slot.label.setText(state.label)
    slot.label.setColor(this.highContrast ? '#ffffff' : '#a0e9ff')
    const hintText = slot.bindingHint ?? state.inputHint ?? ''
    if (slot.hint) {
      slot.hint.setText(hintText)
      slot.hint.setVisible(Boolean(hintText))
      slot.hint.setColor(this.highContrast ? '#ffe27a' : '#7ddff2')
    } else if (hintText) {
      slot.hint = this.scene.add.text(0, 76, hintText, {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '12px',
        color: this.highContrast ? '#ffe27a' : '#7ddff2'
      }).setOrigin(0.5)
      slot.container.add(slot.hint)
    }

    if (slot.bonus) {
      slot.bonus.setText(state.beatBonus ?? '')
      slot.bonus.setVisible(Boolean(state.beatBonus))
      slot.bonus.setColor(this.highContrast ? '#ffffff' : '#7ddff2')
    } else if (state.beatBonus) {
      slot.bonus = this.scene.add.text(0, (slot.hint && slot.hint.visible) ? 94 : 86, state.beatBonus, {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '12px',
        color: this.highContrast ? '#ffffff' : '#7ddff2',
        align: 'center',
        wordWrap: { width: 120 }
      }).setOrigin(0.5)
      slot.container.add(slot.bonus)
    }

    slot.tierText.setText(`T${state.tier}`)
    slot.tierText.setColor(this.highContrast ? '#ffe27a' : '#ffd866')
    if (slot.bonus) {
      slot.bonus.setY(slot.hint && slot.hint.visible ? 94 : 86)
    }
    this.updateSlotStatusText(slot)
    this.drawState(slot)
  }

  private drawState(slot: AbilitySlot): void {
    const { cooldown, active } = slot
    const { remainingMs, cooldownMs, activeRemainingMs, durationMs, status } = slot.state
    cooldown.clear()
    active.clear()

    if (status === 'active' && durationMs && durationMs > 0) {
      const fraction = Phaser.Math.Clamp(activeRemainingMs ?? 0, 0, durationMs) / durationMs
      const color = this.highContrast ? 0xffffff : 0x66ffda
      active.lineStyle(6, color, 0.95)
      active.beginPath()
      active.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction, false)
      active.strokePath()
    } else if (status === 'ready') {
      const color = this.highContrast ? 0xffffff : 0x66ffda
      cooldown.lineStyle(4, color, 0.95)
      cooldown.strokeCircle(0, 0, 40)
    } else if (cooldownMs > 0) {
      const fraction = Phaser.Math.Clamp(remainingMs / cooldownMs, 0, 1)
      const color = this.highContrast ? 0xffffff : 0x395a7a
      const alpha = this.highContrast ? 1 : 0.85
      cooldown.lineStyle(6, color, alpha)
      cooldown.beginPath()
      cooldown.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction, false)
      cooldown.strokePath()
    }

    if (slot.icon && 'setTint' in slot.icon) {
      const readyTint = this.highContrast ? 0xffffff : 0xffffff
      const activeTint = this.highContrast ? 0xffffcc : 0x66ffda
      const cooldownTint = this.highContrast ? 0x9ad2ff : 0x395a7a
      if (status === 'ready') (slot.icon as Phaser.GameObjects.Image).setTint(readyTint)
      else if (status === 'active') (slot.icon as Phaser.GameObjects.Image).setTint(activeTint)
      else (slot.icon as Phaser.GameObjects.Image).setTint(cooldownTint)
    } else if (slot.icon && 'setColor' in slot.icon) {
      const color = status === 'ready'
        ? (this.highContrast ? '#ffffff' : '#a0e9ff')
        : status === 'active'
          ? (this.highContrast ? '#fff4b8' : '#66ffda')
          : (this.highContrast ? '#9ad2ff' : '#395a7a')
      ;(slot.icon as Phaser.GameObjects.Text).setColor(color)
    }
  }

  private updateSlotStatusText(slot: AbilitySlot): void {
    const { status, remainingMs, activeRemainingMs } = slot.state
    const formatter = (value: number | undefined) => {
      if (!value || value <= 0) return '0s'
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}s`
      }
      return `${Math.ceil(value)}ms`
    }

    let text = ''
    let color = this.highContrast ? '#ffffff' : '#ffffff'
    if (status === 'cooldown') {
      text = formatter(remainingMs)
      color = this.highContrast ? '#ffee8a' : '#ffee8a'
    } else if (status === 'active') {
      text = formatter(activeRemainingMs)
      color = this.highContrast ? '#ffe27a' : '#66ffda'
    } else if (status === 'ready') {
      text = this.highContrast ? 'READY' : ''
      color = this.highContrast ? '#ffffff' : '#ffffff'
    }

    slot.statusText.setText(text)
    slot.statusText.setColor(color)
    slot.statusText.setVisible(Boolean(text))
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
