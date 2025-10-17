import Phaser from 'phaser'
import { loadOptions, saveOptions, Options, detectGameplayModeOverride, resolveGameplayMode } from '@systems/Options'
import { profileService } from '@systems/ProfileService'
import { eventBus } from '../core/EventBus'
import { abilityDefinitions, DEFAULT_ABILITY_IDS } from '../config/abilities'
import type { AbilityDefinition } from '../types/ability'

type OptionsSceneData = {
  from?: string
}

export default class OptionsScene extends Phaser.Scene {
  private opts!: Options
  private cursor = 0
  private entries!: Phaser.GameObjects.Text[]
  private title!: Phaser.GameObjects.Text
  private originScene: string = 'MenuScene'
  private saveStatusText!: Phaser.GameObjects.Text
  private saveStatus: { state: 'idle' | 'pending'; reason: 'auto' | 'manual'; savedAt?: number } = {
    state: 'idle',
    reason: 'auto'
  }
  private manualSaveIndex = 0
  private abilityPool: AbilityDefinition[] = Object.values(abilityDefinitions)
  private abilitySelections: string[] = []

  constructor() {
    super('OptionsScene')
  }

  create(data: OptionsSceneData = {}) {
    this.originScene = data.from ?? 'MenuScene'
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)')
    this.opts = loadOptions()
    this.title = this.add.text(width / 2, height * 0.2, 'Options', { fontFamily: 'HudFont, UiFont', fontSize: '32px', color: '#fff' }).setOrigin(0.5)

    const baseY = 0.32
    const stepY = 0.055
    const rowCount = 17
    this.entries = Array.from({ length: rowCount }, (_, i) =>
      this.add.text(width / 2, height * (baseY + stepY * i), '', { fontFamily: 'UiFont', fontSize: '18px' }).setOrigin(0.5)
    )
    this.syncAbilitySelections()
    this.render()

    this.saveStatusText = this.add.text(width / 2, height * 0.26, '', {
      fontFamily: 'UiFont',
      fontSize: '16px',
      color: '#7ddff2'
    }).setOrigin(0.5)
    this.updateSaveStatusText()

    this.syncAbilitySelections()

    const k = this.input.keyboard!
    k.on('keydown-UP', () => { this.cursor = (this.cursor - 1 + this.entries.length) % this.entries.length; this.sound.play('ui_move', { volume: this.opts.sfxVolume }); this.render() })
    k.on('keydown-DOWN', () => { this.cursor = (this.cursor + 1) % this.entries.length; this.sound.play('ui_move', { volume: this.opts.sfxVolume }); this.render() })
    k.on('keydown-LEFT', () => { this.adjust(-1) })
    k.on('keydown-RIGHT', () => { this.adjust(1) })
    k.once('keydown-ESC', () => this.close())
    k.on('keydown-ENTER', () => this.triggerSelection())

