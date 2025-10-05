import Phaser from 'phaser';
import { EditorState } from '../editor/EditorState';
import { HistoryService } from '../editor/HistoryService';
import { SpawnAction } from '../systems/LanePatternController';
import { TimelineUI } from '../editor/ui/TimelineUI';
import { ObjectPaletteUI } from '../editor/ui/ObjectPaletteUI';
import { PatternEditorUI } from '../editor/ui/PatternEditorUI';
import { EnemyType } from '../config/enemyStyles';

const AVAILABLE_ENEMY_TYPES: EnemyType[] = [
    'swarm', 'brute', 'weaver', 'dasher', 'exploder', 'mirrorer', 'teleporter', 'flooder', 'formation'
];

export default class EditorScene extends Phaser.Scene {
  private historyService!: HistoryService;
  private editorState!: EditorState;
  private beatIndexText!: Phaser.GameObjects.Text;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private timeline!: TimelineUI;
  private palette!: ObjectPaletteUI;
  private patternEditor!: PatternEditorUI;

  constructor() {
    super('EditorScene');
  }

  create() {
    this.historyService = new HistoryService();
    this.editorState = new EditorState(this.historyService);

    this.add.text(50, 50, 'Beat Blaster Editor', { color: '#ffffff', fontSize: '32px' });
    this.beatIndexText = this.add.text(150, 100, `Beat: 0`, { color: '#cccccc', fontSize: '24px' });

    const prevBeatButton = this.add.text(50, 100, '< Prev', { color: '#0f0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    prevBeatButton.on('pointerdown', () => {
      const currentIndex = this.editorState.getCurrentBeatIndex();
      this.editorState.setActiveBeat(currentIndex - 1);
      this.renderState();
    });

    const nextBeatButton = this.add.text(250, 100, 'Next >', { color: '#0f0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    nextBeatButton.on('pointerdown', () => {
      const currentIndex = this.editorState.getCurrentBeatIndex();
      this.editorState.setActiveBeat(currentIndex + 1);
      this.renderState();
    });
    this.add.text(50, 150, 'Left/Right to navigate beats', { color: '#aaaaaa' });
    this.add.text(50, 190, 'Cmd/Ctrl+Z to Undo', { color: '#aaaaaa' });
    this.add.text(50, 230, 'Press ESC to return', { color: '#aaaaaa' });

    const beatTypeFilter = this.add.dom(50, 260, 'select', 'width: 150px');
    beatTypeFilter.node.innerHTML = `
      <option value="all">All Beats</option>
      <option value="normal">Normal</option>
      <option value="long">Long</option>
      <option value="special">Special</option>
    `;
    beatTypeFilter.addListener('change');
    beatTypeFilter.on('change', (event: any) => {
      this.editorState.setBeatTypeFilter(event.target.value);
      this.renderState();
    });

    const addLaneButton = this.add.text(50, 300, 'Add Lane', { color: '#0f0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    addLaneButton.on('pointerdown', () => {
      this.editorState.addLane();
      this.renderState();
    });

    const removeLaneButton = this.add.text(150, 300, 'Remove Lane', { color: '#f00', backgroundColor: '#555' }).setPadding(5).setInteractive();
    removeLaneButton.on('pointerdown', () => {
      this.editorState.removeLane();
      this.renderState();
    });

    const moveLaneLeftButton = this.add.text(50, 340, '<', { color: '#ff0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    moveLaneLeftButton.on('pointerdown', () => {
      this.editorState.moveLane(-1);
      this.renderState();
    });

    const moveLaneRightButton = this.add.text(100, 340, '>', { color: '#ff0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    moveLaneRightButton.on('pointerdown', () => {
      this.editorState.moveLane(1);
      this.renderState();
    });

    const saveButton = this.add.text(700, 50, 'Save', { color: '#0f0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    saveButton.on('pointerdown', () => this.handleSave());

    const loadButton = this.add.text(760, 50, 'Load', { color: '#ff0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    loadButton.on('pointerdown', () => this.handleLoad());

    this.debugGraphics = this.add.graphics();
    this.timeline = new TimelineUI(this, 16);
    this.palette = new ObjectPaletteUI(this, AVAILABLE_ENEMY_TYPES);
    this.patternEditor = new PatternEditorUI(this, 400, 250, AVAILABLE_ENEMY_TYPES);

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard!.on('keydown-LEFT', () => {
      const currentIndex = this.editorState.getCurrentBeatIndex();
      this.editorState.setActiveBeat(currentIndex - 1);
      this.renderState();
    });

    this.input.keyboard!.on('keydown-RIGHT', () => {
      const currentIndex = this.editorState.getCurrentBeatIndex();
      this.editorState.setActiveBeat(currentIndex + 1);
      this.renderState();
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // Ignore clicks on the UI areas
        if (pointer.x > 780 || pointer.y > 480) return;

        const activeTool = this.palette.getActiveTool();
        if (activeTool) {
            const newSpawn: SpawnAction = {
                kind: 'lane', // Default to lane for now
                enemyType: activeTool,
                speed: 1,
                lanes: 'center', // Default to center for now
                count: 1
            };
            this.editorState.addSpawn(newSpawn);
            this.renderState();
        }
    });

    // Undo/Redo
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
        if (event.metaKey || event.ctrlKey) {
            if (event.key === 'z') {
                if (event.shiftKey) {
                    this.historyService.redo();
                } else {
                    this.historyService.undo();
                }
                this.renderState();
            }
        }
    });

    this.renderState();
  }

  renderState() {
    const beatIndex = this.editorState.getCurrentBeatIndex();
    this.beatIndexText.setText(`Beat: ${beatIndex + 1} / 16`);
    this.timeline.setActiveBeat(beatIndex);

    this.debugGraphics.clear();
    const lanes = this.editorState.getLanes();
    lanes.forEach((lane, i) => {
      this.debugGraphics.fillStyle(0xcccccc, 0.5);
      this.debugGraphics.fillRect(200 + i * 100, 250, 80, 200);
    });

    const currentStep = this.editorState.getCurrentBeatStep();

    if (currentStep && currentStep.spawns) {
        currentStep.spawns.forEach((spawn, i) => {
            this.debugGraphics.fillStyle(0x00ff00, 0.5);
            this.debugGraphics.fillRect(200 + i * 50, 300, 40, 40);
        });
    }
  }

  private handleSave() {
    const name = prompt('Enter pattern name:');
    if (name) {
      if (this.editorState.save(name)) {
        alert(`Pattern '${name}' saved.`);
      } else {
        alert('Failed to save pattern.');
      }
    }
  }

  private handleLoad() {
    const patterns = this.editorState.listPatterns();
    if (patterns.length === 0) {
      alert('No saved patterns found.');
      return;
    }
    const name = prompt(`Enter pattern to load:\n\n${patterns.join('\n')}`);
    if (name) {
      if (this.editorState.load(name)) {
        this.renderState();
        alert(`Pattern '${name}' loaded.`);
      } else {
        alert(`Failed to load pattern '${name}'.`);
      }
    }
  }
}
