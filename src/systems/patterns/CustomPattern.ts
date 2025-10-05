import { BaseLanePattern } from './BaseLanePattern';
import { BeatStep } from '../LanePatternController';

export class CustomPattern extends BaseLanePattern {
  readonly name: string;
  readonly duration: number;
  private readonly pattern: BeatStep[];

  constructor(scene: Phaser.Scene, difficulty: import("../../config/difficultyProfiles").DifficultyProfile, stage: import("../../config/difficultyProfiles").StageTuning, name: string, patternData: BeatStep[]) {
    super(scene, difficulty, stage);
    this.name = name;
    this.pattern = patternData;
    this.duration = patternData.length;
  }

  public getStep(beatIndex: number): BeatStep | null {
    if (beatIndex < 0 || beatIndex >= this.duration) {
      return null;
    }
    return this.pattern[beatIndex];
  }
}
