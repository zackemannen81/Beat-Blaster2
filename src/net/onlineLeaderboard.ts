
export type ScoreEntry = { name: string; score: number; };

const MOCK_LEADERBOARDS: Record<string, Record<string, ScoreEntry[]>> = {
  'track1': {
    'easy': [
      { name: 'Player1', score: 10000 },
      { name: 'Player2', score: 9000 },
      { name: 'Player3', score: 8000 },
      { name: 'Vortex', score: 450 },
      { name: 'Blaze', score: 320 },
      { name: 'Zero', score: 210 },
      { name: 'Rogue', score: 150 },
      { name: 'Nova', score: 110 },
    ],
    'normal': [
      { name: 'Player1', score: 20000 },
      { name: 'Player2', score: 18000 },
      { name: 'Player3', score: 16000 },
      { name: 'Apex', score: 480 },
      { name: 'Cypher', score: 350 },
      { name: 'Jinx', score: 250 },
      { name: 'Raptor', score: 180 },
      { name: 'Ghost', score: 120 },
    ],
    'hard': [
      { name: 'Player1', score: 30000 },
      { name: 'Player2', score: 27000 },
      { name: 'Player3', score: 24000 },
      { name: 'Vortex', score: 490 },
      { name: 'Blaze', score: 380 },
      { name: 'Zero', score: 280 },
      { name: 'Rogue', score: 200 },
      { name: 'Nova', score: 150 },
    ],
  },
  'track2': {
    'easy': [
      { name: 'PlayerA', score: 12000 },
      { name: 'PlayerB', score: 11000 },
      { name: 'PlayerC', score: 10500 },
      { name: 'Apex', score: 460 },
      { name: 'Cypher', score: 330 },
      { name: 'Jinx', score: 220 },
      { name: 'Raptor', score: 160 },
      { name: 'Ghost', score: 130 },
    ],
    'normal': [
        { name: 'PlayerA', score: 24000 },
        { name: 'PlayerB', score: 22000 },
        { name: 'PlayerC', score: 21000 },
        { name: 'Vortex', score: 470 },
        { name: 'Blaze', score: 360 },
        { name: 'Zero', score: 260 },
        { name: 'Rogue', score: 190 },
        { name: 'Nova', score: 140 },
    ],
    'hard': [
        { name: 'PlayerA', score: 36000 },
        { name: 'PlayerB', score: 33000 },
        { name: 'PlayerC', score: 31500 },
        { name: 'Apex', score: 495 },
        { name: 'Cypher', score: 390 },
        { name: 'Jinx', score: 290 },
        { name: 'Raptor', score: 210 },
        { name: 'Ghost', score: 160 },
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
