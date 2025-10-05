import Phaser from 'phaser';

export class PatternEditorUI {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private availableEnemyTypes: string[];
  private pattern: any[] = [];
  private nodeObjects: Phaser.GameObjects.GameObject[] = [];
  private selectedNode: any = null;
  private propertyPanelObjects: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, availableEnemyTypes: string[]) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.availableEnemyTypes = availableEnemyTypes;

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
    this.nodeObjects.forEach(obj => obj.destroy());
    this.nodeObjects = [];

    let y = this.y + 80;
    nodes.forEach((node, i) => {
      const nodeRect = this.scene.add.graphics();
      if (node.type === 'spawn') {
        nodeRect.fillStyle(0x00ff00, 0.5);
        const text = this.scene.add.text(this.x + 20, y + 10, `Spawn: ${node.enemyType} at lane ${node.lane}`, { color: '#ffffff' });
        this.nodeObjects.push(text);
      } else {
        nodeRect.fillStyle(0xffff00, 0.5);
        const text = this.scene.add.text(this.x + 20, y + 10, `Delay: ${node.duration}ms`, { color: '#ffffff' });
        this.nodeObjects.push(text);
      }
      nodeRect.fillRect(this.x + 10, y, 280, 50);
      nodeRect.setInteractive(new Phaser.Geom.Rectangle(this.x + 10, y, 280, 50), Phaser.Geom.Rectangle.Contains);
      nodeRect.on('pointerdown', () => {
        this.selectedNode = node;
        this.renderPattern(nodes);
        this.renderPropertyPanel();
      });

      if (this.selectedNode === node) {
        nodeRect.lineStyle(2, 0xffffff, 1);
        nodeRect.strokeRect(this.x + 10, y, 280, 50);
      }

      this.nodeObjects.push(nodeRect);
      y += 60;
    });
  }

  private renderPropertyPanel() {
    this.propertyPanelObjects.forEach(obj => obj.destroy());
    this.propertyPanelObjects = [];

    if (!this.selectedNode) {
      return;
    }

    const panelBg = this.scene.add.graphics();
    panelBg.fillStyle(0x555555, 1);
    panelBg.fillRect(this.x + 320, this.y, 220, 220);
    this.propertyPanelObjects.push(panelBg);

    const title = this.scene.add.text(this.x + 330, this.y + 10, 'Properties', { color: '#ffffff' });
    this.propertyPanelObjects.push(title);

    if (this.selectedNode.type === 'spawn') {
      const enemyTypeText = this.scene.add.text(this.x + 330, this.y + 40, `Enemy Type: ${this.selectedNode.enemyType}`, { color: '#ffffff' });
      const enemyTypeSelect = this.scene.add.dom(this.x + 430, this.y + 50, 'select');
      enemyTypeSelect.node.innerHTML = this.availableEnemyTypes
        .map(type => `<option value="${type}">${type}</option>`)
        .join('');
      (enemyTypeSelect.node as HTMLSelectElement).value = this.selectedNode.enemyType;
      enemyTypeSelect.addListener('change');
      enemyTypeSelect.on('change', (event: any) => {
        this.selectedNode.enemyType = event.target.value;
        this.renderPattern(this.pattern);
        this.renderPropertyPanel();
      });

      const timeLabel = this.scene.add.text(this.x + 330, this.y + 90, 'Time (ms):', { color: '#ffffff' });
      const timeInput = this.scene.add.dom(this.x + 430, this.y + 100, 'input', 'width: 70px');
      const timeNode = timeInput.node as HTMLInputElement;
      timeNode.type = 'number';
      timeNode.value = String(this.selectedNode.time ?? 0);
      timeInput.addListener('change');
      timeInput.on('change', (event: any) => {
        this.selectedNode.time = parseInt(event.target.value, 10) || 0;
        this.renderPattern(this.pattern);
        this.renderPropertyPanel();
      });

      const laneLabel = this.scene.add.text(this.x + 330, this.y + 140, 'Lane:', { color: '#ffffff' });
      const laneInput = this.scene.add.dom(this.x + 430, this.y + 150, 'input', 'width: 70px');
      const laneNode = laneInput.node as HTMLInputElement;
      laneNode.type = 'number';
      laneNode.value = String(this.selectedNode.lane ?? 0);
      laneInput.addListener('change');
      laneInput.on('change', (event: any) => {
        this.selectedNode.lane = parseInt(event.target.value, 10) || 0;
        this.renderPattern(this.pattern);
        this.renderPropertyPanel();
      });

      this.propertyPanelObjects.push(enemyTypeText, enemyTypeSelect, timeLabel, timeInput, laneLabel, laneInput);
    } else {
      const durationText = this.scene.add.text(this.x + 330, this.y + 40, `Duration: ${this.selectedNode.duration}ms`, { color: '#ffffff' });
      this.propertyPanelObjects.push(durationText);
    }
  }
}
