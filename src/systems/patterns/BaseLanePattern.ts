import { BeatStep } from '../LanePatternController';
import { DifficultyProfile, StageTuning } from '../../config/difficultyProfiles';

export abstract class BaseLanePattern {
  protected scene: Phaser.Scene;
  protected difficulty: DifficultyProfile;
  protected stage: StageTuning;

  abstract readonly name: string;
  abstract readonly duration: number;

  constructor(scene: Phaser.Scene, difficulty: DifficultyProfile, stage: StageTuning) {
    this.scene = scene;
    this.difficulty = difficulty;
    this.stage = stage;
  }

  public abstract getStep(beatIndex: number): BeatStep | null;
}
