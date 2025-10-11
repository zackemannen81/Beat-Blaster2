
export type ScoreEntry = { name: string; score: number; };

const MOCK_LEADERBOARDS: Record<string, Record<string, ScoreEntry[]>> = {
  'track1': {
    'easy': [
      { name: 'Player1', score: 10000 },
      { name: 'Player2', score: 9000 },
      { name: 'Player3', score: 8000 },
    ],
    'normal': [
      { name: 'Player1', score: 20000 },
      { name: 'Player2', score: 18000 },
      { name: 'Player3', score: 16000 },
    ],
    'hard': [
      { name: 'Player1', score: 30000 },
      { name: 'Player2', score: 27000 },
      { name: 'Player3', score: 24000 },
    ],
  },
  'track2': {
    'easy': [
      { name: 'PlayerA', score: 12000 },
      { name: 'PlayerB', score: 11000 },
      { name: 'PlayerC', score: 10500 },
    ],
    'normal': [
        { name: 'PlayerA', score: 24000 },
        { name: 'PlayerB', score: 22000 },
        { name: 'PlayerC', score: 21000 },
    ],
    'hard': [
        { name: 'PlayerA', score: 36000 },
        { name: 'PlayerB', score: 33000 },
        { name: 'PlayerC', score: 31500 },
    ],
  },
};

export function getScores(trackId: string, difficulty: string): Promise<ScoreEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_LEADERBOARDS[trackId]?.[difficulty] || []);
    }, 500);
  });
}

export function submitScore(trackId: string, difficulty: string, name: string, score: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!MOCK_LEADERBOARDS[trackId]) {
        MOCK_LEADERBOARDS[trackId] = {};
      }
      if (!MOCK_LEADERBOARDS[trackId][difficulty]) {
        MOCK_LEADERBOARDS[trackId][difficulty] = [];
      }
      MOCK_LEADERBOARDS[trackId][difficulty].push({ name, score });
      MOCK_LEADERBOARDS[trackId][difficulty].sort((a, b) => b.score - a.score);
      resolve();
    }, 500);
  });
}
