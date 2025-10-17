import { BaseLanePattern } from './BaseLanePattern';
import { BeatStep } from '../LanePatternController';
import { DifficultyProfileId } from '../../config/difficultyProfiles';

export class SyncopationPattern extends BaseLanePattern {
  readonly name = 'Syncopation';
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
      // Beat 1: Empty downbeat
      { laneCount: 5, laneEffect: 'expand' },
      // Beat 2: Off-beat weavers
      { spawns: [{ kind: 'weaver', enemyType: 'weaver', speed: 1.1, count: 2, amplitude: 200, wavelength: 300 }] },
      // Beat 3: Quick lane hop
      { spawns: [{ kind: 'lane_hopper', enemyType: 'brute', speed: 1.0, from: 'innerLeft', to: 'innerRight', hopEvery: 1 }] },
      // Beat 4: Empty
      { pulse: true },

      // Beat 5: Staggered teleporters
      { spawns: [{ kind: 'teleporter', enemyType: 'teleporter', speed: 0.9, count: 1, lanes: 'outerLeft' }] },
      // Beat 6: Another teleporter, creating a 1-2 punch
      { spawns: [{ kind: 'teleporter', enemyType: 'teleporter', speed: 0.9, count: 1, lanes: 'outerRight' }] },
      // Beat 7: Empty
      { },
      // Beat 8: A flood to force movement
      { spawns: [{ kind: 'lane_flood', enemyType: 'flooder', speed: 0.7, lane: 'center', widthRatio: 0.9, height: 120 }], pulse: true },

      // Beat 9: Lane change and fast dancers
      {
        laneCount: 7,
        laneEffect: 'expand',
        spawns: [{ kind: 'formation_dancer', enemyType: 'formation', speed: 1.2, lane: 'center', spacing: 60, count: 3 }],
      },
      // Beat 10: Empty
      { },
      // Beat 11: Mirrorer appears
      { spawns: [{ kind: 'mirrorer', enemyType: 'mirrorer', speed: 1.0, count: 1 }] },
      // Beat 12: Empty
      { pulse: true },

      // Beat 13: Rapid fire dashers
      { spawns: [{ kind: 'lane', enemyType: 'dasher', speed: 1.3, lanes: ['midLeft', 'midRight'], count: 1 }] },
      // Beat 14: More dashers, offset
      { spawns: [{ kind: 'lane', enemyType: 'dasher', speed: 1.3, lanes: ['outerLeft', 'outerRight'], count: 1 }] },
      // Beat 15: Exploder as a trap
      { spawns: [{ kind: 'lane', enemyType: 'exploder', speed: 0.8, lanes: 'center', count: 1 }] },
      // Beat 16: Collapse and reset
      { laneCount: 3, laneEffect: 'collapse', pulse: true },
    ];
  }
}
