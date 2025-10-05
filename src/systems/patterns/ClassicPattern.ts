import { BaseLanePattern } from './BaseLanePattern';
import { BeatStep } from '../LanePatternController';
import { DifficultyProfileId } from '../../config/difficultyProfiles';

export class ClassicPattern extends BaseLanePattern {
  readonly name = 'Classic';
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

  private buildPattern(difficulty: DifficultyProfileId): BeatStep[] {
    const teleporterCount = difficulty === 'hard' ? 3 : 2;
    const mirrorCount = difficulty === 'hard' ? 4 : 3;
    const dashCount = difficulty === 'hard' ? 4 : difficulty === 'normal' ? 3 : 2;

    return [
      {
        laneCount: 3,
        spawns: [
          { kind: 'lane_hopper', enemyType: 'brute', speed: 0.92, from: 'outerLeft', to: 'outerRight', hopEvery: 1 },
        ],
      },
      {
        spawns: [{ kind: 'weaver', enemyType: 'weaver', speed: 0.86, count: 3, amplitude: 170, wavelength: 420 }],
      },
      {
        spawns: [{ kind: 'teleporter', enemyType: 'teleporter', speed: 0.8, count: teleporterCount }],
      },
      {
        laneEffect: 'collapse',
        spawns: [{ kind: 'lane', enemyType: 'swarm', speed: 0.78, lanes: 'center', count: 4 }],
        pulse: true,
      },
      {
        laneCount: 5,
        laneEffect: 'expand',
        spawns: [
          { kind: 'lane_flood', enemyType: 'flooder', speed: 0.6, lane: 'outerLeft', widthRatio: 0.8, height: 160 },
        ],
      },
      {
        spawns: [
          { kind: 'formation_dancer', enemyType: 'formation', speed: 0.88, lane: 'center', spacing: 90, count: 3 },
        ],
      },
      {
        spawns: [{ kind: 'lane', enemyType: 'exploder', speed: 0.64, lanes: ['innerLeft', 'innerRight'], count: 2 }],
      },
      {
        spawns: [{ kind: 'lane', enemyType: 'dasher', speed: 1.18, lanes: ['outerLeft', 'outerRight'], count: dashCount }],
      },
      {
        laneCount: 7,
        laneEffect: 'expand',
        spawns: [
          {
            kind: 'lane',
            enemyType: 'brute',
            speed: 0.7,
            lanes: 'center',
            count: 1,
            hpMultiplier: difficulty === 'hard' ? 1.6 : 1.3,
            category: 'heavy',
          },
        ],
      },
      {
        spawns: [{ kind: 'burst', enemyType: 'swarm', speed: 1.05, count: 6, cone: 140, rings: 1 }],
      },
      {
        spawns: [{ kind: 'lane', enemyType: 'dasher', speed: 1.25, lanes: ['outerLeft', 'outerRight'], count: dashCount }],
      },
      {
        spawns: [{ kind: 'teleporter', enemyType: 'teleporter', speed: 0.95, count: teleporterCount + 1 }],
      },
      {
        spawns: [{ kind: 'mirrorer', enemyType: 'mirrorer', speed: 0.92, count: mirrorCount, spread: 100 }],
      },
      {
        laneEffect: 'pulse',
        spawns: [
          { kind: 'lane_flood', enemyType: 'flooder', speed: 0.55, lane: 'center', widthRatio: 0.92, height: 190 },
        ],
      },
      {
        spawns: [
          { kind: 'lane', enemyType: 'exploder', speed: 0.68, lanes: ['innerLeft', 'innerRight'], count: 2 },
          { kind: 'teleporter', enemyType: 'teleporter', speed: 1, count: teleporterCount },
        ],
      },
      {
        laneCount: 3,
        laneEffect: 'collapse',
        spawns: [{ kind: 'lane', enemyType: 'swarm', speed: 0.82, lanes: 'center', count: 5 }],
        pulse: true,
      },
    ];
  }
}
