import Phaser from 'phaser';
import WaveDirector from './WaveDirector';
import LaneManager from './LaneManager';
import { DifficultyProfile, DifficultyProfileId, StageTuning } from '../config/difficultyProfiles';
import { EnemyType } from '../config/enemyStyles';
import { WaveDescriptor, WaveCategory } from '../types/waves';
import { BaseLanePattern } from './patterns/BaseLanePattern';
import { ClassicPattern } from './patterns/ClassicPattern';

export type LaneEffect = 'collapse' | 'expand' | 'pulse';

export interface LanePatternControllerOptions {
  scene: Phaser.Scene;
  difficulty: DifficultyProfile;
  stage: StageTuning;
  waveDirector: WaveDirector;
  getLaneManager: () => LaneManager | undefined;
  requestLaneCount: (count: 3 | 5 | 7, effect?: LaneEffect) => void;
}

export type LaneRef =
  | 'left'
  | 'right'
  | 'center'
  | 'innerLeft'
  | 'innerRight'
  | 'outerLeft'
  | 'outerRight'
  | 'midLeft'
  | 'midRight'
  | 'edges'
  | 'innerPair'
  | 'outerPair'
  | 'random';

export type SpawnBase = {
  enemyType: EnemyType;
  speed: number;
  hpMultiplier?: number;
  category?: WaveCategory;
};

export type LaneSpawn = SpawnBase & {
  kind: 'lane';
  lanes: LaneRef | LaneRef[];
  count: number;
};

export type LaneHopperSpawn = SpawnBase & {
  kind: 'lane_hopper';
  from: LaneRef;
  to: LaneRef;
  hopEvery?: number;
};

export type WeaverSpawn = SpawnBase & {
  kind: 'weaver';
  count: number;
  amplitude: number;
  wavelength: number;
};

export type TeleporterSpawn = SpawnBase & {
  kind: 'teleporter';
  count: number;
  lanes?: LaneRef | LaneRef[];
};

export type LaneFloodSpawn = SpawnBase & {
  kind: 'lane_flood';
  lane: LaneRef;
  widthRatio?: number;
  height?: number;
};

export type FormationSpawn = SpawnBase & {
  kind: 'formation_dancer';
  lane?: LaneRef;
  spacing?: number;
  count: number;
};

export type BurstSpawn = SpawnBase & {
  kind: 'burst';
  count: number;
  cone: number;
  rings?: number;
};

export type MirrorerSpawn = SpawnBase & {
  kind: 'mirrorer';
  count: number;
  spread?: number;
};

export type SpawnAction =
  | LaneSpawn
  | LaneHopperSpawn
  | WeaverSpawn
  | TeleporterSpawn
  | LaneFloodSpawn
  | FormationSpawn
  | BurstSpawn
  | MirrorerSpawn;

export interface BeatStep {
  laneCount?: 3 | 5 | 7;
  laneEffect?: LaneEffect;
  spawns?: SpawnAction[];
  pulse?: boolean;
}

const DIFFICULTY_COUNT: Record<DifficultyProfileId, number> = {
  easy: 0.75,
  normal: 1,
  hard: 1.35,
  wip: 1,
};

const DIFFICULTY_SPEED: Record<DifficultyProfileId, number> = {
  easy: 0.9,
  normal: 1,
  hard: 1.18,
  wip: 1,
};

export default class LanePatternController {
  private scene: Phaser.Scene;
  private waveDirector: WaveDirector;
  private getLaneManager: () => LaneManager | undefined;
  private requestLaneCount: (count: 3 | 5 | 7, effect?: LaneEffect) => void;
  private beatIndex = 0;
  private cycleIndex = 0;
  private currentLaneCount: 3 | 5 | 7 = 3;
  private sequence = 0;
  private countMultiplier: number;
  private speedMultiplier: number;
  private stageCountMultiplier: number;
  private stageSpeedMultiplier: number;
  private activePattern: BaseLanePattern;

  constructor(options: LanePatternControllerOptions) {
    this.scene = options.scene;
    this.waveDirector = options.waveDirector;
    this.getLaneManager = options.getLaneManager;
    this.requestLaneCount = options.requestLaneCount;

    this.countMultiplier = DIFFICULTY_COUNT[options.difficulty.id];
    this.speedMultiplier = DIFFICULTY_SPEED[options.difficulty.id];
    this.stageCountMultiplier = Math.max(0.6, options.stage.spawnMultiplier ?? 1);
    this.stageSpeedMultiplier = Math.max(0.7, options.stage.scrollMultiplier ?? 1);
    
    // Default to ClassicPattern, but this can be changed
    this.activePattern = new ClassicPattern(this.scene, options.difficulty, options.stage);
  }

  public loadPattern(pattern: BaseLanePattern) {
    this.activePattern = pattern;
    this.beatIndex = 0;
    this.cycleIndex = 0;
  }

