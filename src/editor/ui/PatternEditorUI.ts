import Phaser from 'phaser';

export class PatternEditorUI {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private pattern: any[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    const editorBackground = this.scene.add.graphics();
    editorBackground.fillStyle(0x333333, 1);
    editorBackground.fillRect(x, y, 300, 200);

    this.scene.add.text(x + 10, y + 10, 'Pattern Editor', { color: '#ffffff' });

    const addSpawnNodeButton = this.scene.add.text(x + 10, y + 40, 'Add Spawn Node', { color: '#0f0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    addSpawnNodeButton.on('pointerdown', () => {
      this.pattern.push({ type: 'spawn', enemyType: 'swarm', lane: 0, time: 0 });
      this.renderPattern(this.pattern);
    });

    const addDelayNodeButton = this.scene.add.text(x + 150, y + 40, 'Add Delay Node', { color: '#ff0', backgroundColor: '#555' }).setPadding(5).setInteractive();
    addDelayNodeButton.on('pointerdown', () => {
      // TODO: Implement adding a delay node
    });

    this.renderPattern([]);
  }

  private renderPattern(nodes: any[]) {
    let y = this.y + 80;
    nodes.forEach((node, i) => {
      const nodeRect = this.scene.add.graphics();
      if (node.type === 'spawn') {
        nodeRect.fillStyle(0x00ff00, 0.5);
      } else {
        nodeRect.fillStyle(0xffff00, 0.5);
      }
      nodeRect.fillRect(this.x + 10, y, 280, 50);
      y += 60;
    });
  }
  }
}
