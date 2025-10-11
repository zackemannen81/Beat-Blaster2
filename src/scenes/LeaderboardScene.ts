
import Phaser from 'phaser';
import { getScores, ScoreEntry } from '../net/onlineLeaderboard';

export default class LeaderboardScene extends Phaser.Scene {
  private tracks: any[] = [];
  private selectedTrackIndex: number = 0;
  private scoreTexts: Phaser.GameObjects.Text[] = [];
  private trackTitle!: Phaser.GameObjects.Text;
  private difficulties = ['easy', 'normal', 'hard'];
  private selectedDifficultyIndex = 1;
  private difficultyTitle!: Phaser.GameObjects.Text;

  constructor() {
    super('LeaderboardScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    this.add.text(width / 2, 50, 'Leaderboards', {
      fontFamily: 'HudFont, UiFont, sans-serif',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.tracks = this.registry.get('tracks') || [];
    this.selectedTrackIndex = 0;

    this.trackTitle = this.add.text(width / 2, 120, '', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '24px',
      color: '#a0e9ff'
    }).setOrigin(0.5);

    this.difficultyTitle = this.add.text(width / 2, 160, '', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '20px',
        color: '#ffffff'
    }).setOrigin(0.5);

    this.loadLeaderboard();

    // Track navigation buttons
    const leftButton = this.add.text(width / 2 - 150, 120, '<', { fontSize: '24px', color: '#ffffff' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true });
    leftButton.on('pointerdown', () => {
        this.selectedTrackIndex = (this.selectedTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadLeaderboard();
    });

    const rightButton = this.add.text(width / 2 + 150, 120, '>', { fontSize: '24px', color: '#ffffff' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true });
    rightButton.on('pointerdown', () => {
        this.selectedTrackIndex = (this.selectedTrackIndex + 1) % this.tracks.length;
        this.loadLeaderboard();
    });

    // Difficulty navigation buttons
    const upButton = this.add.text(width / 2, 160 - 20, '^', { fontSize: '20px', color: '#ffffff' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true });
    upButton.on('pointerdown', () => {
        this.selectedDifficultyIndex = (this.selectedDifficultyIndex - 1 + this.difficulties.length) % this.difficulties.length;
        this.loadLeaderboard();
    });

    const downButton = this.add.text(width / 2, 160 + 20, 'v', { fontSize: '20px', color: '#ffffff' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true });
    downButton.on('pointerdown', () => {
        this.selectedDifficultyIndex = (this.selectedDifficultyIndex + 1) % this.difficulties.length;
        this.loadLeaderboard();
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

  private loadLeaderboard() {
    if (this.tracks.length === 0) return;

    const track = this.tracks[this.selectedTrackIndex];
    const difficulty = this.difficulties[this.selectedDifficultyIndex];
    this.trackTitle.setText(track.name);
    this.difficultyTitle.setText(difficulty.toUpperCase());

    this.clearScores();
    getScores(track.id, difficulty).then(scores => {
      this.displayScores(scores);
    });
  }

  private displayScores(scores: ScoreEntry[]) {
    this.clearScores();
    const { width } = this.scale;
    scores.forEach((score, index) => {
      const y = 200 + index * 40;
      const text = this.add.text(width / 2, y, `${index + 1}. ${score.name}: ${score.score}`,
        {
          fontFamily: 'UiFont, sans-serif',
          fontSize: '20px',
          color: '#ffffff'
        }
      ).setOrigin(0.5);
      this.scoreTexts.push(text);
    });
  }

  private clearScores() {
    this.scoreTexts.forEach(text => text.destroy());
    this.scoreTexts = [];
  }
}