  handleBeat(band: 'low' | 'mid' | 'high'): boolean {
    if (band !== 'low') return false;
    
    const step = this.activePattern.getStep(this.beatIndex);

    if (step) {
      if (step.laneCount && step.laneCount !== this.currentLaneCount) {
        this.currentLaneCount = step.laneCount;
        this.requestLaneCount(step.laneCount, step.laneEffect);
      }
      const manager = this.getLaneManager();
      if (step.spawns) {
        for (const spawn of step.spawns) {
          this.scheduleSpawn(spawn, manager);
        }
      }
      if (step.pulse) {
        this.scene.events.emit('lanes:pulse');
      }
    }

    this.beatIndex += 1;
    if (this.beatIndex >= this.activePattern.duration) {
      this.beatIndex = 0;
      this.cycleIndex += 1;
      this.sequence = 0;
      this.scene.events.emit('patternCycleCompleted', { cycleIndex: this.cycleIndex });
    }
    return true;
  }

  updateStage(stage: StageTuning) {
    this.stageCountMultiplier = Math.max(0.6, stage.spawnMultiplier ?? 1);
    this.stageSpeedMultiplier = Math.max(0.7, stage.scrollMultiplier ?? 1);
  }

  private resolveCount(base: number): number {
    const scaled = Math.round(base * this.countMultiplier * this.stageCountMultiplier);
    return Math.max(1, scaled);
  }

  private resolveSpeed(base: number): number {
    const scaled = base * this.speedMultiplier * this.stageSpeedMultiplier;
    return Phaser.Math.Clamp(scaled, 0.45, 1.6);
  }

  private scheduleSpawn(spawn: SpawnAction, manager?: LaneManager) {
    switch (spawn.kind) {
      case 'lane':
        this.scheduleLaneSpawn(spawn, manager);
        break;
      case 'lane_hopper':
        this.scheduleLaneHopper(spawn, manager);
        break;
      case 'weaver':
        this.scheduleWeaver(spawn);
        break;
      case 'teleporter':
        this.scheduleTeleporter(spawn, manager);
        break;
      case 'lane_flood':
        this.scheduleFlood(spawn, manager);
        break;
      case 'formation_dancer':
        this.scheduleFormation(spawn, manager);
        break;
      case 'burst':
        this.scheduleBurst(spawn);
        break;
      case 'mirrorer':
        this.scheduleMirror(spawn, manager);
        break;
    }
  }

