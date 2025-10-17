
import Phaser from 'phaser';
import { profileService } from '@systems/ProfileService'
import type { Achievement } from '@systems/AchievementSystem';
import achievements from '../config/achievements.json';
import { getAllAbilityDefinitions } from '../config/abilities';
import type { AbilityDefinition } from '../types/ability';

export default class ProfileScene extends Phaser.Scene {
  constructor() {
    super('ProfileScene');
  }

  private abilityDefinitions: AbilityDefinition[] = getAllAbilityDefinitions()
  private abilitySlotLabels: Phaser.GameObjects.Text[] = []
  private abilitySlotBonus: Phaser.GameObjects.Text[] = []
  private abilityInfoCard?: Phaser.GameObjects.Container
  private currentAbilities: string[] = []
  private activeProfileId?: string

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    const profiles = profileService.getAllProfiles()
    if (profiles.length === 0) {
      this.scene.start('MenuScene')
      return
    }

    this.add.text(width / 2, 50, 'Player Profile', {
      fontFamily: 'HudFont, UiFont, sans-serif',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const activeProfile = profileService.getActiveProfile() ?? profiles[0]
    const listOriginX = width * 0.15
    const listOriginY = height * 0.2
    const listSpacing = 60

    const buttonContainer = this.add.container(listOriginX, listOriginY)
    profiles.forEach((candidate, idx) => {
      const y = idx * listSpacing
      const isActive = candidate.id === activeProfile?.id
      const bg = this.add.rectangle(0, y, width * 0.35, 48, isActive ? 0x173043 : 0x0c151f).setOrigin(0)
      bg.setInteractive({ useHandCursor: true })
      bg.on('pointerdown', () => {
        profileService.setActiveProfile(candidate.id)
        this.scene.restart()
      })
      const label = this.add.text(16, y + 24, candidate.name, {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '18px',
        color: isActive ? '#a0e9ff' : '#7ba9c4'
      }).setOrigin(0, 0.5)
      buttonContainer.add([bg, label])
    })

    const profile = activeProfile
    this.activeProfileId = activeProfile.id
    this.currentAbilities = [...activeProfile.abilities]
    if (this.currentAbilities.length < 2 && this.abilityDefinitions.length > 0) {
      const defaults = this.abilityDefinitions.slice(0, 2).map((def) => def.id)
      this.currentAbilities = [...defaults]
    }

    const avatarContainer = this.add.container(width * 0.65, listOriginY)
    avatarContainer.add(this.add.rectangle(0, 0, 140, 140, 0xffffff).setOrigin(0.5))
    avatarContainer.add(this.add.text(0, 0, 'AVATAR', { color: '#000000' }).setOrigin(0.5))

    this.add.text(width * 0.65, listOriginY + 110, profile.name, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '24px',
      color: '#a0e9ff'
    }).setOrigin(0.5)

    const stats = profile.stats
    const statsText = `Games Played: ${stats.gamesPlayed}\nTotal Score: ${stats.totalScore}\nTotal Kills: ${stats.totalKills}`
    this.add.text(width * 0.65, listOriginY + 160, statsText, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5, 0)

    this.renderAbilitySection(width * 0.65, listOriginY + 220, profile)

    // Achievements
    this.add.text(width * 0.65, listOriginY + 320, 'Achievements', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '20px',
      color: '#a0e9ff'
    }).setOrigin(0.5, 0)

    const unlockedSet = new Set(profile.achievements)
    let yPos = listOriginY + 360
    achievements.forEach((achievement: Achievement) => {
      const isUnlocked = unlockedSet.has(achievement.id)
      const text = `${achievement.name} – ${achievement.description}`
      const color = isUnlocked ? '#ffffff' : '#3f4d5f'
      this.add.text(width * 0.65, yPos, text, {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '16px',
        color,
        wordWrap: { width: width * 0.4 }
      }).setOrigin(0.5, 0)
      yPos += 26
    })

