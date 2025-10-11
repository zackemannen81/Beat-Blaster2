
export type ScoreEntry = { name: string; score: number; };

const MOCK_LEADERBOARDS: Record<string, ScoreEntry[]> = {
  'track1': [
    { name: 'Player1', score: 10000 },
    { name: 'Player2', score: 9000 },
    { name: 'Player3', score: 8000 },
  ],
  'track2': [
    { name: 'PlayerA', score: 12000 },
    { name: 'PlayerB', score: 11000 },
    { name: 'PlayerC', score: 10500 },
  ],
};

export function getScores(trackId: string): Promise<ScoreEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_LEADERBOARDS[trackId] || []);
    }, 500);
  });
}

export function submitScore(trackId: string, name: string, score: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!MOCK_LEADERBOARDS[trackId]) {
        MOCK_LEADERBOARDS[trackId] = [];
      }
      MOCK_LEADERBOARDS[trackId].push({ name, score });
      MOCK_LEADERBOARDS[trackId].sort((a, b) => b.score - a.score);
      resolve();
    }, 500);
  });
}