    this.events.on(Phaser.Scenes.Events.WAKE, this.handleWake, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.WAKE, this.handleWake, this)
    })

    eventBus.bindToScene(this, 'profile:save:pending', ({ reason }) => {
      this.saveStatus = { state: 'pending', reason }
      this.updateSaveStatusText()
      this.render()
    })

    eventBus.bindToScene(this, 'profile:save:completed', ({ reason, savedAt }) => {
      this.saveStatus = { state: 'idle', reason, savedAt }
      this.updateSaveStatusText()
      this.render()
    })

    eventBus.bindToScene(this, 'profile:changed', () => {
      this.syncAbilitySelections()
      this.render()
    })
  }

  private render() {
    const trackId = (this.registry.get('selectedTrackId') as string) || 'default'
    const profile = profileService.getActiveProfile()
    const io = profile?.settings.inputOffsetMs ?? this.opts.inputOffsetMs[trackId] ?? 0
    const fm = this.opts.fireMode
    const override = detectGameplayModeOverride()
    const activeMode = override ? override.mode : resolveGameplayMode(this.opts.gameplayMode)
    const modeLabel = activeMode === 'vertical' ? 'Vertical Scroll' : 'Omni Scroll'
    const overrideSuffix = override ? ' (Override)' : ''

    const crosshairLabel =
      this.opts.crosshairMode === 'pointer'
        ? 'Pointer'
        : this.opts.crosshairMode === 'fixed'
          ? 'Fixed'
          : 'Pad-Relative'

    this.syncAbilitySelections()

    const rows = [
      `Music Volume: ${(this.opts.musicVolume * 100) | 0}%`,
      `SFX Volume: ${(this.opts.sfxVolume * 100) | 0}%`,
      `Metronome: ${this.opts.metronome ? 'On' : 'Off'}`,
      `High Contrast: ${this.opts.highContrast ? 'On' : 'Off'}`,
      `Reduced Motion: ${this.opts.reducedMotion ? 'On' : 'Off'}`,
      `Calibrate Latency…`,
      `Input Offset: ${io} ms`,
      `Fire Mode: ${fm === 'click' ? 'Click' : fm === 'hold_quantized' ? 'Hold (Quantized)' : 'Hold (Raw)'}`,
      `Gameplay Mode: ${modeLabel}${overrideSuffix}`,
      `Crosshair Mode: ${crosshairLabel}`,
      `Mouse Aim Unlock: ${this.opts.unlockMouseAim ? 'Unlocked' : 'Locked'}`,
      `Mouse Navigation: ${this.opts.mouseNavigation ? 'On' : 'Off'}`,
      `Vertical Safety Band: ${this.opts.verticalSafetyBand ? 'On' : 'Off'}`,
      `Fallback Waves: ${this.opts.allowFallbackWaves ? 'On' : 'Off'}`,
      `Gamepad Deadzone: ${(this.opts.gamepadDeadzone * 100).toFixed(0)}%`,
      `Gamepad Sensitivity: ${this.opts.gamepadSensitivity.toFixed(2)}x`,
      this.getAbilityRowLabel(0),
      this.getAbilityRowLabel(1),
      this.getManualSaveRowLabel()
    ]
    this.manualSaveIndex = rows.length - 1
    this.entries.forEach((t, i) => t.setText(`${i === this.cursor ? '▶ ' : '  '}${rows[i] ?? ''}`).setColor(i === this.cursor ? '#00e5ff' : '#ffffff'))
    this.updateSaveStatusText()
  }

  private adjust(dir: number) {
    const step = dir
    const trackId = (this.registry.get('selectedTrackId') as string) || 'default'
    switch (this.cursor) {
      case 0: this.opts.musicVolume = Phaser.Math.Clamp(this.opts.musicVolume + step * 0.05, 0, 1); break
      case 1: this.opts.sfxVolume = Phaser.Math.Clamp(this.opts.sfxVolume + step * 0.05, 0, 1); break
      case 2: this.opts.metronome = !this.opts.metronome; break
      case 3: this.opts.highContrast = !this.opts.highContrast; break
      case 4: {
        this.opts.reducedMotion = !this.opts.reducedMotion
        break
      }
      case 5: {
        // Calibration handled via triggerSelection
        break
      }
      case 6: {
        const profile = profileService.getActiveProfile()
        if (profile) {
          const next = Phaser.Math.Clamp((profile.settings.inputOffsetMs ?? 0) + step * 5, -200, 200)
          profileService.updateSettings(profile.id, { inputOffsetMs: next })
        } else {
          const prev = this.opts.inputOffsetMs[trackId] ?? 0
          this.opts.inputOffsetMs[trackId] = Phaser.Math.Clamp(prev + step * 5, -200, 200)
        }
        break
      }
      case 7: {
        const order: Options['fireMode'][] = ['click', 'hold_quantized', 'hold_raw']
        const idx = order.indexOf(this.opts.fireMode)
        this.opts.fireMode = order[(idx + (dir > 0 ? 1 : order.length - 1)) % order.length]
        break
      }
      case 8: {
        const override = detectGameplayModeOverride()
        if (override) break
        const order: Options['gameplayMode'][] = ['omni', 'vertical']
        const idx = order.indexOf(this.opts.gameplayMode)
        this.opts.gameplayMode = order[(idx + (dir > 0 ? 1 : order.length - 1)) % order.length]
        break
      }
      case 9: {
        const order: Options['crosshairMode'][] = ['pointer', 'fixed', 'pad-relative']
        const idx = order.indexOf(this.opts.crosshairMode)
        this.opts.crosshairMode = order[(idx + (dir > 0 ? 1 : order.length - 1)) % order.length]
        break
      }
      case 10: {
        this.opts.unlockMouseAim = !this.opts.unlockMouseAim
        break
      }
      case 11: {
        this.opts.mouseNavigation = !this.opts.mouseNavigation
        break
      }
      case 12: {
        this.opts.verticalSafetyBand = !this.opts.verticalSafetyBand
        break
      }
      case 13: {
        this.opts.allowFallbackWaves = !this.opts.allowFallbackWaves
        break
      }
      case 14: {
        this.opts.gamepadDeadzone = Phaser.Math.Clamp(this.opts.gamepadDeadzone + step * 0.05, 0, 0.6)
        break
      }
      case 15: {
        this.opts.gamepadSensitivity = Phaser.Math.Clamp(this.opts.gamepadSensitivity + step * 0.1, 0.5, 2)
        break
      }
      case 16:
      case 17: {
        this.adjustAbility(this.cursor - 16, dir)
        break
      }
    }
    this.sound.play('ui_move', { volume: this.opts.sfxVolume })
    this.render()
  }

  private close() {
    saveOptions(this.opts)
    this.sound.play('ui_select', { volume: this.opts.sfxVolume })
    // Apply high-contrast background immediately
    const color = this.opts.highContrast ? '#000000' : '#0a0a0f'
    this.scene.get('MenuScene')?.cameras.main.setBackgroundColor(color)
    this.scene.get('GameScene')?.cameras.main.setBackgroundColor(color)
    this.scene.stop()
    this.scene.resume(this.originScene)
  }

  private triggerSelection() {
    if (this.cursor === 5) {
      this.sound.play('ui_select', { volume: this.opts.sfxVolume })
      this.scene.pause()
      this.scene.launch('LatencyCalibrationScene', { returnScene: this.scene.key })
      return
    }
    if (this.cursor === this.manualSaveIndex) {
      this.sound.play('ui_select', { volume: this.opts.sfxVolume })
      void profileService.saveNow()
      return
    }
    this.close()
  }

  private handleWake = () => {
    this.opts = loadOptions()
    this.render()
  }

  private getManualSaveRowLabel(): string {
    if (this.saveStatus.state === 'pending') {
      const reason = this.saveStatus.reason === 'manual' ? 'manual' : 'auto'
      return `Save Profile Now — Saving (${reason})…`
    }
    if (this.saveStatus.savedAt) {
      const timestamp = new Date(this.saveStatus.savedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      const reason = this.saveStatus.reason === 'manual' ? 'manual' : 'auto'
      return `Save Profile Now — Saved ${timestamp} (${reason})`
    }
    return 'Save Profile Now'
  }

  private lookupAbility(id: string): AbilityDefinition | undefined {
    return abilityDefinitions[id]
  }

  private syncAbilitySelections(): void {
    const profile = profileService.getActiveProfile()
    if (!profile) {
      this.abilitySelections = [...DEFAULT_ABILITY_IDS]
      return
    }
    const selections = profile.abilities && profile.abilities.length > 0 ? [...profile.abilities] : [...DEFAULT_ABILITY_IDS]
    while (selections.length < 2 && this.abilityPool.length > selections.length) {
      const candidate = this.abilityPool[selections.length]?.id
      if (candidate) selections.push(candidate)
    }
    this.abilitySelections = selections.slice(0, 2)
  }

  private getAbilityRowLabel(index: number): string {
    const def = this.lookupAbility(this.abilitySelections[index])
    if (!def) return index === 0 ? 'Primary Ability: —' : 'Secondary Ability: —'
    const inputHint = def.inputHint ? ` (${def.inputHint})` : ''
    const slotLabel = index === 0 ? 'Primary Ability' : 'Secondary Ability'
    const bonus = def.beatBonus ? ` — ${def.beatBonus}` : ''
    return `${slotLabel}: ${def.label}${inputHint}${bonus}`
  }

  private adjustAbility(index: number, direction: number): void {
    if (this.abilityPool.length === 0) return
    if (!this.abilitySelections[index]) {
      this.abilitySelections[index] = this.abilityPool[0].id
    }
    if (this.abilityPool.length === 1) {
      this.abilitySelections[index] = this.abilityPool[0].id
      this.commitAbilities()
      return
    }
    const otherIndex = index === 0 ? 1 : 0
    const usedByOther = this.abilitySelections[otherIndex]
    const currentId = this.abilitySelections[index]
    let idx = this.abilityPool.findIndex((def) => def.id === currentId)
    if (idx === -1) idx = 0
    let attempts = 0
    while (attempts < this.abilityPool.length) {
      idx = (idx + direction + this.abilityPool.length) % this.abilityPool.length
      const candidate = this.abilityPool[idx].id
      attempts += 1
      if (candidate === currentId) continue
      if (candidate === usedByOther) continue
      this.abilitySelections[index] = candidate
      this.commitAbilities()
      return
    }
  }

  private commitAbilities(): void {
    const profile = profileService.getActiveProfile()
    if (!profile) return
    profileService.updateAbilities(profile.id, this.abilitySelections)
  }

  private updateSaveStatusText(): void {
    if (!this.saveStatusText) return
    if (this.saveStatus.state === 'pending') {
      const reasonLabel = this.saveStatus.reason === 'manual' ? 'Manual save' : 'Autosave'
      this.saveStatusText.setText(`${reasonLabel} in progress…`)
      return
    }
    if (this.saveStatus.savedAt) {
      const timestamp = new Date(this.saveStatus.savedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      const reasonLabel = this.saveStatus.reason === 'manual' ? 'Manual save' : 'Autosave'
      this.saveStatusText.setText(`${reasonLabel} completed at ${timestamp}`)
      return
    }
    this.saveStatusText.setText('Profile changes auto-save in the background')
  }
}
