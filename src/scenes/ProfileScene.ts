
import Phaser from 'phaser';
import { ProfileSystem } from '../systems/ProfileSystem';
import { AchievementSystem, Achievement } from '../systems/AchievementSystem';
import achievements from '../config/achievements.json';

export default class ProfileScene extends Phaser.Scene {
  constructor() {
    super('ProfileScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    const profileSystem = new ProfileSystem();
    const profile = profileSystem.getProfile();

    this.add.text(width / 2, 50, 'Player Profile', {
      fontFamily: 'HudFont, UiFont, sans-serif',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Avatar placeholder
    this.add.rectangle(width / 4, 150, 100, 100, 0xffffff).setOrigin(0.5);
    this.add.text(width / 4, 150, 'AVATAR', { color: '#000000' }).setOrigin(0.5);

    this.add.text(width / 4, 220, profile.name, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '24px',
      color: '#a0e9ff'
    }).setOrigin(0.5);

    // Stats
    const stats = profile.stats;
    const statsText = `
Games Played: ${stats.gamesPlayed}
Total Score: ${stats.totalScore}
Total Kills: ${stats.totalKills}
`;
    this.add.text(width / 2, 150, statsText, {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // Achievements
    this.add.text(width / 2, 250, 'Achievements:', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '20px',
        color: '#a0e9ff'
      });
  
      const achievementSystem = new AchievementSystem();
      let yPos = 280;
      achievements.forEach((achievement: Achievement) => {
        const isUnlocked = achievementSystem.isUnlocked(achievement.id);
        const text = `${achievement.name} - ${achievement.description}`;
        const color = isUnlocked ? '#ffffff' : '#888888';
        this.add.text(width/2, yPos, text, { 
            fontFamily: 'UiFont, sans-serif', 
            fontSize: '16px', 
            color: color 
        });
        yPos += 20;
      });

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
