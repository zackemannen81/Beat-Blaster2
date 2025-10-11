
export type PlayerProfile = {
  name: string;
  avatar: string; // For now, a string representing the avatar key
  stats: {
    totalKills: number;
    totalScore: number;
    gamesPlayed: number;
  };
  unlockedAchievements: string[];
};
