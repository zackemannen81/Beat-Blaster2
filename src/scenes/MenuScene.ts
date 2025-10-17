import Phaser from 'phaser'
import Starfield from '@systems/Starfield'
import { loadOptions, detectGameplayModeOverride, resolveGameplayMode } from '@systems/Options';
import { listSavedPatterns } from '../editor/patternStore';
import { profileService } from '@systems/ProfileService'
import { eventBus } from '../core/EventBus'

type MenuItem =
  | { type: 'resume' }
  | { type: 'track'; track: any }
  | { type: 'options' }
  | { type: 'leaderboard' }
  | { type: 'profile' };

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
  private profileNameText?: Phaser.GameObjects.Text;
  private profileSaveStatusText?: Phaser.GameObjects.Text;
  private profileSwitchLeft?: Phaser.GameObjects.Text;
  private profileSwitchRight?: Phaser.GameObjects.Text;

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

    const activeProfile = profileService.getActiveProfile()

    this.hint = this.add.text(width / 2, height * 0.9, 'SPACE: Play   ↑/↓: Select', {
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

    if (activeProfile) {
      const profileY = height * 0.15
      this.profileSwitchLeft = this.add.text(width / 2 - 170, profileY, '〈', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '22px',
        color: '#5ea8c9'
      }).setOrigin(0.5)
      this.profileSwitchRight = this.add.text(width / 2 + 170, profileY, '〉', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '22px',
        color: '#5ea8c9'
      }).setOrigin(0.5)

      this.profileNameText = this.add.text(width / 2, profileY, '', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '18px',
        color: '#a0e9ff'
      }).setOrigin(0.5)

      this.profileSaveStatusText = this.add.text(width / 2, profileY + 26, '', {
        fontFamily: 'UiFont, sans-serif',
        fontSize: '12px',
        color: '#7ddff2'
      }).setOrigin(0.5).setAlpha(0.6)

      this.setupProfileSwitchInteractions()
      this.updateProfileHeader()
    }

    const buttonY = height * 0.95;

    // Leaderboard Button
    const leaderboardButton = this.add.text(width * 0.3, buttonY, 'Leaderboard', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    leaderboardButton.on('pointerdown', () => {
      this.sound.play('ui_select', { volume: 0.5 });
      this.scene.start('LeaderboardScene');
    });

    // Profile Button
    const profileButton = this.add.text(width * 0.5, buttonY, 'Profile', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    profileButton.on('pointerdown', () => {
      this.sound.play('ui_select', { volume: 0.5 });
      this.scene.start('ProfileScene');
    });

    // Options Button
    const optionsButton = this.add.text(width * 0.7, buttonY, 'Options', {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    optionsButton.on('pointerdown', () => {
      this.handleOptions();
    });

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
      const item = this.menuItems[this.index]
      if (!item) return



      if (this.hasStarted) return
      this.hasStarted = true
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        const fadingItem = this.menuItems[this.index]
        if (!fadingItem) {
          this.hasStarted = false;
          return;
        }
        if (fadingItem.type === 'resume') {
          this.sound.play('ui_select', { volume: 0.5 });
          this.scene.resume('GameScene');
          this.scene.stop();
          return;
        }
        if (fadingItem.type !== 'track') {
          this.hasStarted = false
          this.cameras.main.fadeIn(300, 0, 0, 0)
          return
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
        if (fadingItem.track.isCustom) {
          this.registry.set('selectedCustomPattern', fadingItem.track.name);
          this.registry.set('selectedTrackId', this.tracks[0].id); // Fallback to a default track for music
        } else {
          this.registry.set('selectedCustomPattern', null);
          this.registry.set('selectedTrackId', fadingItem.track?.id || null);
        }

        this.sound.play('ui_select', { volume: 0.5 });
        this.scene.start('GameScene');
      });
    };
    this.handleOptions = () => {
      this.scene.launch('OptionsScene', { from: 'MenuScene' })
      this.scene.bringToTop('OptionsScene')
      this.scene.pause()
    }

    k.on('keydown-UP', this.handleUp, this)
    k.on('keydown-DOWN', this.handleDown, this)
    k.on('keydown-SPACE', this.handlePlay, this)


    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      k.off('keydown-UP', this.handleUp, this)
      k.off('keydown-DOWN', this.handleDown, this)
      k.off('keydown-SPACE', this.handlePlay, this)

      this.events.off(Phaser.Scenes.Events.RESUME, this.refreshModeLabel, this)
    })

    this.events.on(Phaser.Scenes.Events.RESUME, this.refreshModeLabel, this)

    const keys = this.input.keyboard!
    const handleBracketLeft = () => this.cycleProfile(-1)
    const handleBracketRight = () => this.cycleProfile(1)
    keys.on('keydown-LEFT_BRACKET', handleBracketLeft)
    keys.on('keydown-RIGHT_BRACKET', handleBracketRight)

    eventBus.bindToScene(this, 'profile:changed', () => {
      this.updateProfileHeader()
    })

    eventBus.bindToScene(this, 'profile:save:pending', () => {
      this.setProfileSaveStatus('Saving profile…')
    })

    eventBus.bindToScene(this, 'profile:save:completed', ({ savedAt }) => {
      const timestamp = new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      this.setProfileSaveStatus(`Saved at ${timestamp}`)
    })

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      keys.off('keydown-LEFT_BRACKET', handleBracketLeft)
      keys.off('keydown-RIGHT_BRACKET', handleBracketRight)
    })

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
      let text: string
      if (item.type === 'resume') {
        text = `${prefix} Resume Game`
      } else {
        text = `${prefix} ${item.track.name} — ${item.track.artist || ''}`
      }
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

  private setupProfileSwitchInteractions() {
    const entries: Array<{ target?: Phaser.GameObjects.Text; direction: number }> = [
      { target: this.profileSwitchLeft, direction: -1 },
      { target: this.profileSwitchRight, direction: 1 }
    ]
    entries.forEach(({ target, direction }) => {
      if (!target) return
      target.setInteractive({ useHandCursor: true })
      target.on('pointerdown', () => this.cycleProfile(direction))
      target.on('pointerover', () => target.setColor('#00e5ff'))
      target.on('pointerout', () => target.setColor('#5ea8c9'))
    })
    this.updateProfileSwitchVisibility()
  }

  private cycleProfile(direction: number) {
    const profiles = profileService.getAllProfiles()
    if (profiles.length <= 1) return
    const active = profileService.getActiveProfile()
    if (!active) return
    const index = profiles.findIndex((p) => p.id === active.id)
    if (index === -1) return
    const next = profiles[(index + direction + profiles.length) % profiles.length]
    if (!next || next.id === active.id) return
    profileService.setActiveProfile(next.id)
    this.sound.play('ui_move', { volume: 0.4 })
    this.updateProfileHeader()
  }

  private updateProfileHeader() {
    const activeProfile = profileService.getActiveProfile()
    if (!activeProfile || !this.profileNameText) return
    this.profileNameText.setText(`Active Profile: ${activeProfile.name}`)
    this.setProfileSaveStatus('')
    this.updateProfileSwitchVisibility()
  }

  private updateProfileSwitchVisibility() {
    const profiles = profileService.getAllProfiles()
    const disabled = profiles.length <= 1
    const color = disabled ? '#334452' : '#5ea8c9'
    if (this.profileSwitchLeft) {
      this.profileSwitchLeft.setColor(color)
      if (disabled) {
        this.profileSwitchLeft.disableInteractive()
      } else {
        this.profileSwitchLeft.setInteractive({ useHandCursor: true })
      }
    }
    if (this.profileSwitchRight) {
      this.profileSwitchRight.setColor(color)
      if (disabled) {
        this.profileSwitchRight.disableInteractive()
      } else {
        this.profileSwitchRight.setInteractive({ useHandCursor: true })
      }
    }
  }

  private setProfileSaveStatus(message: string) {
    if (!this.profileSaveStatusText) return
    const text = message || 'Autosave ready'
    this.profileSaveStatusText.setText(text)
    this.profileSaveStatusText.setAlpha(message ? 1 : 0.6)
  }
}
