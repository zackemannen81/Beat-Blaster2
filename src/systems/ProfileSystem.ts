
import { PlayerProfile } from '../types/profile';

const PROFILE_KEY = 'player_profile';

export class ProfileSystem {
  private profile: PlayerProfile;

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): PlayerProfile {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }

    // Create a default profile
    const name = localStorage.getItem('bb_name') || 'Player';
    const defaultProfile: PlayerProfile = {
      name: name,
      avatar: 'default_avatar', // Placeholder
      stats: {
        totalKills: 0,
        totalScore: 0,
        gamesPlayed: 0,
      },
      unlockedAchievements: [],
    };
    this.saveProfile(defaultProfile);
    return defaultProfile;
  }

  public saveProfile(profile: PlayerProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  public getProfile(): PlayerProfile {
    return this.profile;
  }

  public updateStats(score: number, kills: number): void {
    this.profile.stats.totalScore += score;
    this.profile.stats.totalKills += kills;
    this.profile.stats.gamesPlayed++;
    this.saveProfile(this.profile);
  }

  public syncAchievements(unlocked: string[]): void {
    this.profile.unlockedAchievements = unlocked;
    this.saveProfile(this.profile);
  }
}
