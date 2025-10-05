import Phaser from 'phaser'
import Starfield from '../systems/Starfield'
import { loadOptions, detectGameplayModeOverride, resolveGameplayMode } from '../systems/Options';
import { listSavedPatterns } from '../editor/patternStore';

type MenuItem =
  | { type: 'resume' }
  | { type: 'track'; track: any };

export default class MenuScene extends Phaser.Scene {
  private hint!: Phaser.GameObjects.Text;
  private list!: Phaser.GameObjects.Group;
  private tracks: any[] = [];
  private index = 0;
  private starfield!: Starfield;
  private hasStarted = false;
  private handleUp!: () => void;
  private handleDown!: () => void;
  private handlePlay!: () => void;
  private handleOptions!: () => void;
  private menuItems: MenuItem[] = [];
  private pausedBanner?: Phaser.GameObjects.Text;
  private resumeAvailable = false;
  private modeLabel!: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
  }

  create(data: { resume?: boolean } = {}) {
    this.scene.bringToTop();
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.hasStarted = false;
    this.resumeAvailable = !!data.resume;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0a0a0f');

    // Background: procedural starfield
    this.starfield = new Starfield(this);
    this.starfield.create();

    const logo = this.add.image(width / 2, height * 0.3, 'menulogo');
    logo.setOrigin(0.5);
    logo.setScale(Math.min(width / 1920, height / 1080) * 0.5);

    this.hint = this.add.text(width / 2, height * 0.9, 'SPACE: Play   ↑/↓: Select   O: Options', {
      fontFamily: 'UiFont2, sans-serif',
      fontSize: '16px',
      color: '#a0e9ff'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.hint,
      alpha: 0.25,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.modeLabel = this.add.text(width / 2, height * 0.92, '', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '14px',
      color: '#7ddff2'
    }).setOrigin(0.5);
    this.refreshModeLabel();

    this.tracks = this.registry.get('tracks') || [];
    const initialId = this.registry.get('selectedTrackId');
    const trackIndex = Math.max(0, this.tracks.findIndex((t: any) => t.id === initialId));
    
    this.menuItems = [];
    if (this.resumeAvailable) this.menuItems.push({ type: 'resume' });
    for (const track of this.tracks) {
      this.menuItems.push({ type: 'track', track });
    }

    // Add custom patterns
    const customPatterns = listSavedPatterns();
    customPatterns.forEach(patternName => {
        this.menuItems.push({ 
            type: 'track', 
            track: { 
                id: `custom-${patternName}`,
                name: `${patternName}`,
                artist: 'Editor',
                isCustom: true 
            }
        });
    });

    const savedIndex = this.registry.get('menuIndex');
    if (savedIndex !== undefined) {
      this.index = savedIndex;
    } else {
      const trackIndex = Math.max(0, this.tracks.findIndex((t: any) => t.id === initialId));
      if (this.resumeAvailable) {
        this.index = Math.min(trackIndex + 1, this.menuItems.length - 1);
      } else {
        this.index = trackIndex;
      }
    }

    this.list = this.add.group();

    if (this.resumeAvailable) {
      this.pausedBanner = this.add.text(width / 2, height * 0.25, 'PAUSED', {
        fontFamily: 'HudFont, UiFont, sans-serif',
        fontSize: '36px',
        color: '#ff5db1'
      }).setOrigin(0.5);
    }
    this.renderList();

    const k = this.input.keyboard!;
    this.handleUp = () => {
      if (this.menuItems.length === 0) return;
      this.index = (this.index - 1 + this.menuItems.length) % this.menuItems.length;
      this.sound.play('ui_move', { volume: 0.5 });
      this.renderList();
    };
    this.handleDown = () => {
      if (this.menuItems.length === 0) return;
      this.index = (this.index + 1) % this.menuItems.length;
      this.sound.play('ui_move', { volume: 0.5 });
      this.renderList();
    };
    this.handlePlay = () => {
      if (this.hasStarted) return;
      this.hasStarted = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        const item = this.menuItems[this.index];
        if (!item) {
          this.hasStarted = false;
          return;
        }
        if (item.type === 'resume') {
          this.sound.play('ui_select', { volume: 0.5 });
          this.scene.resume('GameScene');
          this.scene.stop();
          return;
        }
        if (this.resumeAvailable) {
          const proceed = window.confirm('Warning selecting a new game will end your paused game. Continue?');
          if (!proceed) {
            this.hasStarted = false;
            this.cameras.main.fadeIn(500, 0, 0, 0);
            return;
          }
          this.scene.stop('GameScene');
        }

        // Handle custom vs normal tracks
        if (item.track.isCustom) {
          this.registry.set('selectedCustomPattern', item.track.name);
          this.registry.set('selectedTrackId', this.tracks[0].id); // Fallback to a default track for music
        } else {
          this.registry.set('selectedCustomPattern', null);
          this.registry.set('selectedTrackId', item.track?.id || null);
        }

        this.sound.play('ui_select', { volume: 0.5 });
        this.scene.start('GameScene');
      });
    };
  }

  update(_time: number, delta: number) {
    if (this.starfield) this.starfield.update(delta)
  }

  private renderList() {
    this.list.clear(true, true);
    if (this.menuItems.length === 0) {
      this.add.text(this.scale.width / 2, this.scale.height * 0.6, 'No tracks configured', {
        fontFamily: 'UiFont2, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      return;
    }
    this.menuItems.forEach((item, i) => {
      const prefix = i === this.index ? '▶' : '  ';
      const text = item.type === 'resume' ? `${prefix} Resume Game` : `${prefix} ${item.track.name} — ${item.track.artist || ''}`;
      const y = this.scale.height * 0.5 + i * 25;
      const menuItemText = this.add.text(this.scale.width / 2, y, text, {
        fontFamily: 'UiFont2, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      menuItemText.on('pointerover', () => {
        if (this.index !== i) {
          this.index = i;
          this.sound.play('ui_move', { volume: 0.5 });
          this.renderList();
        }
      });

      menuItemText.on('pointerdown', () => {
        this.handlePlay();
      });

      this.list.add(menuItemText);
    });
  }

    shutdown() {
      this.registry.set('menuIndex', this.index);
    }
  
    private refreshModeLabel = () => {    const opts = loadOptions()
    const override = detectGameplayModeOverride()
    const mode = override ? override.mode : resolveGameplayMode(opts.gameplayMode)
    const friendly = mode === 'vertical' ? 'Vertical Scroll' : 'Omni Scroll'
    const suffix = override ? ' (Override)' : ''
    this.modeLabel.setText(`Mode: ${friendly}${suffix}`)
  }
}
