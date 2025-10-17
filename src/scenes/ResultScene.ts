import Phaser from 'phaser'
import { addScore, loadBoard } from '../net/localLeaderboard';
import { submitScore } from '../net/onlineLeaderboard';
import { AchievementSystem } from '@systems/AchievementSystem';
import { profileService } from '@systems/ProfileService';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene')
  }

  create(data: { score?: number; accuracy?: number; kills?: number } = {}) {
    const { width, height } = this.scale
    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0)
    this.add.text(width / 2, height * 0.4, 'Results', {
      fontFamily: 'HudFont, UiFont, sans-serif',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const accuracy = typeof data.accuracy === 'number' ? data.accuracy : 0
    const score = data.score ?? 0
    const profile = profileService.getActiveProfile()

    // Check for achievements and update profile
    const achievementSystem = new AchievementSystem(profile?.achievements)
    achievementSystem.checkScoreAchievement(score)
    achievementSystem.checkAccuracyAchievement(accuracy)

    const kills = data.kills ?? 0
    profileService.recordRunStats({ score, kills, accuracy })
    if (profile) {
      profile.achievements = achievementSystem.getUnlockedAchievements()
    }

    const accuracyText = `${accuracy.toFixed(1)}%`
    this.add.text(
      width / 2,
      height * 0.55,
      `Score: ${score}\nAccuracy: ${accuracyText}`,
      { fontFamily: 'UiFont, sans-serif', fontSize: '18px', color: '#a0e9ff', align: 'center' }
    ).setOrigin(0.5)

    // Save to local leaderboard (prompt name once)
    const trackId = (this.registry.get('selectedTrackId') as string) || 'unknown'
    const difficultyId = (this.registry.get('selectedDifficultyId') as string) || 'normal'
    const name = window.prompt('Enter your name for the leaderboard:', profile?.name ?? 'AAA') || 'Anon'
    if (profile && name !== profile.name) {
      profileService.renameProfile(profile.id, name)
    } else {
      localStorage.setItem('bb_name', name)
    }
    addScore({ name, trackId, score, date: Date.now() })
    submitScore(trackId, difficultyId, name, score);

    const list = loadBoard().slice(0, 5)
    const text = list.map((e, i) => `${i + 1}. ${e.name.padEnd(8, ' ')}  ${e.score}`).join('\n')
    this.add.text(width / 2, height * 0.75, text, { fontFamily: 'UiFont, sans-serif', fontSize: '16px', color: '#fff', align: 'center' }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.9, 'SPACE: Menu   R: Retry   L: Leaderboard', { fontFamily: 'UiFont, sans-serif', fontSize: '16px', color: '#a0e9ff' }).setOrigin(0.5)
    this.input.keyboard!.once('keydown-SPACE', () => this.scene.start('MenuScene'))
    this.input.keyboard!.once('keydown-R', () => this.scene.start('GameScene'))
    this.input.keyboard!.once('keydown-L', () => this.scene.start('LeaderboardScene'));
  }
}
