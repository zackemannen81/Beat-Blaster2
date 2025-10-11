
import achievements from '../config/achievements.json';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  criteria: {
    type: 'stat' | 'accuracy' | 'score';
    stat?: string;
    threshold: number;
  };
};

export class AchievementSystem {
  private achievements: Achievement[];
  private unlockedAchievements: Set<string>;

  constructor() {
    this.achievements = achievements;
    const saved = localStorage.getItem('unlocked_achievements');
    this.unlockedAchievements = saved ? new Set(JSON.parse(saved)) : new Set();
  }

  public isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  public unlockAchievement(achievementId: string): void {
    if (this.isUnlocked(achievementId)) {
      return;
    }

    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement) {
      this.unlockedAchievements.add(achievementId);
      localStorage.setItem('unlocked_achievements', JSON.stringify(Array.from(this.unlockedAchievements)));
      console.log(`Achievement unlocked: ${achievement.name}`);
      // We can dispatch an event here to show a notification in the UI
    }
  }

  public checkStatAchievement(stat: string, value: number): void {
    this.achievements.forEach(achievement => {
      if (achievement.criteria.type === 'stat' && achievement.criteria.stat === stat && value >= achievement.criteria.threshold) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  public checkScoreAchievement(score: number): void {
    this.achievements.forEach(achievement => {
      if (achievement.criteria.type === 'score' && score >= achievement.criteria.threshold) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  public checkAccuracyAchievement(accuracy: number): void {
    this.achievements.forEach(achievement => {
      if (achievement.criteria.type === 'accuracy' && accuracy >= achievement.criteria.threshold) {
        this.unlockAchievement(achievement.id);
      }
    });
  }
}
