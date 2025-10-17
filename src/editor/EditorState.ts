import { BeatStep, SpawnAction } from '@gameplay/LanePatternController';
import { Command, HistoryService } from './HistoryService';

// --- Command Implementations ---

class AddSpawnCommand implements Command {
  constructor(
    private state: BeatStep[],
    private beatIndex: number,
    private spawn: SpawnAction
  ) {}

  execute(): void {
    if (!this.state[this.beatIndex]) {
      this.state[this.beatIndex] = { spawns: [] };
    }
    if (!this.state[this.beatIndex].spawns) {
        this.state[this.beatIndex].spawns = [];
    }
    this.state[this.beatIndex].spawns!.push(this.spawn);
  }

  undo(): void {
    const step = this.state[this.beatIndex];
    if (step && step.spawns) {
      step.spawns = step.spawns.filter(s => s !== this.spawn);
    }
  }
}

export class EditorState {
  private history: HistoryService;
  private pattern: BeatStep[] = [];
  private activeBeatIndex = 0;
  private beatTypeFilter: string = 'all';
  private lanes: any[] = [];

  constructor(historyService: HistoryService) {
    this.history = historyService;
    // Initialize with a 16-beat empty pattern
    this.pattern = Array(16).fill(null).map(() => ({ spawns: [] }));
    // Initialize with 3 lanes
    this.lanes = [
      { id: 1, position: 0, type: 'normal' },
      { id: 2, position: 1, type: 'normal' },
      { id: 3, position: 2, type: 'normal' },
    ];
  }

  public setBeatTypeFilter(filter: string) {
    this.beatTypeFilter = filter;
  }

  public addLane() {
    const newLane = { id: this.lanes.length + 1, position: this.lanes.length, type: 'normal' };
    this.lanes.push(newLane);
  }

  public removeLane() {
    if (this.lanes.length > 1) {
      this.lanes.pop();
    }
  }

  public moveLane(direction: number) {
    const selectedLane = this.lanes.find(lane => lane.position === this.activeBeatIndex);
    if (selectedLane) {
      const newPosition = selectedLane.position + direction;
      if (newPosition >= 0 && newPosition < this.lanes.length) {
        const otherLane = this.lanes.find(lane => lane.position === newPosition);
        if (otherLane) {
          otherLane.position -= direction;
        }
        selectedLane.position = newPosition;
      }
    }
  }

  public addSpawn(spawn: SpawnAction) {
    const command = new AddSpawnCommand(this.pattern, this.activeBeatIndex, spawn);
    this.history.execute(command);
  }

  public setActiveBeat(index: number) {
    this.activeBeatIndex = Math.max(0, Math.min(index, this.pattern.length - 1));
  }

  public getPattern(): Readonly<BeatStep[]> {
    if (this.beatTypeFilter === 'all') {
      return this.pattern;
    }
    // TODO: Implement beat filtering based on beat properties
    return this.pattern;
  }

  public getLanes(): any[] {
    return this.lanes;
  }

  public getCurrentBeatIndex(): number {
    return this.activeBeatIndex;
  }
  
  public getCurrentBeatStep(): Readonly<BeatStep> | null {
    return this.pattern[this.activeBeatIndex] ?? null;
  }

  public save(name: string): boolean {
    if (!name) return false;
    try {
      const json = JSON.stringify(this.pattern, null, 2);
      localStorage.setItem(`bb-pattern-${name}`, json);
      return true;
    } catch (e) {
      console.error('Error saving pattern:', e);
      return false;
    }
  }

  public load(name: string): boolean {
    if (!name) return false;
    try {
      const json = localStorage.getItem(`bb-pattern-${name}`);
      if (json) {
        this.pattern = JSON.parse(json);
        this.history.execute({ execute: () => {}, undo: () => {} }); // Clear history
        this.setActiveBeat(0);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error loading pattern:', e);
      return false;
    }
  }

  public listPatterns(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bb-pattern-')) {
        keys.push(key.replace('bb-pattern-', ''));
      }
    }
    return keys;
  }
}