  private scheduleLaneSpawn(spawn: LaneSpawn, manager?: LaneManager) {
    const lanes = Array.isArray(spawn.lanes) ? spawn.lanes : [spawn.lanes];
    lanes.forEach((laneRef) => {
      const laneIndex = this.resolveLaneIndex(laneRef, manager);
      const descriptor: WaveDescriptor = {
        id: this.makeId('lane'),
        formation: 'lane',
        enemyType: spawn.enemyType,
        count: this.resolveCount(spawn.count),
        speedMultiplier: this.resolveSpeed(spawn.speed),
        hpMultiplier: spawn.hpMultiplier,
        formationParams: { laneIndex },
        category: spawn.category ?? 'standard',
      };
      this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false, force: true });
    });
  }

  private scheduleLaneHopper(spawn: LaneHopperSpawn, manager?: LaneManager) {
    const laneA = this.resolveLaneIndex(spawn.from, manager);
    const laneB = this.resolveLaneIndex(spawn.to, manager);
    const descriptor: WaveDescriptor = {
      id: this.makeId('hopper'),
      formation: 'lane_hopper',
      enemyType: spawn.enemyType,
      speedMultiplier: this.resolveSpeed(spawn.speed),
      hpMultiplier: spawn.hpMultiplier,
      formationParams: { laneA, laneB, hopEveryBeats: spawn.hopEvery ?? 1 },
      category: spawn.category ?? 'standard',
    };
    this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false, force: true });
  }

  private scheduleWeaver(spawn: WeaverSpawn) {
    const descriptor: WaveDescriptor = {
      id: this.makeId('weaver'),
      formation: 'weaver',
      enemyType: spawn.enemyType,
      count: this.resolveCount(spawn.count),
      speedMultiplier: this.resolveSpeed(spawn.speed),
      hpMultiplier: spawn.hpMultiplier,
      formationParams: {
        amplitude: spawn.amplitude,
        wavelength: spawn.wavelength,
      },
      category: spawn.category ?? 'standard',
    };
    this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false, force: true });
  }

  private scheduleTeleporter(spawn: TeleporterSpawn, manager?: LaneManager) {
    const baseLaneRef = Array.isArray(spawn.lanes) ? spawn.lanes[0] : spawn.lanes ?? 'center';
    const laneIndex = this.resolveLaneIndex(baseLaneRef, manager);
    const descriptor: WaveDescriptor = {
      id: this.makeId('teleporter'),
      formation: 'teleporter',
      enemyType: spawn.enemyType,
      count: this.resolveCount(spawn.count),
      speedMultiplier: this.resolveSpeed(spawn.speed),
      hpMultiplier: spawn.hpMultiplier,
      formationParams: {
        laneIndex,
      },
      category: spawn.category ?? 'standard',
    };
    this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false, force: true });
  }

  private scheduleFlood(spawn: LaneFloodSpawn, manager?: LaneManager) {
    const laneIndex = this.resolveLaneIndex(spawn.lane, manager);
    const laneWidth = this.estimateLaneWidth(manager);
    const descriptor: WaveDescriptor = {
      id: this.makeId('flood'),
      formation: 'lane_flood',
      enemyType: spawn.enemyType,
      speedMultiplier: this.resolveSpeed(spawn.speed),
      hpMultiplier: spawn.hpMultiplier,
      formationParams: {
        laneIndex,
        width: laneWidth * (spawn.widthRatio ?? 0.85),
        height: spawn.height ?? 160,
      },
      category: spawn.category ?? 'heavy',
    };
    this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false, force: true });
  }

  private scheduleFormation(spawn: FormationSpawn, manager?: LaneManager) {
    const laneIndex = this.resolveLaneIndex(spawn.lane ?? 'center', manager);
    const descriptor: WaveDescriptor = {
      id: this.makeId('formation'),
      formation: 'formation_dancer',
      enemyType: spawn.enemyType,
      count: this.resolveCount(spawn.count),
      speedMultiplier: this.resolveSpeed(spawn.speed),
      hpMultiplier: spawn.hpMultiplier,
      formationParams: {
        laneIndex,
        spacing: spawn.spacing ?? 90,
      },
      category: spawn.category ?? 'standard',
    };
    this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false, force: true });
  }

  private scheduleBurst(spawn: BurstSpawn) {
    const descriptor: WaveDescriptor = {
      id: this.makeId('burst'),
      formation: 'burst',
      enemyType: spawn.enemyType,
      count: this.resolveCount(spawn.count),
      speedMultiplier: this.resolveSpeed(spawn.speed),
      hpMultiplier: spawn.hpMultiplier,
      formationParams: {
        coneDegrees: spawn.cone,
        ringCount: spawn.rings ?? 1,
      },
      category: spawn.category ?? 'heavy',
    };
    this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false, force: true });
  }

  private scheduleMirror(spawn: MirrorerSpawn, manager?: LaneManager) {
    const laneIndex = this.resolveLaneIndex('center', manager);
    const descriptor: WaveDescriptor = {
      id: this.makeId('mirror'),
      formation: 'mirrorer',
      enemyType: spawn.enemyType,
      count: this.resolveCount(spawn.count),
      speedMultiplier: this.resolveSpeed(spawn.speed),
      hpMultiplier: spawn.hpMultiplier,
      formationParams: {
        laneIndex,
        spread: spawn.spread ?? 96,
      },
      category: spawn.category ?? 'heavy',
    };
    this.waveDirector.scheduleDescriptor(descriptor, { respectAvailability: false });
  }

  private resolveLaneIndex(ref: LaneRef, manager?: LaneManager): number {
    const laneCount = this.currentLaneCount;
    if (ref === 'edges') return 0;
    if (ref === 'outerPair') return 0;
    if (ref === 'innerPair') return laneCount > 3 ? 1 : 0;
    if (ref === 'random') return Phaser.Math.Between(0, laneCount - 1);

    const last = laneCount - 1;
    switch (ref) {
      case 'left':
      case 'outerLeft':
        return 0;
      case 'right':
      case 'outerRight':
        return last;
      case 'center':
        return Math.floor(laneCount / 2);
      case 'innerLeft':
        return laneCount >= 5 ? 1 : 0;
      case 'innerRight':
        return laneCount >= 5 ? last - 1 : last;
      case 'midLeft':
        return laneCount === 7 ? 2 : laneCount >= 5 ? 1 : 0;
      case 'midRight':
        return laneCount === 7 ? laneCount - 3 : laneCount >= 5 ? laneCount - 2 : last;
      default:
        return Math.floor(laneCount / 2);
    }
  }

  private estimateLaneWidth(manager?: LaneManager): number {
    if (!manager) return this.scene.scale.width / this.currentLaneCount;
    const all = manager.getAll();
    if (all.length <= 1) return this.scene.scale.width / this.currentLaneCount;
    let sum = 0;
    for (let i = 1; i < all.length; i++) {
      sum += Math.abs(all[i].centerX - all[i - 1].centerX);
    }
    return sum / (all.length - 1);
  }

  private makeId(prefix: string) {
    return `pattern_${this.cycleIndex}_${this.beatIndex}_${prefix}_${this.sequence++}`;
  }
}
