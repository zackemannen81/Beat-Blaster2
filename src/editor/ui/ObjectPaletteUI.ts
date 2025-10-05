import Phaser from 'phaser';
import { EnemyType } from '../../config/enemyStyles';

const PALETTE_X = 800;
const PALETTE_Y = 50;
const ITEM_HEIGHT = 30;
const ITEM_SPACING = 5;

export class ObjectPaletteUI {
  private scene: Phaser.Scene;
  private items: { type: EnemyType; text: Phaser.GameObjects.Text }[] = [];
  private activeTool: EnemyType | null = null;

  public onToolSelected: (type: EnemyType | null) => void = () => {};

  constructor(scene: Phaser.Scene, availableTypes: EnemyType[]) {
    this.scene = scene;
    this.createPalette(availableTypes);
  }

  private createPalette(availableTypes: EnemyType[]) {
    availableTypes.forEach((type, i) => {
      const y = PALETTE_Y + i * (ITEM_HEIGHT + ITEM_SPACING);
      const text = this.scene.add.text(PALETTE_X, y, type, {
        color: '#aaaaaa',
        fontSize: '20px',
        backgroundColor: '#333333',
        padding: { left: 5, right: 5, top: 2, bottom: 2 },
      });

      text.setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.setActiveTool(type);
      });

      this.items.push({ type, text });
    });
  }

  private setActiveTool(type: EnemyType) {
    if (this.activeTool === type) {
      // Deselect if clicking the same tool again
      this.activeTool = null;
    } else {
      this.activeTool = type;
    }

    this.updateHighlights();
    this.onToolSelected(this.activeTool);
  }

  private updateHighlights() {
    this.items.forEach(item => {
      if (item.type === this.activeTool) {
        item.text.setColor('#ffffff');
        item.text.setBackgroundColor('#5555ff');
      } else {
        item.text.setColor('#aaaaaa');
        item.text.setBackgroundColor('#333333');
      }
    });
  }

  public getActiveTool(): EnemyType | null {
    return this.activeTool;
  }
}
