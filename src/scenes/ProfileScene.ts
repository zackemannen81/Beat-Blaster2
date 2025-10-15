
import Phaser from 'phaser';
import { profileService } from '../systems/ProfileService'
import type { Achievement } from '../systems/AchievementSystem';
import achievements from '../config/achievements.json';

export default class ProfileScene extends Phaser.Scene {
  constructor() {
    super('ProfileScene');
  }

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

    // Achievements
    this.add.text(width * 0.65, listOriginY + 260, 'Achievements', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '20px',
      color: '#a0e9ff'
    }).setOrigin(0.5, 0)

    const unlockedSet = new Set(profile.achievements)
    let yPos = listOriginY + 300
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
}