    const buttonY = height - 120
    const createButton = this.add.text(listOriginX, buttonY, '[Create New Profile]', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '16px',
      color: '#a0e9ff'
    }).setInteractive({ useHandCursor: true })
    createButton.on('pointerdown', () => {
      const name = window.prompt('New profile name:', 'Pilot')
      if (!name) return
      profileService.createProfile({ name })
      this.scene.restart()
    })

    const renameButton = this.add.text(listOriginX + 220, buttonY, '[Rename]', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '16px',
      color: '#7ba9c4'
    }).setInteractive({ useHandCursor: true })
    renameButton.on('pointerdown', () => {
      const target = profileService.getActiveProfile()
      if (!target) return
      const name = window.prompt('Rename profile:', target.name)
      if (!name || name === target.name) return
      profileService.renameProfile(target.id, name)
      this.scene.restart()
    })

    const deleteButton = this.add.text(listOriginX + 340, buttonY, '[Delete]', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '16px',
      color: '#ff6b6b'
    }).setInteractive({ useHandCursor: true })
    deleteButton.on('pointerdown', () => {
      const target = profileService.getActiveProfile()
      if (!target) return
      if (profiles.length <= 1) {
        window.alert('At least one profile must remain.')
        return
      }
      if (window.confirm(`Delete profile "${target.name}"?`)) {
        profileService.deleteProfile(target.id)
        this.scene.restart()
      }
    })

    this.add.text(width / 2, height - 50, 'ESC: Menu', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '16px',
      color: '#a0e9ff'
    }).setOrigin(0.5);

    this.input.keyboard!.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  private renderAbilitySection(centerX: number, baseY: number): void {
    this.add.text(centerX, baseY, 'Abilities', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '20px',
      color: '#a0e9ff'
    }).setOrigin(0.5, 0)

    const slotLabels = ['Primary', 'Secondary']
    this.abilitySlotLabels = []
    this.abilitySlotBonus = []

    slotLabels.forEach((_slot, index) => {
      const slotY = baseY + 28 + index * 44
      const label = this.add.text(centerX, slotY, '', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5)
      label.setInteractive({ useHandCursor: true })
      label.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        const direction = pointer.rightButtonDown() ? -1 : 1
        this.cycleAbility(index, direction)
      })
      label.on('pointerover', () => label.setColor('#00e5ff'))
      label.on('pointerout', () => label.setColor('#ffffff'))
      this.abilitySlotLabels.push(label)

      const bonus = this.add.text(centerX, slotY + 18, '', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '13px',
        color: '#7ddff2'
      }).setOrigin(0.5)
      this.abilitySlotBonus.push(bonus)

      this.updateAbilitySlotLabel(index)
    })

    this.abilityInfoCard = this.add.container(centerX, baseY + 96)
    const cardBg = this.add.rectangle(0, 0, 320, 120, 0x0b1a24, 0.8).setOrigin(0.5)
    cardBg.setStrokeStyle(1, 0x1c4b66, 0.9)
    const title = this.add.text(0, -44, '', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '16px',
      color: '#66ffda'
    }).setOrigin(0.5)
    const detail = this.add.text(0, -16, '', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '13px',
      color: '#d4f7ff',
      align: 'center',
      wordWrap: { width: 280 }
    }).setOrigin(0.5, 0)
    const beatBonus = this.add.text(0, 30, '', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '12px',
      color: '#ffd866'
    }).setOrigin(0.5)
    const inputHint = this.add.text(0, 52, '', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '12px',
      color: '#7ddff2'
    }).setOrigin(0.5)

    this.abilityInfoCard.add([cardBg, title, detail, beatBonus, inputHint])
    this.updateAbilityInfoCard(0)

    this.input.keyboard!.on('keydown-Q', () => this.handleAbilityHotkey(0, -1))
    this.input.keyboard!.on('keydown-W', () => this.handleAbilityHotkey(0, 1))
    this.input.keyboard!.on('keydown-A', () => this.handleAbilityHotkey(1, -1))
    this.input.keyboard!.on('keydown-S', () => this.handleAbilityHotkey(1, 1))
  }

  private cycleAbility(slotIndex: number, direction: number): void {
    if (!this.activeProfileId || this.abilityDefinitions.length === 0) return
    const pool = this.abilityDefinitions
    const otherIndex = slotIndex === 0 ? 1 : 0
    const usedByOther = this.currentAbilities[otherIndex]
    const currentId = this.currentAbilities[slotIndex] ?? pool[slotIndex % pool.length].id
    if (pool.length === 1) {
      this.currentAbilities[slotIndex] = pool[0].id
      this.updateAbilitySlotLabel(slotIndex)
      profileService.updateAbilities(this.activeProfileId, this.currentAbilities)
      return
    }
    let idx = pool.findIndex((def) => def.id === currentId)
    if (idx === -1) idx = 0
    let attempts = 0
    while (attempts < pool.length) {
      idx = (idx + direction + pool.length) % pool.length
      const candidate = pool[idx].id
      attempts += 1
      if (candidate === currentId) continue
      if (candidate === usedByOther) continue
      this.currentAbilities[slotIndex] = candidate
      this.updateAbilitySlotLabel(slotIndex)
      this.updateAbilityInfoCard(slotIndex)
      profileService.updateAbilities(this.activeProfileId, this.currentAbilities)
      return
    }
  }

  private updateAbilitySlotLabel(slotIndex: number): void {
    const label = this.abilitySlotLabels[slotIndex]
    const bonus = this.abilitySlotBonus[slotIndex]
    if (!label || !bonus) return
    const abilityId = this.currentAbilities[slotIndex]
    const definition = this.abilityDefinitions.find((def) => def.id === abilityId)
    if (!definition) {
      label.setText('Unavailable')
      bonus.setText('')
      return
    }
    const slotName = slotIndex === 0 ? 'Primary' : 'Secondary'
    const inputHint = definition.inputHint ? ` (${definition.inputHint})` : ''
    label.setText(`${slotName}: ${definition.label}${inputHint}`)
    bonus.setText(definition.beatBonus ? definition.beatBonus : 'No beat bonus')
  }

  private updateAbilityInfoCard(slotIndex: number): void {
    if (!this.abilityInfoCard) return
    const abilityId = this.currentAbilities[slotIndex]
    const definition = this.abilityDefinitions.find((def) => def.id === abilityId)
    const [cardBg, title, detail, beatBonus, inputHint] = this.abilityInfoCard.list as [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text, Phaser.GameObjects.Text, Phaser.GameObjects.Text, Phaser.GameObjects.Text]
    if (!definition) {
      title.setText('Select an ability')
      detail.setText('')
      beatBonus.setText('')
      inputHint.setText('')
      return
    }
    title.setText(`${definition.label}`)
    detail.setText(definition.description ?? 'No description provided.')
    beatBonus.setText(definition.beatBonus ? `Beat Bonus: ${definition.beatBonus}` : 'No beat bonus')
    inputHint.setText(definition.inputHint ? `Input: ${definition.inputHint}` : '')
  }

  private handleAbilityHotkey(slotIndex: number, direction: number): void {
    this.cycleAbility(slotIndex, direction)
    this.sound.play('ui_move', { volume: 0.4 })
  }

  private reducedMotion(): boolean {
    return profileService.getActiveProfile()?.settings.reducedMotion ?? false
  }
}
