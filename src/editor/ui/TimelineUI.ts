import Phaser from 'phaser';

const BEAT_BOX_SIZE = 40;
const BEAT_BOX_SPACING = 10;
const BEAT_BOX_Y = 500;

export class TimelineUI {
  private scene: Phaser.Scene;
  private beatBoxes: Phaser.GameObjects.Rectangle[] = [];
  private activeBeatIndex = 0;

  constructor(scene: Phaser.Scene, totalBeats: number) {
    this.scene = scene;
    this.createBeatBoxes(totalBeats);
  }

  private createBeatBoxes(totalBeats: number) {
    const totalWidth = totalBeats * BEAT_BOX_SIZE + (totalBeats - 1) * BEAT_BOX_SPACING;
    let startX = (this.scene.scale.width - totalWidth) / 2;

    for (let i = 0; i < totalBeats; i++) {
      const box = this.scene.add.rectangle(
        startX + i * (BEAT_BOX_SIZE + BEAT_BOX_SPACING),
        BEAT_BOX_Y,
        BEAT_BOX_SIZE,
        BEAT_BOX_SIZE,
        0x444444
      );
      box.setStrokeStyle(2, 0x666666);
      this.beatBoxes.push(box);
    }
    this.setActiveBeat(0);
  }

  public setActiveBeat(index: number) {
    if (index < 0 || index >= this.beatBoxes.length) return;

    // Reset old active box
    this.beatBoxes[this.activeBeatIndex].setFillStyle(0x444444);
    this.beatBoxes[this.activeBeatIndex].setStrokeStyle(2, 0x666666);

    // Set new active box
    this.activeBeatIndex = index;
    this.beatBoxes[this.activeBeatIndex].setFillStyle(0x7777ff);
    this.beatBoxes[this.activeBeatIndex].setStrokeStyle(2, 0xaaaaff);
  }
}
