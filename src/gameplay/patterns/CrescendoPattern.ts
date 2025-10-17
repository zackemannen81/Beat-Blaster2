import { BaseLanePattern } from './BaseLanePattern';
import { BeatStep } from '../LanePatternController';
import { DifficultyProfileId } from '../../config/difficultyProfiles';

export class CrescendoPattern extends BaseLanePattern {
  readonly name = 'Crescendo';
  readonly duration = 16;
  private readonly pattern: BeatStep[];

  constructor(scene: Phaser.Scene, difficulty: import("../../config/difficultyProfiles").DifficultyProfile, stage: import("../../config/difficultyProfiles").StageTuning) {
    super(scene, difficulty, stage);
    this.pattern = this.buildPattern(difficulty.id);
  }

  public getStep(beatIndex: number): BeatStep | null {
    if (beatIndex < 0 || beatIndex >= this.duration) {
      return null;
    }
    return this.pattern[beatIndex];
  }

  public getPattern(): BeatStep[] {
    return this.pattern;
  }

  public addSpawn(beatIndex: number, spawn: import("../LanePatternController").SpawnAction): void {
    // Built-in patterns are immutable
  }

  public removeSpawn(beatIndex: number, spawn: import("../LanePatternController").SpawnAction): void {
    // Built-in patterns are immutable
  }

  private buildPattern(difficulty: DifficultyProfileId): BeatStep[] {
    const isHard = difficulty === 'hard';

    return [
      // Beats 1-4: Simple intro
      { spawns: [{ kind: 'lane', enemyType: 'swarm', speed: 0.7, lanes: 'center', count: 1 }] },
      { spawns: [{ kind: 'lane', enemyType: 'swarm', speed: 0.7, lanes: ['left', 'right'], count: 1 }] },
      { spawns: [{ kind: 'lane', enemyType: 'swarm', speed: 0.7, lanes: 'center', count: 2 }] },
      { pulse: true },

      // Beats 5-8: Introduce new enemy types and lane changes
      {
        laneCount: 5,
        laneEffect: 'expand',
        spawns: [{ kind: 'lane_hopper', enemyType: 'brute', speed: 0.8, from: 'outerLeft', to: 'outerRight', hopEvery: 2 }],
      },
      { spawns: [{ kind: 'weaver', enemyType: 'weaver', speed: 0.8, count: 2, amplitude: 150, wavelength: 400 }] },
      { spawns: [{ kind: 'lane', enemyType: 'swarm', speed: 0.75, lanes: ['innerLeft', 'innerRight'], count: 2 }] },
      { pulse: true },

      // Beats 9-12: Increase density and complexity
      {
        laneCount: 7,
        laneEffect: 'expand',
        spawns: [
          { kind: 'formation_dancer', enemyType: 'formation', speed: 0.9, lane: 'center', spacing: 80, count: 3 },
        ],
      },
      {
        spawns: [
          { kind: 'teleporter', enemyType: 'teleporter', speed: 0.9, count: isHard ? 2 : 1 },
          { kind: 'lane', enemyType: 'dasher', speed: 1.1, lanes: ['outerLeft', 'outerRight'], count: 1 },
        ],
      },
      {
        spawns: [
          { kind: 'lane_flood', enemyType: 'flooder', speed: 0.6, lane: 'midLeft', widthRatio: 0.8, height: 140 },
          { kind: 'lane_flood', enemyType: 'flooder', speed: 0.6, lane: 'midRight', widthRatio: 0.8, height: 140 },
        ],
      },
      { pulse: true },

      // Beats 13-16: Peak chaos
      {
        spawns: [
          { kind: 'mirrorer', enemyType: 'mirrorer', speed: 1.0, count: isHard ? 2 : 1, spread: 120 },
          { kind: 'burst', enemyType: 'swarm', speed: 1.1, count: 4, cone: 90 },
        ],
      },
      {
        spawns: [
          { kind: 'lane', enemyType: 'exploder', speed: 0.7, lanes: ['innerLeft', 'center', 'innerRight'], count: 1 },
        ],
      },
      {
        spawns: [
          { kind: 'lane', enemyType: 'dasher', speed: 1.2, lanes: ['outerLeft', 'outerRight'], count: 2 },
          { kind: 'teleporter', enemyType: 'teleporter', speed: 1.0, count: isHard ? 2 : 1 },
        ],
      },
      {
        laneCount: 3,
        laneEffect: 'collapse',
        spawns: [{ kind: 'burst', enemyType: 'swarm', speed: 1.2, count: 8, cone: 180, rings: 2, category: 'heavy' }],
        pulse: true,
      },
    ];
  }
}
