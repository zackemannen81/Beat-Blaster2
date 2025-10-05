import Phaser from 'phaser'
import AudioAnalyzer from '../systems/AudioAnalyzer'
import Conductor from '../systems/Conductor'
import Spawner, { PatternData } from '../systems/Spawner'
import Scoring, { AccuracyLevel } from '../systems/Scoring'
import HUD from '../ui/HUD'
import Effects from '../systems/Effects'
import Powerups, { PowerupType, PowerupEvent } from '../systems/Powerups'
import Starfield from '../systems/Starfield'
import BackgroundScroller from '../systems/BackgroundScroller'
import { loadOptions, resolveGameplayMode, GameplayMode } from '../systems/Options'
import PlayerSkin from '../systems/PlayerSkin'
import NeonGrid from '../systems/NeonGrid'
import CubeSkin from '../systems/CubeSkin'
import LaneManager, { LaneSnapPoint } from '../systems/LaneManager'
import LanePatternController, { LaneEffect } from '../systems/LanePatternController'
import BeatWindow, { BeatJudgement } from '../systems/BeatWindow'
import { getDifficultyProfile, DifficultyProfile, DifficultyProfileId, StageTuning } from '../config/difficultyProfiles'
import WaveDirector from '../systems/WaveDirector'
import EnemyLifecycle from '../systems/EnemyLifecycle'
import type { WaveDescriptor } from '../types/waves'
import { getWavePlaylist } from '../systems/WaveLibrary'
import Announcer, { AnnouncerVoiceId } from '../systems/Announcer'

import { loadPatternData } from '../editor/patternStore';
import { CustomPattern } from '../systems/patterns/CustomPattern';


 type Enemy = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
type PowerupSprite = Phaser.Physics.Arcade.Sprite;
type MissileSprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
type BulletMetadata = {
  damage: number
  judgement: BeatJudgement
  accuracy: AccuracyLevel
  isPerfect: boolean
}

export default class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private analyzer!: AudioAnalyzer
  private conductor!: Conductor
  private spawner!: Spawner
  private hud!: HUD
  private scoring = new Scoring()
  private beatWindow = new BeatWindow()
  private music?: Phaser.Sound.BaseSound
  private bullets!: Phaser.Physics.Arcade.Group
  private missiles!: Phaser.Physics.Arcade.Group
  private isShooting = false
  private lastShotAt = 0
  private bulletSpeed = 900
  private bulletTtlMs = 1000
  private fireCooldownMs = 50
  private homingMissileSpeed = 540
  private lastMissileSpawnAt = 0
  private effects!: Effects
  private powerups!: Powerups
  private playerHp = 3
  private playerMaxHp = 3
  private iframesUntil = 0
  private bombCharge = 0 // 0..100
  private bombReadyAnnounced = false
  private metronome = false
  private announcer!: Announcer
  private lastDashToggle = 0
  private lastBeatAt = 0
  private beatCount = 0
  private nextQuantizedShotAt = 0
  private beatPeriodMs = 2000 // fallback
  private crosshair!: Phaser.GameObjects.Graphics
  private opts = loadOptions()
  private crosshairMode: 'pointer' | 'fixed' | 'pad-relative' = this.opts.crosshairMode
  private verticalSafetyBand = this.opts.verticalSafetyBand
  private padAimVector = new Phaser.Math.Vector2(0, -1)
  private starfield!: Starfield
  private difficultyProfile: DifficultyProfile = getDifficultyProfile('normal')
  private currentStageConfig: StageTuning = this.difficultyProfile.stageTuning[0]
  private difficultyLabel = this.difficultyProfile.label
  private enemyCap = this.currentStageConfig?.enemyCap ?? 20
  private comboCount = 0
  private comboTimeoutMs = 2000
  private lastHitAt = 0
  private gameplayMode: GameplayMode = resolveGameplayMode(this.opts.gameplayMode)
  private scrollBase = 128
  private backgroundScroller!: BackgroundScroller
  private movementMinY = 0
  private movementMaxY = 0
  private activeGamepad?: Phaser.Input.Gamepad.Gamepad
  private gamepadDeadzone = this.opts.gamepadDeadzone
  private gamepadSensitivity = this.opts.gamepadSensitivity
  private gamepadFireActive = false
  private touchMovePointerId?: number
  private navTarget: Phaser.Math.Vector2 | null = null
  private touchFirePointers = new Set<number>()
  private touchTapTimes: number[] = []
  private beatIndicator!: Phaser.GameObjects.Graphics;
  private beatStatusSearching?: Phaser.GameObjects.Text
  private beatStatusDetected?: Phaser.GameObjects.Text
  private beatStatusDetectedShown = false
  private beatStatusResizeHandler?: (size: Phaser.Structs.Size) => void
  private lastHitEnemyId: string | null = null
  private neon!: NeonGrid
  private powerupDurations: Record<PowerupType, number> = {
    shield: 12,
    rapid: 15,
    split: 22,
    slowmo: 8,
    chain_lightning: 15,
    homing_missiles: 18,
    time_stop: 6
  }
  private activePowerups = new Set<PowerupSprite>()
  private enemyLifecycle!: EnemyLifecycle
  private waveDescriptorIndex = new Map<string, WaveDescriptor>()
  private nextWaveInfo: { descriptorId: string; spawnAt: number } | null = null
  private onWaveScheduledHandler = (payload: any) => this.handleWaveScheduled(payload, false)
  private onWaveFallbackHandler = (payload: any) => this.handleWaveScheduled(payload, true)
  private isPaused = false
  private barsElapsed = 0
  private bossSpawned = false
  private enemyHpMultiplier = this.difficultyProfile.baseEnemyHpMultiplier
  private bossHpMultiplier = this.difficultyProfile.baseBossHpMultiplier
  private missPenalty = this.difficultyProfile.missPenalty
  private bossMissPenalty = this.difficultyProfile.bossMissPenalty
  private verticalLaneCount = this.difficultyProfile.laneCount
  private currentStage = 1
  private reducedMotion = false
  private activeBoss: Enemy | null = null
  private waveDirector!: WaveDirector
  private lanes?: LaneManager
  private lanePattern?: LanePatternController
  private onLanePatternPulse = () => this.pulseEnemies(1.3)
  private targetLaneIndex = 0
  private laneSnapFromX = 0
  private laneSnapTargetX = 0
  private laneSnapElapsed = 0
  private laneSnapDurationMs = 160
  private laneSnapActive = false
  private currentSnapPoint: LaneSnapPoint | null = null
  private laneDeadzonePx = 6
  private touchLaneIndexBaseline = 0
  private touchLaneAccum = 0
  private releaseFireMode = false
  private releaseFireArmed = false
  private onLaneSnapshot = (snapshot: ReturnType<LaneManager['getSnapshot']>) => {
    this.hud?.setLaneCount(snapshot.count)
    this.neon?.setLaneSnapshot(snapshot)
    this.registry.set('laneSnapshot', snapshot)
  }
  private horizontalInputActive = false
  private unlockMouseAim = false
  private mouseNavigation = false
  private timeStopActive = false
  private timeStopResumeAt = 0
  private handleBulletWorldBounds = (body: Phaser.Physics.Arcade.Body) => {
    const bullet = body.gameObject as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined
    if (!bullet) return
    if (!this.bullets.contains(bullet)) return
    this.disableBullet(bullet)
  }
  private handleMissileWorldBounds = (body: Phaser.Physics.Arcade.Body) => {
    const missile = body.gameObject as MissileSprite | undefined
    if (!missile) return
    if (!this.missiles.contains(missile)) return
    this.disableMissile(missile)
  }

  private cleanupEnemy(enemy: Enemy, doDeathFx = true) {
    const enemyId = (enemy.getData('eid') as string) ?? null
    if (enemyId) this.waveDirector?.notifyEnemyDestroyed(enemyId)
    this.enemyLifecycle?.notifyRemoved(enemy)

    const skin = enemy.getData('skin') as any
    if (doDeathFx) skin?.onDeath?.()
    skin?.destroy?.()

    const hb = enemy.getData('healthBar') as Phaser.GameObjects.Graphics
    hb?.destroy()

    const hopTween = enemy.getData('laneHopTween') as Phaser.Tweens.Tween | null
    hopTween?.remove()
    enemy.setData('laneHopTween', null)

    const floodRect = enemy.getData('flooderRect') as Phaser.GameObjects.Rectangle | undefined
    floodRect?.destroy()
    enemy.setData('flooderRect', null)
    enemy.setData('timeStopStored', false)
    enemy.setData('timeStopPausedTween', false)
    enemy.setData('timeStopVelX', undefined)
    enemy.setData('timeStopVelY', undefined)

    enemy.disableBody(true, true)
  }
  //private keys:Phaser.Types.Input.Keyboard;
  constructor() {
    super('GameScene')
  }

  create() {
    this.opts = loadOptions()
    this.crosshairMode = this.opts.crosshairMode
    this.verticalSafetyBand = !!this.opts.verticalSafetyBand
    this.gameplayMode = resolveGameplayMode(this.opts.gameplayMode)
    this.unlockMouseAim = !!this.opts.unlockMouseAim
    this.mouseNavigation = !!this.opts.mouseNavigation
    this.releaseFireMode = false
    this.gamepadDeadzone = this.opts.gamepadDeadzone
    this.gamepadSensitivity = this.opts.gamepadSensitivity

    const preferredVoice: AnnouncerVoiceId = this.cache.audio.exists('announcer_cyborg_new_game') ? 'cyborg' : 'bee'
    this.announcer = new Announcer(this, () => this.opts.sfxVolume, {
      voice: preferredVoice
    })

    this.neon = new NeonGrid(this)
    this.neon.create()
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#0a0a0f')

    this.reducedMotion = !!this.opts.reducedMotion
    this.registry.set('options', this.opts)
    this.registry.set('reducedMotion', this.reducedMotion)

    this.backgroundScroller = new BackgroundScroller(this)
    this.backgroundScroller.create()

    // Starfield background (procedural)
    this.starfield = new Starfield(this)
    this.starfield.create()

    // Player sprite from atlas
/*
    this.player = this.physics.add.sprite(width / 2, height / 2, 'gameplay', 'player_idle')
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(true)
    this.player.setRotation(Math.PI/2) // Rotate 90 degrees to face right
*/
// Player sprite (behåll som fysik-host)
    this.player = this.physics.add.sprite(width/2, height/2, 'gameplay', 'player_idle')
    this.player.setCollideWorldBounds(true)

  // vi ritar spelaren via PlayerSkin → göm atlas-grafiken
    this.player.setVisible(false)

// sätt en rimlig hitbox (matcha din PlayerSkin-storlek, t.ex. triangel ~18px)
    const r = 14
    this.player.body.setCircle(r, -r + this.player.width/2, -r + this.player.height/2)

// rotationen behövs fortfarande – PlayerSkin följer host.rotation
    this.player.setRotation(Math.PI/2)

// koppla på skinet
    const pskin = new PlayerSkin(this, this.player)
    this.player.setData('skin', pskin)

    this.beatIndicator = this.add.graphics();
    this.beatIndicator.fillStyle(0xff0000, 1);
    this.beatIndicator.fillCircle(50, 50, 20); // Placera den där det passar i ditt UI

    this.setupBeatStatusOverlay()

    if (this.gameplayMode === 'vertical') {
      this.setupVerticalLaneSystem()
    }

  /*
    // aktivera WASD
    this.keys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
    }) as {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      space: Phaser.Input.Keyboard.Key;
      shift: Phaser.Input.Keyboard.Key;
    };
*/
    this.cursors = this.input.keyboard!.createCursorKeys()
    const wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any
    this.registry.set('wasd', wasd)

    this.bossSpawned = false
    this.barsElapsed = 0
    this.activeBoss = null

    this.gameplayMode = resolveGameplayMode(this.opts.gameplayMode)
    this.registry.set('gameplayMode', this.gameplayMode)
    this.reducedMotion = !!this.opts.reducedMotion
    this.updateMovementBounds()
    this.scale.on(Phaser.Scale.Events.RESIZE, this.updateMovementBounds, this)
    this.input.addPointer(2)

    // Read balance
    const balance = this.registry.get('balance') as any
    if (balance?.bullets) {
      this.bulletSpeed = balance.bullets.speed ?? this.bulletSpeed
      this.fireCooldownMs = balance.bullets.cooldownMs ?? this.fireCooldownMs
      this.bulletTtlMs = balance.bullets.ttlMs ?? this.bulletTtlMs
    }
    if (balance?.player) {
      this.playerMaxHp = balance.player.hp ?? this.playerMaxHp
      this.playerHp = this.playerMaxHp
    }
    const durationConfig = balance?.powerups?.durations as Partial<Record<PowerupType, number>> | undefined
    if (durationConfig) {
      (Object.keys(this.powerupDurations) as PowerupType[]).forEach((type) => {
        const configured = durationConfig[type]
        if (typeof configured === 'number' && configured > 0) {
          this.powerupDurations[type] = configured
        }
      })
    }

    // Bullets & missiles
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      defaultKey: 'bullet_plasma_0',
      maxSize: 200
    })
    this.missiles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      defaultKey: 'bullet_plasma_0',
      maxSize: 60
    })
    this.physics.world.on('worldbounds', this.handleBulletWorldBounds, this)
    this.physics.world.on('worldbounds', this.handleMissileWorldBounds, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.physics.world) {
        this.physics.world.off('worldbounds', this.handleBulletWorldBounds, this)
        this.physics.world.off('worldbounds', this.handleMissileWorldBounds, this)
      }
      this.music?.stop()
      this.music?.destroy()
      this.music = undefined
      this.analyzer?.removeAllListeners?.()
      this.backgroundScroller?.destroy()
      this.starfield?.destroy()
      this.neon?.destroy()
      this.spawner?.setLaneManager(null)
      this.lanes?.off(LaneManager.EVT_CHANGED, this.onLaneSnapshot, this)
      this.lanes?.destroy()
      this.lanes = undefined
      this.scale.off(Phaser.Scale.Events.RESIZE, this.updateMovementBounds, this)
      this.input.gamepad?.off('connected', this.onGamepadConnected, this)
      this.input.gamepad?.off('disconnected', this.onGamepadDisconnected, this)
      this.conductor?.off('bar:start', this.handleBarStart)
    })
    this.input.mouse?.disableContextMenu()

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const pointerType = (pointer as any)?.pointerType ?? 'mouse'
      const isMouse = pointerType === 'mouse'

      if (isMouse) {
        if (pointer.button === 2) {
          if (this.bombCharge >= 100) this.triggerBomb()
          return
        }
        if (pointer.button !== 0) return
      }

      if (this.gameplayMode === 'vertical' && !isMouse) {
        const half = this.scale.width * 0.5
        if (this.touchMovePointerId === undefined || pointer.x < half) {
          this.touchMovePointerId = pointer.id
        }
        this.updateNavTargetFromPointer(pointer)
        if (pointer.x >= half) {
          this.touchFirePointers.add(pointer.id)
          this.handleFireInputDown()
          this.registerTouchTap(this.time.now)
        }
        return
      }

      if (!isMouse) {
        this.touchMovePointerId = pointer.id
        this.updateNavTargetFromPointer(pointer)
        this.registerTouchTap(this.time.now)
      }

      this.handleFireInputDown()
    })

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const pointerType = (pointer as any)?.pointerType ?? 'mouse'
      const isMouse = pointerType === 'mouse'
      if (isMouse && pointer.button === 2) return

      if (this.gameplayMode === 'vertical' && !isMouse) {
        if (pointer.id === this.touchMovePointerId) {
          this.touchMovePointerId = undefined
          this.navTarget = null
        }
        if (this.touchFirePointers.delete(pointer.id) && this.touchFirePointers.size === 0) {
          this.handleFireInputUp()
        }
        return
      }

      if (!isMouse && pointer.id === this.touchMovePointerId) {
        this.touchMovePointerId = undefined
        this.navTarget = null
      }

      this.handleFireInputUp()
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const pointerType = (pointer as any)?.pointerType ?? 'mouse'
      const isMouse = pointerType === 'mouse'
      if (!isMouse && pointer.id === this.touchMovePointerId) {
        const target = this.updateNavTargetFromPointer(pointer)
        if (this.gameplayMode === 'vertical' && this.lanes) {
          const snap = this.lanes.nearestSnap(target.x)
          if (snap) {
            this.currentSnapPoint = snap
            if (snap.type === 'lane') {
              this.targetLaneIndex = snap.laneIndices[0]
            }
          }
        }
      }
    })

    if (this.input.gamepad) {
      this.input.gamepad.on('connected', this.onGamepadConnected, this)
      this.input.gamepad.on('disconnected', this.onGamepadDisconnected, this)
      const pad = this.input.gamepad.gamepads.find(p => p && p.connected)
      if (pad) this.activeGamepad = pad
    }

    // Load selected track on demand
    const tracks = this.registry.get('tracks') as any[]
    const selId = this.registry.get('selectedTrackId') as string | null
    const track = tracks?.find((t) => t.id === selId)

    this.difficultyProfile = getDifficultyProfile(track?.difficultyProfileId)
    this.currentStage = this.difficultyProfile.stageTuning[0]?.stage ?? 1
    this.currentStageConfig = this.getStageConfig(this.currentStage)
    this.difficultyLabel = this.difficultyProfile.label
    this.enemyHpMultiplier = this.difficultyProfile.baseEnemyHpMultiplier * (this.currentStageConfig?.enemyHpMultiplier ?? 1)
    this.bossHpMultiplier = this.difficultyProfile.baseBossHpMultiplier * (this.currentStageConfig?.bossHpMultiplier ?? 1)
    this.missPenalty = this.difficultyProfile.missPenalty
    this.bossMissPenalty = this.difficultyProfile.bossMissPenalty
    this.verticalLaneCount = this.difficultyProfile.laneCount
    this.enemyCap = this.currentStageConfig?.enemyCap ?? this.enemyCap
    
    // Initialize analyzer first
    this.analyzer = new AudioAnalyzer(this)
    this.conductor = new Conductor(this)
    this.conductor.on('bar:start', this.handleBarStart)
    
    // Set up beat listeners
    const handleBeat = (band: 'low' | 'mid' | 'high', pulse = false) => {
      this.events.emit('beat', band)
      this.events.emit(`beat:${band}`)
      this.conductor.onBeat()
      this.lastBeatAt = this.time.now
      if (band === 'low') {
        this.beatCount += 1
        if (this.gameplayMode === 'vertical') this.triggerLaneHopperHop()
      }
      const usingPattern = this.gameplayMode === 'vertical' && !!this.lanePattern
      if (usingPattern && !this.timeStopActive) {
        this.lanePattern?.handleBeat(band)
      }
      if (!this.timeStopActive) {
        this.updateExplodersOnBeat(band)
        this.updateTeleportersOnBeat(band)
        this.updateWeaversOnBeat(band)
        this.updateFormationDancersOnBeat(band)
        this.updateMirrorersOnBeat(band)
      }
      this.neon?.onBeat(band)
      this.hud?.flashBeat(band)
      if (!this.beatStatusDetectedShown) {
        this.onBeatDetection()
      }
      if (!usingPattern && !this.timeStopActive) {
        this.waveDirector.enqueueBeat(band)
      }
      if (pulse && !this.timeStopActive) this.pulseEnemies()
    }

    this.analyzer.on('beat:low', () => handleBeat('low', true))
    this.analyzer.on('beat:mid', () => handleBeat('mid'))
    this.analyzer.on('beat:high', () => handleBeat('high'))

    this.sound.removeByKey('music')
    this.cache.audio.remove('music')

    if (track) {
      // First, ensure the audio context is running
      const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
      if (soundManager.context.state === 'suspended') {
        soundManager.context.resume().catch(console.error);
      }

      this.load.audio('music', [track.fileOgg || '', track.fileMp3 || ''].filter(Boolean));
      this.load.once(Phaser.Loader.Events.COMPLETE, () => {
        try {
          // Create and configure the music
          this.music = this.sound.add('music', { 
            loop: false, 
            volume: this.opts.musicVolume
          });
          
          // Start playing the music
          this.music.on('play', () => {
            console.log('Music started playing');
            
            // Attach analyzer after a short delay
            setTimeout(() => {
              if (this.music) {
                if (this.analyzer.attachToAudio(this.music)) {
                  console.log('Analyzer attached successfully');
                } else {
                  console.warn('Failed to attach analyzer');
                }
              }
            }, 500);
          });
          
          this.music.on('complete', this.handleStageComplete, this);

          // Start playback
          this.music.play();
          
        } catch (error) {
          console.error('Error initializing audio:', error);
        }
      });
      
      this.load.start();
    } else {
      console.warn('No track selected or track not found');
    }

    // Read metronome from options
    this.metronome = this.opts.metronome
    this.analyzer.on('beat:low', () => {
      if (this.metronome) this.sound.play('metronome', { volume: 0.2 })
      this.effects.beatPulse()
    })

    // Spawner & wave director
    this.spawner = new Spawner(this)
    if (this.gameplayMode === 'vertical') {
      this.spawner.setLaneManager(this.lanes ?? null)
    } else {
      this.spawner.setLaneManager(null)
    }
    const playlistId = (this.difficultyProfile.wavePlaylistId ?? this.difficultyProfile.id) as DifficultyProfileId
    const playlist = getWavePlaylist(playlistId)
    this.waveDescriptorIndex.clear()
    playlist.waves.forEach((wave) => this.waveDescriptorIndex.set(wave.id, wave))
    this.waveDirector = new WaveDirector(this, this.spawner, {
      profileId: playlistId,
      playlist,
      anchorProvider: () => ({ x: this.scale.width / 2, y: -140 }),
      stageProvider: () => this.currentStage,
      defaultDelayMs: this.difficultyProfile.waveDelayMs,
      fallbackCooldownMs: this.difficultyProfile.fallbackCooldownMs,
      waveRepeatCooldownMs: this.difficultyProfile.waveRepeatCooldownMs,
      maxQueuedWaves: this.currentStageConfig?.maxQueuedWaves ?? 3,
      heavyCooldownMs: this.difficultyProfile.heavyControls.cooldownMs,
      heavyWindowMs: this.difficultyProfile.heavyControls.windowMs,
      maxHeavyInWindow: this.difficultyProfile.heavyControls.maxInWindow,
      maxSimultaneousHeavy: this.currentStageConfig?.maxSimultaneousHeavy ?? this.difficultyProfile.heavyControls.maxSimultaneous,
      categoryCooldowns: this.difficultyProfile.categoryCooldowns,
      logEvents: (import.meta as any)?.env?.DEV ?? false,
      onWaveSpawn: (_instanceId, enemies) => this.enemyLifecycle?.registerSpawn(enemies),
      enableFallback: this.opts.allowFallbackWaves
    })
    this.waveDirector.setFallbackEnabled(this.opts.allowFallbackWaves)
    this.enemyLifecycle = new EnemyLifecycle({
      scene: this,
      spawner: this.spawner,
      waveDirector: this.waveDirector,
      boundsProvider: () => ({ width: this.scale.width, height: this.scale.height, gameplayMode: this.gameplayMode }),
      onExpire: (enemy, cause) => {
        if (!enemy.active) return
        if (cause === 'miss' || cause === 'timeout') {
          this.handleEnemyMiss(enemy)
        } else {
          this.cleanupEnemy(enemy, false)
        }
      }
    })
    if (this.gameplayMode === 'vertical') {
      this.lanePattern = new LanePatternController({
        scene: this,
        difficulty: this.difficultyProfile,
        stage: this.currentStageConfig,
        waveDirector: this.waveDirector,
        getLaneManager: () => this.lanes,
        requestLaneCount: (count, effect) => this.applyLanePatternCount(count, effect),
        registerDescriptor: (descriptor) => this.waveDescriptorIndex.set(descriptor.id, descriptor)
      })

      const customPatternName = this.registry.get('selectedCustomPattern');
      if (customPatternName) {
        const patternData = loadPatternData(customPatternName);
        if (patternData) {
            console.log(`Loading custom pattern: ${customPatternName}`);
            const customPattern = new CustomPattern(this, this.difficultyProfile, this.currentStageConfig, customPatternName, patternData);
            this.lanePattern.loadPattern(customPattern, true);
        }
      }

    } else {
      this.lanePattern = undefined
    }
    this.events.on('wave:scheduled', this.onWaveScheduledHandler, this)
    this.events.on('wave:fallback', this.onWaveFallbackHandler, this)
    this.events.on('wave:spawned', this.handleWaveSpawned, this)
    this.events.on('wave:telegraph', this.handleWaveTelegraph, this)
    this.events.on('lanes:pulse', this.onLanePatternPulse, this)
    this.events.on('patternCycleCompleted', this.handleWaypoint, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off('wave:scheduled', this.onWaveScheduledHandler, this)
      this.events.off('wave:fallback', this.onWaveFallbackHandler, this)
      this.events.off('wave:spawned', this.handleWaveSpawned, this)
      this.events.off('wave:telegraph', this.handleWaveTelegraph, this)
      this.events.off('lanes:pulse', this.onLanePatternPulse, this)
      if (this.beatStatusResizeHandler) {
        this.scale.off(Phaser.Scale.Events.RESIZE, this.beatStatusResizeHandler, this)
        this.beatStatusResizeHandler = undefined
      }
      this.beatStatusSearching?.destroy()
      this.beatStatusDetected?.destroy()
      this.beatStatusSearching = undefined
      this.beatStatusDetected = undefined
      this.beatStatusDetectedShown = false
      this.announcer.destroy()
    })
    this.updateDifficultyForStage()

    const bpm = (track && track.bpm) ? track.bpm : 120
    const interval = 60000 / bpm
    this.beatPeriodMs = interval
    this.scrollBase = this.computeScrollBase(bpm)
    this.beatWindow.setBpm(bpm)
    this.starfield.setBaseScroll(this.scrollBase)
    this.backgroundScroller.setBaseScroll(this.scrollBase)
    this.spawner.setScrollBase(this.scrollBase)
    this.registry.set('scrollBase', this.scrollBase)
    // HUD
    this.hud = new HUD(this)
    this.hud.create()
    this.hud.setupHearts(this.playerMaxHp)
    this.hud.setHp(this.playerHp)
    this.hud.setBombCharge(this.bombCharge / 100)
    this.hud.setReducedMotion(this.reducedMotion)
    this.hud.setDifficultyLabel(this.difficultyLabel)
    this.hud.setStage(this.currentStage)
    this.hud.setCrosshairMode(this.crosshairMode)
    this.hud.setBossHealth(null)
    this.hud.setCombo(0)
    this.hud.setBpm(bpm)
    this.hud.setLaneCount(this.lanes?.getCount() ?? this.resolveLaneCount())

    this.announcer.playEvent('new_game')

    // Effects
    this.effects = new Effects(this)
    this.effects.setReducedMotion(this.reducedMotion)
    this.powerups = new Powerups(this)
    this.hud.bindPowerups(this.powerups)
    this.powerups.on('powerup', this.handlePowerupApplied, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.powerups.off('powerup', this.handlePowerupApplied, this)
    })

    // Collisions: bullets -> enemies
    this.physics.add.overlap(this.bullets, this.spawner.getGroup(), (_b, _e) => {
      const bullet = _b as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      const enemy = _e as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      const etype = (enemy.getData('etype') as 'brute' | 'dasher' | 'swarm' | 'exploder' | 'weaver' | 'formation' | 'mirrorer') || 'swarm'

      const { damage, isPerfect } = this.readBulletMetadata(bullet)
      if (damage <= 0) {
        this.disableBullet(bullet)
        return
      }

      const hp = (enemy.getData('hp') as number) ?? 1
      const newHp = hp - damage
      enemy.setData('hp', newHp)
      const maxHp = (enemy.getData('maxHp') as number) ?? hp
      const isBoss = enemy.getData('isBoss') === true
      if (isBoss) {
        this.hud.setBossHealth(Math.max(newHp, 0) / Math.max(maxHp, 1), enemy.getData('etype') as string)
      }

      this.disableBullet(bullet)
      this.effects.enemyHitFx(enemy.x, enemy.y, { critical: isPerfect })
      this.effects.hitFlash(enemy)
      const skin = enemy.getData('skin') as any
      skin?.onHit?.()
      // Get a unique ID for the enemy (use the Phaser object's ID)
      const enemyId = enemy.getData('eid') as string
      // enemyId bör vara unikt per fiende
if (this.time.now - this.lastHitAt > this.comboTimeoutMs) {
  // För sent -> reset combo
  this.comboCount = 0
  this.lastHitEnemyId = null
}

// Är det en ny fiende inom tidsfönstret?
if (this.lastHitEnemyId !== enemyId) {
  if (this.comboCount > 0) {
    // Bara från andra fienden och uppåt
    this.comboCount++
    //console.log('New combo count:', this.comboCount)

    // Visa text när multiplikatorn ökar
    this.effects.showComboText(enemy.x, enemy.y, this.comboCount)
    this.hud.setCombo(this.comboCount)
    this.announcer.playCombo(this.comboCount)
  } else {
    // Första träffen bara armerar combon
    this.comboCount = 1
  }
  this.lastHitEnemyId = enemyId
}

// Reset timer
this.lastHitAt = this.time.now
  if (newHp <= 0) {
    this.sound.play('hit_enemy', { volume: this.opts.sfxVolume })
    this.scoring.addKill(etype)
    this.bumpBomb(10)
    this.maybeDropPickup(enemy.x, enemy.y)

    this.effects.enemyExplodeFx(enemy.x, enemy.y)
    this.cleanupEnemy(enemy, true)
    if (isBoss) {
      this.onBossDown()
    }
}
/*
      if (newHp <= 0) {
        const healthBar = enemy.getData('healthBar') as Phaser.GameObjects.Graphics
        if (healthBar) {
          healthBar.destroy()
        }
        enemy.disableBody(true, true)
        this.sound.play('hit_enemy', { volume: this.opts.sfxVolume })
        this.scoring.addKill(etype)
        this.bumpBomb(10)
        this.maybeDropPickup(enemy.x, enemy.y)
        const skin = enemy.getData('skin') as any
    skin?.onDeath?.()
    skin?.destroy?.()
      }
      */
    
    })

    // Collisions: player <- enemies
    this.physics.add.overlap(this.player, this.spawner.getGroup(), (_p, _e) => {
      const enemy = _e as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      const isBoss = enemy.getData('isBoss') === true
      const tookDamage = this.damagePlayer(1, {
        feedback: isBoss ? 'Boss Crash!' : undefined,
        missPenalty: isBoss ? this.bossMissPenalty : undefined,
        showFeedback: isBoss
      })
      if (!tookDamage) return

      if (!isBoss) {
        this.cleanupEnemy(enemy, false)
      } else {
        this.hud.setBossHealth(null)
        this.bossSpawned = false
        this.activeBoss = null
      }
    })

    // Back to menu
    this.input.keyboard!.on('keydown-ESC', () => {
      if (this.isPaused) return
      this.pauseGame()
    })

    // Bomb on SPACE when charged
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.bombCharge >= 100) this.triggerBomb()
    })

    this.input.keyboard!.on('keydown-E', () => {
      this.music?.stop();
      this.scene.start('EditorScene');
    });

    // Crosshair (drawn reticle)
    this.crosshair = this.add.graphics().setDepth(1000)
    this.input.setDefaultCursor('none')

    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.isPaused = false
      this.music?.resume()
      this.input.setDefaultCursor('none')
      this.opts = loadOptions()
      this.metronome = this.opts.metronome
      this.gameplayMode = resolveGameplayMode(this.opts.gameplayMode)
      this.registry.set('gameplayMode', this.gameplayMode)
      this.registry.set('options', this.opts)
      this.gamepadDeadzone = this.opts.gamepadDeadzone
      this.gamepadSensitivity = this.opts.gamepadSensitivity
      this.reducedMotion = !!this.opts.reducedMotion
      this.registry.set('reducedMotion', this.reducedMotion)
      this.crosshairMode = this.opts.crosshairMode
      this.verticalSafetyBand = !!this.opts.verticalSafetyBand
      this.unlockMouseAim = !!this.opts.unlockMouseAim
      this.mouseNavigation = !!this.opts.mouseNavigation
      this.releaseFireMode = false
      this.padAimVector.set(0, -1)
      this.announcer.setVoice('bee')
      this.announcer.setEnabled(true)
      this.effects.setReducedMotion(this.reducedMotion)
      this.hud.setReducedMotion(this.reducedMotion)
      this.hud.setCrosshairMode(this.crosshairMode)
      this.hud.setDifficultyLabel(this.difficultyLabel)
      this.hud.setStage(this.currentStage)
      this.waveDirector?.setFallbackEnabled(this.opts.allowFallbackWaves)
      if (this.activeBoss && this.activeBoss.active) {
        const maxHp = (this.activeBoss.getData('maxHp') as number) ?? 1
        const hp = (this.activeBoss.getData('hp') as number) ?? maxHp
        this.hud.setBossHealth(Math.max(hp, 0) / Math.max(maxHp, 1), this.activeBoss.getData('etype') as string)
      } else {
        this.hud.setBossHealth(null)
      }
      this.updateMovementBounds()
    })
  }

  update(time: number, delta: number): void {
    // Analyzer update
    if (this.analyzer) {
      this.analyzer.update()
      const estPeriod = this.analyzer.getEstimatedPeriodMs()
      if (estPeriod && isFinite(estPeriod) && estPeriod > 0) {
        const estBpm = 60000 / estPeriod
        const targetScroll = this.computeScrollBase(estBpm)
        this.scrollBase = Phaser.Math.Linear(this.scrollBase, targetScroll, 0.05)
        this.beatPeriodMs = Phaser.Math.Linear(this.beatPeriodMs, estPeriod, 0.1)
        this.beatWindow.setBpm(estBpm)
        this.hud?.setBpm(estBpm)
      }
    }
    this.registry.set('scrollBase', this.scrollBase)
    if (this.backgroundScroller) {
      this.backgroundScroller.setBaseScroll(this.scrollBase)
      this.backgroundScroller.update(delta)
    }
    if (this.starfield) {
      this.starfield.setBaseScroll(this.scrollBase)
      this.starfield.update(delta)
    }
    this.spawner?.setScrollBase(this.scrollBase)

    if (this.timeStopActive) {
      if (!this.powerups.hasTimeStop || this.time.now >= this.timeStopResumeAt) {
        this.deactivateTimeStop()
      }
    }

    if (!this.timeStopActive) {
      this.waveDirector?.update()
    }

      if (this.time.now - this.lastBeatAt < 100) { // Visa cirkeln i 100ms efter varje beat
        this.beatIndicator.setAlpha(1);
    } else {
        this.beatIndicator.setAlpha(0.3); // Gör den genomskinlig när inget beat
    }
    this.neon.update(delta)
    
    if (time - this.lastHitAt > this.comboTimeoutMs && this.comboCount > 0) {
      this.comboCount = 0
      this.hud.setCombo(0)
      this.lastHitEnemyId = null
    }
    

    // Shooting
    const cooldown = this.powerups.hasRapid ? this.fireCooldownMs * 0.8 : this.fireCooldownMs
    if (this.isShooting && time - this.lastShotAt >= cooldown) {
      this.fireBullet()
      this.lastShotAt = time
    }

    this.updateMissiles(delta)

    if (this.mouseNavigation) {
      const pointer = this.input.activePointer
      if (pointer) this.updateNavTargetFromPointer(pointer)
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const wasdKeys = this.registry.get('wasd') as any
    let moveX = 0
    let moveY = 0

    const allowDirectionalInputs = !this.mouseNavigation

    if (allowDirectionalInputs) {
      if (this.cursors.left?.isDown || wasdKeys?.A?.isDown) moveX -= 1
      if (this.cursors.right?.isDown || wasdKeys?.D?.isDown) moveX += 1
      if (this.cursors.up?.isDown || wasdKeys?.W?.isDown) moveY -= 1
      if (this.cursors.down?.isDown || wasdKeys?.S?.isDown) moveY += 1
    }

    if (this.activeGamepad && this.activeGamepad.connected) {
      const pad = this.activeGamepad
      const axisX = pad.axes.length > 0 ? pad.axes[0].getValue() : 0
      const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0
      const processedX = this.applyGamepadDeadzone(axisX) * this.gamepadSensitivity
      const processedY = this.applyGamepadDeadzone(axisY) * this.gamepadSensitivity
      if (allowDirectionalInputs) {
        moveX += processedX
        moveY += processedY
      }

      const aimAxisX = pad.axes.length > 2 ? pad.axes[2].getValue() : axisX
      const aimAxisY = pad.axes.length > 3 ? pad.axes[3].getValue() : axisY
      const aimX = this.applyGamepadDeadzone(aimAxisX)
      const aimY = this.applyGamepadDeadzone(aimAxisY)
      if (Math.abs(aimX) > 0 || Math.abs(aimY) > 0) {
        this.padAimVector.set(aimX, aimY)
        if (this.padAimVector.lengthSq() > 0) this.padAimVector.normalize()
      } else if (Math.abs(processedX) > 0 || Math.abs(processedY) > 0) {
        this.padAimVector.set(processedX, processedY)
        if (this.padAimVector.lengthSq() > 0) this.padAimVector.normalize()
      }

      const shootPressed = pad.buttons[0]?.pressed || pad.buttons[1]?.pressed
      if (shootPressed && !this.gamepadFireActive) {
        this.handleFireInputDown()
        this.gamepadFireActive = true
      } else if (!shootPressed && this.gamepadFireActive) {
        this.gamepadFireActive = false
        this.handleFireInputUp()
      }

      const bombPressed = pad.buttons[5]?.pressed || pad.buttons[7]?.pressed
      if (bombPressed && this.bombCharge >= 100) this.triggerBomb()
    } else if (this.gamepadFireActive) {
      this.gamepadFireActive = false
      this.handleFireInputUp()
    }

    const navTarget = this.navTarget
    const touchNavActive = this.touchMovePointerId !== undefined
    const navControlActive = navTarget && (this.mouseNavigation || touchNavActive)
    if (navControlActive) {
      let targetX = navTarget!.x
      let targetY = navTarget!.y

      if (this.gameplayMode === 'vertical' && this.lanes) {
        const snap = this.lanes.nearestSnap(navTarget!.x)
        if (snap) {
          this.currentSnapPoint = snap
          let laneIdx: number | undefined
          if (snap.type === 'lane') {
            laneIdx = snap.laneIndices[0]
          } else if (snap.laneIndices.length > 0) {
            laneIdx = snap.laneIndices.reduce((best, idx) => {
              const bestDelta = Math.abs(this.lanes!.centerX(best) - navTarget!.x)
              const candidateDelta = Math.abs(this.lanes!.centerX(idx) - navTarget!.x)
              return candidateDelta < bestDelta ? idx : best
            }, snap.laneIndices[0])
          }
          if (laneIdx !== undefined) {
            this.targetLaneIndex = laneIdx
            targetX = this.lanes.centerX(laneIdx)
          } else {
            targetX = snap.centerX
          }
        }
      }

      const dx = targetX - this.player.x
      const dy = targetY - this.player.y
      const navDeadzone = this.gameplayMode === 'vertical'
        ? this.laneDeadzonePx + 2
        : 4
      const distance = Math.hypot(dx, dy)
      if (distance > navDeadzone) {
        moveX = dx
        moveY = dy
      } else {
        moveX = 0
        moveY = 0
      }
    } else if (this.gameplayMode === 'vertical' && touchNavActive) {
      moveX = 0
    }

    this.horizontalInputActive = Math.abs(moveX) > 0.1

    const magnitude = Math.hypot(moveX, moveY)
    if (magnitude > 1) {
      moveX /= magnitude
      moveY /= magnitude
    }

    const stageHeight = this.scale.height
    const maxSpeed = this.gameplayMode === 'vertical'
      ? stageHeight / 1
      : this.scale.width / 1

    const targetVelocity = new Phaser.Math.Vector2(moveX, moveY)
    if (targetVelocity.lengthSq() > 1) targetVelocity.normalize()
    targetVelocity.scale(maxSpeed)

    const lerp = 0.2
    let newVelX = Phaser.Math.Linear(body.velocity.x, targetVelocity.x, lerp)
    let newVelY = Phaser.Math.Linear(body.velocity.y, targetVelocity.y, lerp)
    if (targetVelocity.lengthSq() < 0.01) {
      newVelX *= 0.82
      newVelY *= 0.82
    }
    body.setVelocity(newVelX, newVelY)

    if (this.gameplayMode === 'vertical' && this.verticalSafetyBand) {
      const halfHeight = body.height * 0.5
      const minY = this.movementMinY - halfHeight
      const maxY = this.movementMaxY - halfHeight
      body.y = Phaser.Math.Clamp(body.y, minY, maxY)
      this.player.y = body.y + halfHeight
    }

    if (this.gameplayMode === 'vertical') {
      this.updateLaneSnap(delta, body.velocity.y)
    }

/*
const speed = 250
const body = this.player.body as Phaser.Physics.Arcade.Body
body.setVelocity(0, 0)

// siktesvektor
const pointer = this.input.activePointer
const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
const forward = new Phaser.Math.Vector2(world.x - this.player.x, world.y - this.player.y).normalize()
const left = new Phaser.Math.Vector2(-forward.y, forward.x) // 90° åt vänster

// input (piltangenter + ev WASD)
const wasdKeys = this.registry.get('wasd') as any
let fwd = 0, strafe = 0
if (this.cursors.up?.isDown    || wasdKeys?.W?.isDown) fwd += 1
if (this.cursors.down?.isDown  || wasdKeys?.S?.isDown) fwd -= 1
if (this.cursors.left?.isDown  || wasdKeys?.A?.isDown) strafe -= 1
if (this.cursors.right?.isDown || wasdKeys?.D?.isDown) strafe += 1

// rörelseriktning = fram/bak + strafe
const move = forward.clone().scale(fwd).add(left.clone().scale(strafe))
if (move.lengthSq() > 1) move.normalize() // diagonaler = clamp

body.setVelocity(move.x * speed, move.y * speed)

// meddela skinet hur mycket vi “gasar” (0..1)
const thrustLevel = move.length() // 0..1
const pskin = this.player.getData('skin') as any
pskin?.setThrust?.(thrustLevel)
*/

    // HUD update (score placeholder)
    const shots = this.scoring.shots || 1
    const accPct = ((this.scoring.perfect + this.scoring.good) / shots) * 100
    this.hud.update(this.scoring.score, this.scoring.multiplier, accPct)

    const group = this.spawner.getGroup()
    const now = this.time.now
    if (this.gameplayMode === 'vertical') {
      this.updateVerticalEnemies(group, now)
    } else {
      const px = this.player.x
      const py = this.player.y
      const dashBoost = 2.2
      const dashPhase = Math.floor(now / 600)
      group.children.each((obj: Phaser.GameObjects.GameObject) => {
        const s = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
        const healthBar = s.getData('healthBar') as Phaser.GameObjects.Graphics
        if (!s.active) {
          healthBar?.destroy()
          return false
        }
        const etype = (s.getData('etype') as 'brute' | 'dasher' | 'swarm' | 'exploder' | 'weaver' | 'formation' | 'mirrorer') || 'swarm'
        const ang = Phaser.Math.Angle.Between(s.x, s.y, px, py)
        let speed = (etype === 'swarm' ? 110 : etype === 'dasher' ? 160 : 80) * 0.5
        if (etype === 'dasher' && dashPhase % 2 === 0) speed *= dashBoost
        s.body.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed)
        this.drawHealthBar(s)
        return true
      })
    }

    this.updatePowerupSprites(delta)
    this.enemyLifecycle?.update(this.time.now)

    const aimDirection = this.getAimDirection()
    const reticle = this.getReticlePosition()
    const aimAngle = Math.atan2(aimDirection.y, aimDirection.x) + Math.PI / 2
    if (this.gameplayMode === 'vertical') {
      this.player.setRotation(-Math.PI / 2)
    } else {
      this.player.setRotation(aimAngle)
    }

    this.crosshair.clear()
    const crosshairColor = this.gameplayMode === 'vertical' ? 0xff5db1 : 0x00e5ff
    this.crosshair.lineStyle(2, crosshairColor, 0.9)
    this.crosshair.strokeCircle(reticle.x, reticle.y, 10)
    this.crosshair.beginPath()
    this.crosshair.moveTo(reticle.x - 14, reticle.y)
    this.crosshair.lineTo(reticle.x - 4, reticle.y)
    this.crosshair.moveTo(reticle.x + 4, reticle.y)
    this.crosshair.lineTo(reticle.x + 14, reticle.y)
    this.crosshair.moveTo(reticle.x, reticle.y - 14)
    this.crosshair.lineTo(reticle.x, reticle.y - 4)
    this.crosshair.moveTo(reticle.x, reticle.y + 4)
    this.crosshair.lineTo(reticle.x, reticle.y + 14)
    this.crosshair.strokePath()

    const bulletMargin = 64
    this.bullets.children.each((obj: Phaser.GameObjects.GameObject) => {
      const bullet = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      if (!bullet.active) return true
      if (
        bullet.x < -bulletMargin ||
        bullet.x > this.scale.width + bulletMargin ||
        bullet.y < -bulletMargin ||
        bullet.y > this.scale.height + bulletMargin
      ) {
        this.disableBullet(bullet)
      }
      return true
    })
  }

  private fireBullet(judgementOverride?: BeatJudgement, deltaOverride?: number) {
    const direction = this.getAimDirection()
    if (direction.lengthSq() === 0) return

    const muzzleX = this.player.x + direction.x * 10
    const muzzleY = this.player.y + direction.y * 10
    this.effects.plasmaCharge(muzzleX, muzzleY, Math.atan2(direction.y, direction.x) + Math.PI / 2)
    this.effects.muzzleFlash(muzzleX, muzzleY)

    const ttl = this.computeBulletLifetime(direction)
    const deltaMs = typeof deltaOverride === 'number'
      ? deltaOverride
      : this.analyzer?.nearestBeatDeltaMs?.() ?? 999
    const derivedJudgement = this.beatWindow.classify(deltaMs)
    const judgement = judgementOverride ?? derivedJudgement
    const accuracy = this.scoring.registerShot(deltaMs)
    const bulletMetadata = this.buildBulletMetadata(accuracy, judgement)

    const bullet = this.spawnPlasmaBullet(direction, ttl, bulletMetadata)
    if (!bullet) return

    if (bulletMetadata.isPerfect) {
      this.effects.perfectShotBurst(muzzleX, muzzleY)
    }

    this.sound.play('shot', { volume: this.opts.sfxVolume })

    if (this.powerups.hasHomingMissiles) {
      this.spawnHomingMissile(direction)
    }

    if (this.powerups.hasSplit) {
      const offset = Phaser.Math.DegToRad(12)
      const leftDir = direction.clone().rotate(-offset)
      const rightDir = direction.clone().rotate(offset)
      this.spawnPlasmaBullet(leftDir, ttl, { ...bulletMetadata })
      this.spawnPlasmaBullet(rightDir, ttl, { ...bulletMetadata })
    }

    this.showShotFeedback(accuracy, judgement)

    const g = this.add.graphics({ x: this.player.x, y: this.player.y })
    g.lineStyle(2, 0x00e5ff, 0.8)
    g.strokeCircle(0, 0, 18)
    this.tweens.add({ targets: g, alpha: 0, scale: 1.6, duration: 180, onComplete: () => g.destroy() })
  }

  private showShotFeedback(accuracy: AccuracyLevel, judgementOverride?: BeatJudgement) {
    if (!this.hud) return
    const quality: BeatJudgement = judgementOverride ?? (accuracy === 'Perfect' ? 'perfect' : 'normal')
    this.hud.showShotFeedback(quality, accuracy)
  }

  private spawnPlasmaBullet(direction: Phaser.Math.Vector2, lifetimeMs?: number, metadata?: BulletMetadata) {
    const bullet = this.bullets.get(this.player.x, this.player.y) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null
    if (!bullet) return null

    bullet.setActive(true).setVisible(true)
    bullet.setTexture('bullet_plasma_0')
    bullet.setBlendMode(Phaser.BlendModes.SCREEN)
    bullet.setDepth(5)
    bullet.play('bullet_plasma_idle')

    const body = bullet.body as Phaser.Physics.Arcade.Body
    body.enable = true
    body.setAllowGravity(false)
    body.setSize(12, 72, true)
    body.onWorldBounds = true
    body.setVelocity(direction.x * this.bulletSpeed, direction.y * this.bulletSpeed)

    const rotation = Math.atan2(direction.y, direction.x) + Math.PI / 2
    bullet.setRotation(rotation)
    bullet.setScale(0.55)

    bullet.setData('spawnTime', this.time.now)
    bullet.setData('damage', metadata?.damage ?? 1.5)
    bullet.setData('judgement', metadata?.judgement ?? 'normal')
    bullet.setData('accuracy', metadata?.accuracy ?? 'Offbeat')
    bullet.setData('isPerfect', metadata?.isPerfect ?? false)

    this.effects.attachPlasmaTrail(bullet)
    this.scheduleBulletTtl(bullet, lifetimeMs)

    return bullet
  }

  private buildBulletMetadata(accuracy: AccuracyLevel, judgement: BeatJudgement): BulletMetadata {
    const isPerfect = accuracy === 'Perfect' && judgement === 'perfect'
    let damage = 1.5
    if (isPerfect) damage += 1
    return {
      damage,
      judgement,
      accuracy,
      isPerfect
    }
  }

  private readBulletMetadata(bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): BulletMetadata {
    const damageRaw = Number(bullet.getData('damage'))
    const judgementRaw = bullet.getData('judgement') as BeatJudgement | undefined
    const accuracyRaw = bullet.getData('accuracy') as AccuracyLevel | undefined
    const isPerfect = bullet.getData('isPerfect') === true
    const damage = Number.isFinite(damageRaw) && damageRaw > 0 ? damageRaw : 1.5
    return {
      damage,
      judgement: judgementRaw ?? (isPerfect ? 'perfect' : 'normal'),
      accuracy: accuracyRaw ?? (isPerfect ? 'Perfect' : 'Offbeat'),
      isPerfect
    }
  }

  private scheduleBulletTtl(bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, lifetimeMs?: number) {
    const prev = bullet.getData('ttlEvent') as Phaser.Time.TimerEvent | undefined
    prev?.remove(false)
    const ttlEvent = this.time.addEvent({
      delay: lifetimeMs ?? this.bulletTtlMs,
      callback: () => this.disableBullet(bullet)
    })
    bullet.setData('ttlEvent', ttlEvent)
  }

  private disableBullet(bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    if (!bullet.active) return
    const ttlEvent = bullet.getData('ttlEvent') as Phaser.Time.TimerEvent | undefined
    ttlEvent?.remove(false)
    bullet.setData('ttlEvent', undefined)

    this.effects.clearPlasmaTrail(bullet)
    bullet.anims?.stop?.()
    if (this.textures.exists('bullet_plasma_0')) {
      bullet.setTexture('bullet_plasma_0')
    }
    bullet.setBlendMode(Phaser.BlendModes.SCREEN)
    bullet.disableBody(true, true)
  }

  private handleBulletWorldBounds(body: Phaser.Physics.Arcade.Body) {
    const gameObject = body.gameObject as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined
    if (!gameObject) return
    if (!this.bullets.contains(gameObject)) return
    this.disableBullet(gameObject)
  }

  private maybeDropPickup(x: number, y: number) {
    const chance = 0.05
    if (Math.random() > chance) return
    const type = this.pickPowerupType()
    const art = this.resolvePowerupVisual(type)
    const texture = art.texture
    const anim = art.anim
    const s = this.physics.add.sprite(x, y, texture)
    if (this.anims.exists(anim)) s.play(anim)
    s.setData('ptype', type)
    s.setData('spawnAt', this.time.now)
    s.setData('magnetRange', Math.max(220, this.scale.height * 0.28))
    s.setDepth(4)
    s.body.setAllowGravity(false)
    s.body.setVelocity(0, 60)
    s.body.setDrag(38, 0)
    this.activePowerups.add(s)

    const glow = this.add.image(x, y, 'plasma_glow_disc')
      .setDepth(3)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.85)
      .setScale(0.7)
    const glowFollow = () => {
      glow.x = s.x
      glow.y = s.y
    }
    this.events.on(Phaser.Scenes.Events.UPDATE, glowFollow)
    const cleanupGlow = () => {
      this.events.off(Phaser.Scenes.Events.UPDATE, glowFollow)
      glow.destroy()
    }
    const glowTween = this.tweens.add({
      targets: glow,
      scale: { from: 0.7, to: 1.95 },
      alpha: { from: 0.85, to: 0.35 },
      yoyo: true,
      repeat: -1,
      duration: 560,
      ease: 'Sine.easeInOut'
    })

    const pulseTween = this.tweens.add({
      targets: s,
      alpha: { from: 1, to: 0.6 },
      yoyo: true,
      repeat: -1,
      duration: 640,
      ease: 'Sine.easeInOut'
    })

    const radius = 24
    const offsetX = s.width * 0.5 - radius
    const offsetY = s.height * 0.5 - radius
    s.body.setCircle(radius, offsetX, offsetY)
    // Fade after 8s
    const fadeTween = this.tweens.add({
      targets: s,
      alpha: 0.18,
      duration: 8000,
      onComplete: () => {
        pulseTween.stop()
        glowTween.stop()
        s.destroy()
      }
    })
    // Overlap with player
    const overlap = this.physics.add.overlap(this.player, s, () => {
      overlap.destroy()
      const ptype = s.getData('ptype') as PowerupType
      const pickupX = s.x
      const pickupY = s.y
      s.destroy()
      const dur = this.powerupDurations[ptype] ?? 5
      this.powerups.apply(ptype, dur)
      this.effects.powerupPickupText(pickupX, pickupY - 10, ptype)
      this.announcer.playPowerup(ptype)
      this.playPowerupSound(ptype)
    })

    s.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.activePowerups.delete(s)
      pulseTween.stop()
      glowTween.stop()
      fadeTween.stop()
      cleanupGlow()
    })
  }

  private playPowerupSound(type: PowerupType) {
    const key = `powerup_${type}`
    const vol = this.opts.sfxVolume
    if (this.sound.get(key)) {
      this.sound.play(key, { volume: vol })
    } else {
      this.sound.play('ui_select', { volume: vol })
    }
  }

  private pickPowerupType(): PowerupType {
    const fallback: PowerupType[] = [
      'shield',
      'rapid',
      'split',
      'slowmo',
      'chain_lightning',
      'homing_missiles',
      'time_stop'
    ]
    const balance = this.registry.get('balance') as any
    const rates = balance?.powerups?.dropRates as Partial<Record<PowerupType, number>> | undefined
    if (!rates) {
      return fallback[Math.floor(Math.random() * fallback.length)]
    }
    const weighted = fallback
      .map((type) => ({ type, weight: Math.max(0, Number.isFinite(rates[type] ?? 0) ? Number(rates[type]) : 0) }))
      .filter((entry) => entry.weight > 0)
    if (!weighted.length) {
      return fallback[Math.floor(Math.random() * fallback.length)]
    }
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0)
    const roll = Math.random() * total
    let accum = 0
    for (const entry of weighted) {
      accum += entry.weight
      if (roll <= accum) return entry.type
    }
    return weighted[weighted.length - 1].type
  }

  private resolvePowerupVisual(type: PowerupType) {
    const textureKey = `powerup_${type}_0`
    const fallbackTexture = 'powerup_split_0'
    const animKey = `powerup_pickup_${type}`
    const fallbackAnim = 'powerup_pickup_split'
    const texture = this.textures.exists(textureKey) ? textureKey : fallbackTexture
    const anim = this.anims.exists(animKey) ? animKey : fallbackAnim
    return { texture, anim }
  }

  private applyDamageToEnemy(
    enemy: Enemy,
    rawAmount: number,
    context: {
      critical?: boolean
      source: 'bullet' | 'chain' | 'missile'
      judgement?: BeatJudgement
      accuracy?: AccuracyLevel
      registerCombo?: boolean
    }
  ): { killed: boolean; remainingHp: number } {
    if (!enemy.active) return { killed: false, remainingHp: 0 }
    const amount = Math.max(0, Math.floor(rawAmount))
    if (amount <= 0) {
      const currentHp = (enemy.getData('hp') as number) ?? 0
      return { killed: false, remainingHp: currentHp }
    }

    const etype = (enemy.getData('etype') as string) || 'swarm'
    const hp = (enemy.getData('hp') as number) ?? 1
    const newHp = hp - amount
    enemy.setData('hp', newHp)

    const maxHp = (enemy.getData('maxHp') as number) ?? Math.max(hp, 1)
    const isBoss = enemy.getData('isBoss') === true
    if (isBoss) {
      this.hud.setBossHealth(Math.max(newHp, 0) / Math.max(maxHp, 1), enemy.getData('etype') as string)
    }

    this.effects.enemyHitFx(enemy.x, enemy.y, { critical: context.critical })
    this.effects.hitFlash(enemy)
    const skin = enemy.getData('skin') as any
    skin?.onHit?.()

    if (context.registerCombo !== false) {
      this.registerComboHit(enemy)
    }

    if (newHp <= 0) {
      this.sound.play('hit_enemy', { volume: this.opts.sfxVolume })
      this.scoring.addKill(etype)
      this.bumpBomb(10)
      this.maybeDropPickup(enemy.x, enemy.y)
      this.effects.enemyExplodeFx(enemy.x, enemy.y)
      const bossFlag = isBoss
      this.cleanupEnemy(enemy, true)
      if (bossFlag) this.onBossDown()
      return { killed: true, remainingHp: 0 }
    }

    return { killed: false, remainingHp: newHp }
  }

  private registerComboHit(enemy: Enemy) {
    const enemyId = enemy.getData('eid') as string | undefined
    if (this.time.now - this.lastHitAt > this.comboTimeoutMs) {
      this.comboCount = 0
      this.lastHitEnemyId = null
    }
    if (!enemyId) {
      this.lastHitAt = this.time.now
      return
    }
    if (this.lastHitEnemyId !== enemyId) {
      if (this.comboCount > 0) {
        this.comboCount++
        this.effects.showComboText(enemy.x, enemy.y, this.comboCount)
        this.hud.setCombo(this.comboCount)
        this.announcer.playCombo(this.comboCount)
      } else {
        this.comboCount = 1
      }
      this.lastHitEnemyId = enemyId
    }
    this.lastHitAt = this.time.now
  }

  private triggerChainLightning(origin: { x: number; y: number; source?: Enemy | null }, baseDamage: number) {
    if (!this.powerups?.hasChainLightning) return
    const amount = Math.max(0, Math.round(baseDamage))
    if (amount <= 0) return
    const visited = new Set<Enemy>()
    if (origin.source) visited.add(origin.source)
    this.chainLightningBounce(origin.x, origin.y, amount, 0, visited)
  }

  private chainLightningBounce(x: number, y: number, damage: number, bounce: number, visited: Set<Enemy>) {
    if (!this.powerups?.hasChainLightning) return
    if (bounce >= 3) return
    const amount = Math.max(0, Math.round(damage))
    if (amount <= 0) return
    const target = this.acquireNearestEnemy(x, y, { within: 420, exclude: visited })
    if (!target) return
    const targetX = target.x
    const targetY = target.y
    visited.add(target)
    this.effects.chainLightningArc(x, y, targetX, targetY, { bounceIndex: bounce })
    this.applyDamageToEnemy(target, amount, {
      source: 'chain',
      critical: bounce === 0,
      registerCombo: false
    })
    const nextDamage = Math.max(0, Math.round(amount * 0.6))
    if (nextDamage <= 0) return
    this.chainLightningBounce(targetX, targetY, nextDamage, bounce + 1, visited)
  }

  private acquireNearestEnemy(
    x: number,
    y: number,
    options: { within?: number; exclude?: Set<Enemy> } = {}
  ): Enemy | null {
    const group = this.spawner?.getGroup()
    if (!group) return null
    const radius = options.within ?? 600
    const exclude = options.exclude ?? new Set<Enemy>()
    let best: Enemy | null = null
    let bestDist = Number.POSITIVE_INFINITY
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      if (exclude.has(enemy)) return true
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y)
      if (dist <= radius && dist < bestDist) {
        bestDist = dist
        best = enemy
      }
      return true
    })
    return best
  }

  private spawnHomingMissile(direction: Phaser.Math.Vector2) {
    if (!this.missiles) return
    if (this.time.now - this.lastMissileSpawnAt < 140) return
    const missile = this.missiles.get(this.player.x, this.player.y) as MissileSprite | null
    if (!missile) return

    this.lastMissileSpawnAt = this.time.now
    missile.setActive(true).setVisible(true)
    missile.setTexture('bullet_plasma_0')
    missile.play('bullet_plasma_idle')
    missile.setBlendMode(Phaser.BlendModes.ADD)
    missile.setScale(0.5)
    missile.setDepth(6)

    const body = missile.body as Phaser.Physics.Arcade.Body
    body.enable = true
    body.setAllowGravity(false)
    body.setSize(12, 52, true)
    body.onWorldBounds = true

    const dir = direction.lengthSq() > 0 ? direction.clone().normalize() : new Phaser.Math.Vector2(0, -1)
    body.setVelocity(dir.x * this.homingMissileSpeed, dir.y * this.homingMissileSpeed)
    missile.setRotation(Math.atan2(body.velocity.y, body.velocity.x) + Math.PI / 2)

    missile.setData('damage', 2)
    missile.setData('target', null)
    const trail = this.effects.attachMissileTrail(missile)
    missile.setData('trailEmitter', trail ?? null)

    this.scheduleMissileTtl(missile, 2400)
  }

  private resolveMissileTarget(missile: MissileSprite): Enemy | null {
    const stored = missile.getData('target') as Enemy | null
    if (stored && stored.active) return stored
    const target = this.acquireNearestEnemy(missile.x, missile.y)
    missile.setData('target', target ?? null)
    return target ?? null
  }

  private updateMissiles(_delta: number) {
    if (!this.missiles) return
    this.missiles.children.each((obj: Phaser.GameObjects.GameObject) => {
      const missile = obj as MissileSprite
      if (!missile.active) return true
      const body = missile.body as Phaser.Physics.Arcade.Body
      if (!body) return true
      const target = this.resolveMissileTarget(missile)
      if (target) {
        const toTarget = new Phaser.Math.Vector2(target.x - missile.x, target.y - missile.y)
        const dist = toTarget.length()
        if (dist > 0) {
          toTarget.scale(1 / dist)
          const current = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y)
          if (current.lengthSq() === 0) current.set(0, -1)
          else current.normalize()
          const desired = current.lerp(toTarget, 0.12)
          if (desired.lengthSq() === 0) desired.set(0, -1)
          desired.normalize()
          body.setVelocity(desired.x * this.homingMissileSpeed, desired.y * this.homingMissileSpeed)
          missile.setRotation(Math.atan2(body.velocity.y, body.velocity.x) + Math.PI / 2)
        }
      }
      return true
    })
  }

  private scheduleMissileTtl(missile: MissileSprite, lifetimeMs = 2400) {
    const prev = missile.getData('ttlEvent') as Phaser.Time.TimerEvent | undefined
    prev?.remove(false)
    const ttlEvent = this.time.addEvent({ delay: lifetimeMs, callback: () => this.disableMissile(missile) })
    missile.setData('ttlEvent', ttlEvent)
  }

  private disableMissile(missile: MissileSprite) {
    if (!missile.active) return
    const ttlEvent = missile.getData('ttlEvent') as Phaser.Time.TimerEvent | undefined
    ttlEvent?.remove(false)
    missile.setData('ttlEvent', undefined)
    const emitter = missile.getData('trailEmitter') as Phaser.GameObjects.Particles.ParticleEmitter | undefined
    emitter?.destroy()
    missile.setData('trailEmitter', undefined)
    missile.anims?.stop?.()
    missile.disableBody(true, true)
  }

  private handleMissileWorldBounds(body: Phaser.Physics.Arcade.Body) {
    const gameObject = body.gameObject as MissileSprite | undefined
    if (!gameObject) return
    if (!this.missiles.contains(gameObject)) return
    this.disableMissile(gameObject)
  }

  private handlePowerupApplied(event: PowerupEvent) {
    switch (event.type) {
      case 'time_stop': {
        const ms = event.remainingMs > 0 ? event.remainingMs : event.durationMs
        this.activateTimeStop(ms)
        break
      }
      case 'homing_missiles':
        this.lastMissileSpawnAt = 0
        break
      default:
        break
    }
  }

  private activateTimeStop(durationMs: number) {
    const resumeAt = this.time.now + Math.max(0, durationMs)
    this.timeStopResumeAt = Math.max(this.timeStopResumeAt, resumeAt)
    this.timeStopActive = true
    this.freezeEnemyMotion(true)
  }

  private deactivateTimeStop() {
    if (!this.timeStopActive) return
    this.timeStopActive = false
    this.timeStopResumeAt = 0
    this.freezeEnemyMotion(false)
  }

  private freezeEnemyMotion(freeze: boolean) {
    const group = this.spawner?.getGroup()
    if (!group) return
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      const body = enemy.body as Phaser.Physics.Arcade.Body
      if (!body) return true
      if (freeze) {
        if (!enemy.getData('timeStopStored')) {
          enemy.setData('timeStopStored', true)
          enemy.setData('timeStopVelX', body.velocity.x)
          enemy.setData('timeStopVelY', body.velocity.y)
        }
        body.setVelocity(0, 0)
        body.moves = false
        const tween = enemy.getData('laneHopTween') as Phaser.Tweens.Tween | null
        if (tween && tween.isPlaying()) {
          tween.pause()
          enemy.setData('timeStopPausedTween', true)
        }
      } else {
        if (enemy.getData('timeStopStored')) {
          const vx = enemy.getData('timeStopVelX') as number | undefined
          const vy = enemy.getData('timeStopVelY') as number | undefined
          body.setVelocity(vx ?? body.velocity.x, vy ?? body.velocity.y)
          enemy.setData('timeStopStored', false)
        }
        body.moves = true
        const tween = enemy.getData('laneHopTween') as Phaser.Tweens.Tween | null
        if (tween && enemy.getData('timeStopPausedTween')) {
          tween.resume()
          enemy.setData('timeStopPausedTween', false)
        }
      }
      return true
    })
  }

  private registerTouchTap(time: number) {
    this.touchTapTimes = this.touchTapTimes.filter(t => time - t < 500)
    this.touchTapTimes.push(time)
    if (this.touchTapTimes.length >= 2) {
      this.touchTapTimes = []
      if (this.bombCharge >= 100) this.triggerBomb()
    }
  }

  private updateNavTargetFromPointer(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 {
    const target = this.navTarget ?? (this.navTarget = new Phaser.Math.Vector2())
    this.cameras.main.getWorldPoint(pointer.x, pointer.y, target)
    return target
  }

  private updateMovementBounds() {
    const { height } = this.scale
    if (this.gameplayMode === 'vertical' && this.verticalSafetyBand) {
      this.movementMinY = height * 0.65
      this.movementMaxY = height * 0.94
    } else {
      this.movementMinY = 0
      this.movementMaxY = height
    }
  }

  private applyLanePatternCount(count: 3 | 5 | 7, effect?: LaneEffect) {
    const hadLanes = Boolean(this.lanes)
    const countChanged = this.verticalLaneCount !== count || !hadLanes
    this.verticalLaneCount = count
    if (countChanged) {
      if (!this.lanes) {
        this.setupVerticalLaneSystem()
      } else {
        const previousLane = this.lanes.indexAt(this.player.x)
        this.lanes.rebuild(count)
        const snapIndex = Phaser.Math.Clamp(previousLane, 0, this.lanes.getCount() - 1)
        this.startLaneSnap(snapIndex)
        this.touchLaneIndexBaseline = this.lanes.indexAt(this.player.x)
        this.touchLaneAccum = 0
        this.hud?.setLaneCount(this.lanes.getCount())
      }
    }
    if (effect === 'expand') {
      this.pulseEnemies(1.1)
    } else if (effect === 'collapse') {
      this.pulseEnemies(1.25)
    } else if (effect === 'pulse') {
      this.pulseEnemies(1.35)
    }
  }

  private setupVerticalLaneSystem() {
    const laneCount = this.resolveLaneCount()
    this.lanes?.off(LaneManager.EVT_CHANGED, this.onLaneSnapshot, this)
    this.lanes?.destroy()
    this.neon?.setLaneSnapshot(null)
    this.registry.remove('laneSnapshot')
    this.currentSnapPoint = null
    this.lanes = new LaneManager({
      scene: this,
      count: laneCount,
      width: this.scale.width,
      left: 0,
      debug: false
    })
    this.lanes.on(LaneManager.EVT_CHANGED, this.onLaneSnapshot, this)
    this.onLaneSnapshot(this.lanes.getSnapshot())

    const lanes = this.lanes.getAll()
    const middle = this.lanes.middle() ?? lanes[Math.floor(lanes.length / 2)] ?? lanes[0]
    const targetIndex = middle?.index ?? 0
    const targetX = middle?.centerX ?? this.scale.width / 2

    this.targetLaneIndex = targetIndex
    this.currentSnapPoint = this.lanes.getLaneSnapPoint(targetIndex) ?? null
    this.laneSnapFromX = targetX
    this.laneSnapTargetX = targetX
    this.laneSnapElapsed = this.laneSnapDurationMs
    this.laneSnapActive = false
    this.touchLaneIndexBaseline = this.lanes.indexAt(targetX)
    this.touchLaneAccum = 0
    this.releaseFireArmed = false

    this.player.setX(targetX)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.reset(targetX, this.player.y)
    body.setVelocityX(0)

    this.spawner?.setLaneManager(this.lanes)
    this.hud?.setLaneCount(laneCount)
  }

  private resolveLaneCount(): 3 | 5 | 7 {
    if (this.verticalLaneCount >= 7) return 7
    if (this.verticalLaneCount >= 5) return 5
    return 3
  }

  private getLaneSpacing(): number {
    if (!this.lanes) return this.scale.width / 3
    const all = this.lanes.getAll()
    if (all.length <= 1) return this.scale.width
    let sum = 0
    let samples = 0
    for (let i = 1; i < all.length; i++) {
      sum += Math.abs(all[i].centerX - all[i - 1].centerX)
      samples++
    }
    return samples > 0 ? sum / samples : this.scale.width / 3
  }

  private shiftLane(direction: number): boolean {
    if (!this.lanes) return false
    const normalizedDir = direction < 0 ? -1 : direction > 0 ? 1 : 0
    if (normalizedDir === 0) return false
    const count = this.lanes.getCount()
    const fallbackIndex = Phaser.Math.Clamp(this.targetLaneIndex, 0, count - 1)
    const point = this.currentSnapPoint
      ?? this.lanes.getLaneSnapPoint(fallbackIndex)
      ?? this.lanes.nearestSnap(this.player.x)
    const indices = point?.laneIndices ?? [fallbackIndex]
    const baseIndex = indices.length === 1
      ? indices[0]
      : (normalizedDir > 0 ? indices[0] : indices[indices.length - 1])
    const next = Phaser.Math.Clamp(baseIndex + normalizedDir, 0, count - 1)
    if (next === baseIndex) return false
    this.startLaneSnap(next)
    return true
  }

  private startLaneSnap(index: number) {
    if (!this.lanes) return
    const count = this.lanes.getCount()
    const clamped = Phaser.Math.Clamp(index, 0, count - 1)
    const targetX = Math.round(this.lanes.centerX(clamped))
    this.targetLaneIndex = clamped
    this.currentSnapPoint = this.lanes.getLaneSnapPoint(clamped) ?? null
    const currentX = this.player.x
    if (Math.abs(targetX - currentX) <= this.laneDeadzonePx) {
      this.player.setX(targetX)
      const body = this.player.body as Phaser.Physics.Arcade.Body
      const dx = targetX - currentX
      body.position.x += dx
      body.prev.x += dx
      body.updateCenter()
      this.laneSnapActive = false
      this.laneSnapElapsed = this.laneSnapDurationMs
      return
    }
    this.laneSnapFromX = currentX
    this.laneSnapTargetX = targetX
    this.laneSnapElapsed = 0
    this.laneSnapActive = true
  }

  private updateLaneSnap(delta: number, preservedVy: number) {
    if (!this.lanes) return
    if (this.horizontalInputActive) {
      this.laneSnapActive = false
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (!this.laneSnapActive) {
      const nearest = this.lanes.nearestSnap(this.player.x)
      if (!nearest) return
      const snappedCenter = Math.round(nearest.centerX)
      const distance = Math.abs(snappedCenter - this.player.x)
      if (distance > this.laneDeadzonePx) {
        if (nearest.type === 'lane') {
          this.targetLaneIndex = nearest.laneIndices[0]
        }
        this.laneSnapFromX = this.player.x
        this.laneSnapTargetX = snappedCenter
        this.laneSnapElapsed = 0
        this.laneSnapActive = true
        this.currentSnapPoint = nearest
      } else {
        const prevX = this.player.x
        this.player.setX(snappedCenter)
        const dx = this.player.x - prevX
        body.position.x += dx
        body.prev.x += dx
        body.updateCenter()
        body.setVelocity(0, preservedVy)
        this.currentSnapPoint = nearest
        if (nearest.type === 'lane') {
          this.targetLaneIndex = nearest.laneIndices[0]
        }
      }
      return
    }

    this.laneSnapElapsed = Math.min(this.laneSnapElapsed + delta, this.laneSnapDurationMs)
    const t = Phaser.Math.Clamp(this.laneSnapElapsed / this.laneSnapDurationMs, 0, 1)
    const eased = Phaser.Math.Easing.Sine.InOut(t)
    const newX = Phaser.Math.Linear(this.laneSnapFromX, this.laneSnapTargetX, eased)
    const prevX = this.player.x
    this.player.setX(newX)
    const dx = this.player.x - prevX
    body.position.x += dx
    body.prev.x += dx
    body.updateCenter()
    body.setVelocity(0, preservedVy)

    if (t >= 1) {
      const aligned = Math.round(this.laneSnapTargetX)
      this.laneSnapTargetX = aligned
      const prev = this.player.x
      this.player.setX(aligned)
      const snapDx = this.player.x - prev
      body.position.x += snapDx
      body.prev.x += snapDx
      body.updateCenter()
      body.setVelocity(0, preservedVy)
      const finalPoint = this.lanes.nearestSnap(aligned)
      if (finalPoint) {
        this.currentSnapPoint = finalPoint
        if (finalPoint.type === 'lane') {
          this.targetLaneIndex = finalPoint.laneIndices[0]
        }
      }
      this.laneSnapActive = false
    }
  }

  private applyGamepadDeadzone(value: number): number {
    const abs = Math.abs(value)
    if (abs < this.gamepadDeadzone) return 0
    const sign = value < 0 ? -1 : 1
    const range = 1 - this.gamepadDeadzone
    const scaled = (abs - this.gamepadDeadzone) / (range || 1)
    return sign * Math.min(Math.max(scaled, 0), 1)
  }

  private setupBeatStatusOverlay() {
    const { width, height } = this.scale
    const baseStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'UiFont, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#0a0a14',
      strokeThickness: 6,
      shadow: { color: '#2d9cff', blur: 18, fill: true },
      align: 'center'
    }

    this.beatStatusSearching = this.add.text(width / 2, height / 2, 'SEARCHING FOR BEAT', baseStyle)
      .setOrigin(0.5)
      .setDepth(1e4)
      .setAlpha(0)
      .setScale(0.82)

    this.beatStatusDetected = this.add.text(width / 2, height / 2, 'BEAT DETECTED, GET READY', {
      ...baseStyle,
      color: '#6bffb2',
      shadow: { color: '#00ffaa', blur: 24, fill: true }
    })
      .setOrigin(0.5)
      .setDepth(1e4)
      .setAlpha(0)
      .setScale(0.78)

    this.tweens.add({
      targets: this.beatStatusSearching,
      alpha: 1,
      scale: 1,
      duration: 620,
      ease: 'Back.Out'
    })

    this.beatStatusResizeHandler = (size: Phaser.Structs.Size) => {
      const cx = size.width / 2
      const cy = size.height / 2
      this.beatStatusSearching?.setPosition(cx, cy)
      this.beatStatusDetected?.setPosition(cx, cy)
    }
    this.scale.on(Phaser.Scale.Events.RESIZE, this.beatStatusResizeHandler, this)
  }

  private onBeatDetection() {
    this.beatStatusDetectedShown = true

    if (this.beatStatusSearching) {
      this.tweens.add({
        targets: this.beatStatusSearching,
        alpha: 0,
        scale: 1.08,
        duration: 360,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.beatStatusSearching?.destroy()
          this.beatStatusSearching = undefined
        }
      })
    }

    const banner = this.beatStatusDetected
    if (!banner) return

    banner.setAlpha(0)
    banner.setScale(0.78)
    this.tweens.add({
      targets: banner,
      alpha: 1,
      scale: 1,
      duration: 520,
      ease: 'Back.Out',
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          if (!banner.active) return
          this.tweens.add({
            targets: banner,
            alpha: 0,
            scale: 1.12,
            duration: 420,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              banner.destroy()
              if (this.beatStatusDetected === banner) this.beatStatusDetected = undefined
            }
          })
        })
      }
    })
  }

  private getAimDirection(): Phaser.Math.Vector2 {
    const fallbackUp = new Phaser.Math.Vector2(0, -1)

    if (this.gameplayMode === 'vertical') {
      if (this.crosshairMode === 'pad-relative') {
        if (this.padAimVector.lengthSq() > 0.05) {
          const aim = this.padAimVector.clone()
          if (aim.y > -0.2) aim.y = -0.2
          return aim.normalize()
        }
      }
      if (this.unlockMouseAim) {
        const pointer = this.input.activePointer
        const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
        const dir = new Phaser.Math.Vector2(world.x - this.player.x, world.y - this.player.y)
        if (dir.lengthSq() > 0.0001) {
          return dir.normalize()
        }
      }
      return fallbackUp.clone()
    }

    if (this.crosshairMode === 'fixed') {
      return fallbackUp.clone()
    }

    if (this.crosshairMode === 'pad-relative' && this.padAimVector.lengthSq() > 0.05) {
      return this.padAimVector.clone()
    }

    const pointer = this.input.activePointer
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const dir = new Phaser.Math.Vector2(world.x - this.player.x, world.y - this.player.y)
    if (dir.lengthSq() < 0.0001) return fallbackUp.clone()
    return dir.normalize()
  }

  private getReticlePosition(): Phaser.Math.Vector2 {
    const { width, height } = this.scale
    const clampPoint = (vec: Phaser.Math.Vector2) => {
      vec.x = Phaser.Math.Clamp(vec.x, 12, width - 12)
      vec.y = Phaser.Math.Clamp(vec.y, 12, height - 12)
      return vec
    }

    if (this.gameplayMode === 'vertical') {
      if (this.crosshairMode === 'pad-relative') {
        const dir = this.getAimDirection()
        const distance = height * 0.28
        return clampPoint(new Phaser.Math.Vector2(
          this.player.x + dir.x * distance,
          this.player.y + dir.y * distance
        ))
      }
      if (this.unlockMouseAim) {
        const pointer = this.input.activePointer
        return clampPoint(this.cameras.main.getWorldPoint(pointer.x, pointer.y))
      }
      const offset = height * 0.35
      const targetY = this.player.y - offset
      const minY = 60
      return clampPoint(new Phaser.Math.Vector2(this.player.x, Math.max(minY, targetY)))
    }

    if (this.crosshairMode === 'fixed') {
      return clampPoint(new Phaser.Math.Vector2(this.player.x, this.player.y - 160))
    }

    if (this.crosshairMode === 'pad-relative' && this.padAimVector.lengthSq() > 0.05) {
      const distance = Math.min(220, Math.max(120, height * 0.25))
      return clampPoint(new Phaser.Math.Vector2(
        this.player.x + this.padAimVector.x * distance,
        this.player.y + this.padAimVector.y * distance
      ))
    }

    const pointer = this.input.activePointer
    return clampPoint(this.cameras.main.getWorldPoint(pointer.x, pointer.y))
  }

  private computeBulletLifetime(direction: Phaser.Math.Vector2): number {
    if (this.gameplayMode !== 'vertical') return this.bulletTtlMs
    const dy = direction.y
    if (Math.abs(dy) < 0.0001) return this.bulletTtlMs
    const margin = 80
    const targetY = -margin
    const distance = Math.abs((targetY - this.player.y) / dy)
    const travelTimeMs = (distance / this.bulletSpeed) * 1000
    const clamped = Phaser.Math.Clamp(travelTimeMs + 120, this.bulletTtlMs * 0.5, this.bulletTtlMs * 1.8)
    return clamped
  }

  private getStageConfig(stage: number): StageTuning {
    const stages = this.difficultyProfile.stageTuning
    if (!stages || stages.length === 0) {
      return {
        stage,
        scrollMultiplier: 1,
        spawnMultiplier: 1,
        enemyHpMultiplier: 1,
        bossHpMultiplier: 1,
        enemyCap: 18,
        maxQueuedWaves: 3
      }
    }
    const exact = stages.find((cfg) => cfg.stage === stage)
    if (exact) return exact
    return stage > stages[stages.length - 1].stage ? stages[stages.length - 1] : stages[0]
  }

  private updateDifficultyForStage() {
    this.currentStageConfig = this.getStageConfig(this.currentStage)
    const cfg = this.currentStageConfig

    this.enemyHpMultiplier = this.difficultyProfile.baseEnemyHpMultiplier * (cfg.enemyHpMultiplier ?? 1)
    this.bossHpMultiplier = this.difficultyProfile.baseBossHpMultiplier * (cfg.bossHpMultiplier ?? 1)
    this.enemyCap = cfg.enemyCap ?? this.enemyCap

    this.waveDirector?.applyStageSettings({
      maxQueuedWaves: cfg.maxQueuedWaves,
      heavyControls: {
        cooldownMs: cfg.heavyCooldownMs ?? this.difficultyProfile.heavyControls.cooldownMs,
        maxSimultaneous: cfg.maxSimultaneousHeavy ?? this.difficultyProfile.heavyControls.maxSimultaneous,
        windowMs: this.difficultyProfile.heavyControls.windowMs,
        maxInWindow: this.difficultyProfile.heavyControls.maxInWindow
      },
      categoryCooldowns: this.difficultyProfile.categoryCooldowns,
      waveRepeatCooldownMs: this.difficultyProfile.waveRepeatCooldownMs / Math.max(0.6, cfg.spawnMultiplier ?? 1)
    })

    this.spawner?.setDifficulty({
      hpMultiplier: this.enemyHpMultiplier,
      bossHpMultiplier: this.bossHpMultiplier,
      laneCount: this.verticalLaneCount
    })

    this.lanePattern?.updateStage(cfg)
    this.starfield?.setStageSpeedModifier(cfg.scrollMultiplier ?? 1)
  }


  private updateVerticalEnemies(group: Phaser.Physics.Arcade.Group, now: number) {
    const height = this.scale.height
    const margin = 100
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      const healthBar = enemy.getData('healthBar') as Phaser.GameObjects.Graphics
      if (!enemy.active) {
        healthBar?.destroy()
        return false
      }

      const pattern = enemy.getData('pattern') as PatternData | null
      const body = enemy.body as Phaser.Physics.Arcade.Body
      if (this.timeStopActive) {
        body.setVelocity(0, 0)
        return true
      }
      if (pattern) {
        switch (pattern.kind) {
          case 'lane': {
            enemy.x = pattern.anchorX
            body.setVelocity(0, pattern.speedY)
            break
          }
          case 'sine':
          case 'weaver': {
            const elapsed = (now - pattern.spawnTime) / 1000
            const baseAmplitude = pattern.kind === 'weaver'
              ? (enemy.getData('weaverBaseAmplitude') as number) ?? pattern.amplitude
              : pattern.amplitude
            let amplitude = baseAmplitude
            let vy = pattern.speedY
            if (pattern.kind === 'weaver') {
              const boostUntil = enemy.getData('weaverBoostUntil') as number | undefined
              if (boostUntil && boostUntil > this.time.now) {
                amplitude *= 1.4
                vy *= 1.3
              }
            }
            const offset = Math.sin(elapsed * pattern.angularVelocity) * amplitude
            enemy.x = pattern.anchorX + offset
            body.setVelocity(0, vy)
            break
          }
          case 'drift': {
            body.setVelocity(pattern.velocityX, pattern.speedY)
            break
          }
          case 'circle': {
            const dx = enemy.x - pattern.anchorX
            const dy = enemy.y - pattern.anchorY
            const radius = Math.max(1, Math.sqrt(dx * dx + dy * dy))
            const tangential = pattern.angularVelocity * radius
            const vx = (-dy / radius) * tangential
            const vy = (dx / radius) * tangential + this.scrollBase * 0.35
            body.setVelocity(vx, vy)
            break
          }
          case 'spiral': {
            const dx = enemy.x - pattern.anchorX
            const dy = enemy.y - pattern.anchorY
            const radius = Math.max(1, Math.sqrt(dx * dx + dy * dy))
            const vx = (-dy / radius) * pattern.angularVelocity * radius
            const vy = (dx / radius) * pattern.angularVelocity * radius + this.scrollBase * 0.4
            body.setVelocity(vx, vy)
            break
          }
          case 'burst': {
            body.setVelocity(body.velocity.x, body.velocity.y)
            break
          }
          case 'formation_dancer': {
            const offsets = pattern.offsets
            if (offsets && offsets.length > 0) {
              const indexRaw = (enemy.getData('formationIndex') as number) ?? 0
              const index = Phaser.Math.Wrap(indexRaw, 0, offsets.length)
              enemy.setData('formationIndex', index)
              const targetX = pattern.centerX + (offsets[index] ?? 0)
              const lerp = 0.2
              enemy.x = Phaser.Math.Linear(enemy.x, targetX, lerp)
            }
            body.setVelocity(0, pattern.speedY)
            break
          }
          case 'boss': {
            const settleLine = height * 0.25
            const targetSpeed = enemy.y < settleLine ? pattern.speedY : pattern.speedY * 0.08
            body.setVelocity(0, targetSpeed)
            break
          }
          case 'lane_hopper': {
            body.setVelocity(0, pattern.speedY)
            break
          }
          case 'teleporter': {
            if (this.lanes) {
              const lane = Phaser.Math.Clamp(pattern.laneIndex, 0, this.lanes.getCount() - 1)
              enemy.x = this.lanes.centerX(lane)
            }
            body.setVelocity(0, pattern.speedY)
            if (enemy.getData('teleporterBlinking') === true) {
              body.setVelocity(0, pattern.speedY)
            }
            break
          }
          case 'lane_flood': {
            if (this.lanes) {
              const lane = Phaser.Math.Clamp(pattern.laneIndex, 0, this.lanes.getCount() - 1)
              enemy.x = this.lanes.centerX(lane)
            }
            body.setVelocity(0, pattern.speedY)
            const rect = enemy.getData('flooderRect') as Phaser.GameObjects.Rectangle | undefined
            if (rect) {
              rect.x = enemy.x
              rect.y = enemy.y
            }
            break
          }
          case 'mirrorer': {
            const clampMargin = 24
            const targetX = Phaser.Math.Clamp(this.player.x, clampMargin, this.scale.width - clampMargin)
            const lerp = 0.18
            const newX = Phaser.Math.Linear(enemy.x, targetX, lerp)
            enemy.x = newX
            const baseSpeed = pattern.speedY
            let vy = baseSpeed
            const boostUntil = enemy.getData('mirrorerBoostUntil') as number | undefined
            if (boostUntil && boostUntil > this.time.now) {
              vy *= 1.4
            }
            const vx = Phaser.Math.Clamp((targetX - newX) * 6.5, -260, 260)
            body.setVelocity(vx, vy)
            break
          }
        }
      } else {
        body.setVelocity(body.velocity.x, this.scrollBase)
      }

      this.drawHealthBar(enemy)

      if (enemy.y > height + margin) {
        this.handleEnemyMiss(enemy)
        return false
      }
      return true
    })
  }

  private triggerLaneHopperHop() {
    if (!this.lanes || !this.spawner) return
    const group = this.spawner.getGroup()
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      const pattern = enemy.getData('pattern') as PatternData | null
      if (!pattern || pattern.kind !== 'lane_hopper') return true

      const hopEvery = pattern.hopEveryBeats && pattern.hopEveryBeats > 0 ? pattern.hopEveryBeats : 1
      const beatCount = ((enemy.getData('laneHopBeatCount') as number) ?? 0) + 1
      enemy.setData('laneHopBeatCount', beatCount)
      if (beatCount % hopEvery !== 0) return true

      const currentLane = (enemy.getData('laneHopCurrent') as number | undefined) ?? pattern.laneA
      const nextLane = currentLane === pattern.laneA ? pattern.laneB : pattern.laneA
      const laneManager = this.lanes
      if (!laneManager) return true
      const clampedLane = Phaser.Math.Clamp(nextLane, 0, laneManager.getCount() - 1)
      enemy.setData('laneHopCurrent', clampedLane)

      const targetX = laneManager.centerX(clampedLane)
      const body = enemy.body as Phaser.Physics.Arcade.Body
      const existingTween = enemy.getData('laneHopTween') as Phaser.Tweens.Tween | null
      existingTween?.remove()

      const tween = this.tweens.add({
        targets: enemy,
        x: targetX,
        duration: 140,
        ease: 'Sine.easeInOut',
        onUpdate: () => body.updateFromGameObject(),
        onComplete: () => {
          body.setVelocity(0, pattern.speedY)
          enemy.setData('laneHopTween', null)
        }
      })
      enemy.setData('laneHopTween', tween)
      return true
    })
  }

  private updateWeaversOnBeat(band: 'low' | 'mid' | 'high') {
    if (!this.spawner || band !== 'high') return
    const boostUntil = this.time.now + 280
    const group = this.spawner.getGroup()
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      if ((enemy.getData('etype') as string) !== 'weaver') return true
      enemy.setData('weaverBoostUntil', boostUntil)
      return true
    })
  }

  private updateTeleportersOnBeat(band: 'low' | 'mid' | 'high') {
    if (!this.spawner || !this.lanes || band !== 'high') return
    const group = this.spawner.getGroup()
    const laneCount = this.lanes.getCount()
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      if ((enemy.getData('etype') as string) !== 'teleporter') return true
      const pattern = enemy.getData('pattern') as PatternData | null
      if (!pattern || pattern.kind !== 'teleporter') return true
      const currentLane = (enemy.getData('teleporterLane') as number) ?? pattern.laneIndex ?? 0
      let nextLane = currentLane
      let guard = 0
      while (nextLane === currentLane && guard < 5) {
        nextLane = Phaser.Math.Between(0, Math.max(0, laneCount - 1))
        guard++
      }
      this.effects.teleporterBlink(enemy.x, enemy.y)
      enemy.setData('teleporterBlinking', true)
      enemy.setData('teleporterTargetLane', nextLane)
      enemy.setAlpha(0.08)
      this.time.delayedCall(120, () => {
        if (!enemy.active) return
        const targetLane = (enemy.getData('teleporterTargetLane') as number) ?? nextLane
        pattern.laneIndex = targetLane
        enemy.setData('teleporterLane', targetLane)
        if (this.lanes) {
          enemy.x = this.lanes.centerX(targetLane)
        }
        enemy.setAlpha(1)
        enemy.setData('teleporterBlinking', false)
      })
      return true
    })
  }

  private updateFormationDancersOnBeat(band: 'low' | 'mid' | 'high') {
    if (!this.spawner || band !== 'mid') return
    const group = this.spawner.getGroup()
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      if ((enemy.getData('etype') as string) !== 'formation') return true
      const pattern = enemy.getData('pattern') as PatternData | null
      if (!pattern || pattern.kind !== 'formation_dancer') return true
      const offsets = pattern.offsets
      if (!offsets || offsets.length === 0) return true
      const direction = (enemy.getData('formationDirection') as number) ?? 1
      const indexRaw = (enemy.getData('formationIndex') as number) ?? 0
      const nextIndex = Phaser.Math.Wrap(indexRaw + direction, 0, offsets.length)
      enemy.setData('formationIndex', nextIndex)
      return true
    })
  }

  private updateMirrorersOnBeat(band: 'low' | 'mid' | 'high') {
    if (!this.spawner || band !== 'high') return
    const boostUntil = this.time.now + 320
    const group = this.spawner.getGroup()
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      if ((enemy.getData('etype') as string) !== 'mirrorer') return true
      enemy.setData('mirrorerBoostUntil', boostUntil)
      return true
    })
  }

  private updateExplodersOnBeat(band: 'low' | 'mid' | 'high') {
    if (!this.spawner) return
    if (band !== 'low') return
    const group = this.spawner.getGroup()
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Enemy
      if (!enemy.active) return true
      if ((enemy.getData('etype') as string) !== 'exploder') return true
      if (enemy.getData('exploderArmed') === false) return true
      let remaining = (enemy.getData('exploderCountdownBeats') as number) ?? 0
      remaining -= 1
      if (remaining <= 0) {
        enemy.setData('exploderArmed', false)
        this.detonateExploder(enemy)
        return true
      }
      enemy.setData('exploderCountdownBeats', remaining)
      if (remaining === 1) {
        this.effects.exploderWarning(enemy.x, enemy.y)
      }
      return true
    })
  }

  private detonateExploder(enemy: Enemy) {
    if (!enemy.active) return;

    this.effects.enemyExplodeFx(enemy.x, enemy.y);
    this.sound.play('explode_big', { volume: this.opts.sfxVolume });

    const radius = (enemy.getData('exploderRadius') as number) ?? 150;
    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    if (distance <= radius) {
      const tookDamage = this.damagePlayer(1, {
        feedback: 'Exploder Burst!',
        missPenalty: this.missPenalty,
        showFeedback: true
      });
      if (!tookDamage) {
        this.scoring.registerMiss(this.missPenalty);
        this.hud.showMissFeedback('Exploder Burst!');
      }
    } else {
      this.scoring.registerMiss(this.missPenalty);
      this.hud.showMissFeedback('Exploder Burst!');
    }

    this.comboCount = 0;
    this.hud.setCombo(0);
    this.bumpBomb(-20);
    this.cleanupEnemy(enemy, false);
  }

  private updatePowerupSprites(_delta: number) {
    if (this.activePowerups.size === 0) return
    const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y)
    const baseMagnet = Math.max(220, this.scale.height * 0.28)
    for (const sprite of Array.from(this.activePowerups)) {
      if (!sprite.active) continue
      const body = sprite.body as Phaser.Physics.Arcade.Body | null
      if (!body) continue

      const toPlayer = new Phaser.Math.Vector2(playerPos.x - sprite.x, playerPos.y - sprite.y)
      const distance = toPlayer.length()
      const magnetRange = sprite.getData('magnetRange') as number | undefined
      const range = magnetRange ?? baseMagnet

      if (distance < range) {
        const pull = 1 - distance / range
        if (pull > 0) {
          toPlayer.normalize()
          const strength = 280 * pull
          const newVelX = Phaser.Math.Linear(body.velocity.x, toPlayer.x * strength, 0.2)
          const newVelY = Phaser.Math.Linear(body.velocity.y, toPlayer.y * strength, 0.2)
          body.setVelocity(newVelX, newVelY)
        }
      } else {
        const driftSpeed = 60
        const newVelY = Phaser.Math.Linear(body.velocity.y, driftSpeed, 0.06)
        body.setVelocity(body.velocity.x * 0.9, newVelY)
      }

      if (sprite.y > this.scale.height + 80) {
        sprite.destroy()
      }
    }
  }

  private resolveWaveDescriptor(id: string): WaveDescriptor {
    if (this.waveDescriptorIndex.has(id)) {
      return this.waveDescriptorIndex.get(id)!
    }
    const fallback: WaveDescriptor = {
      id,
      formation: 'lane',
      enemyType: 'swarm'
    }
    this.waveDescriptorIndex.set(id, fallback)
    return fallback
  }

  private handleWaveScheduled(payload: any, fallback: boolean) {
    if (!this.hud) return
    const descriptor = this.resolveWaveDescriptor(payload.descriptorId)
    const spawnAt = typeof payload.spawnAt === 'number' ? payload.spawnAt : this.time.now
    if (this.nextWaveInfo && this.nextWaveInfo.spawnAt <= spawnAt) return
    const label = `${descriptor.enemyType} · ${descriptor.formation}`
    this.nextWaveInfo = { descriptorId: descriptor.id, spawnAt }
    this.hud.setUpcomingWave({ label, spawnAt, fallback })
  }

  private handleWaveSpawned = (payload: any) => {
    if (this.nextWaveInfo && payload.descriptorId === this.nextWaveInfo.descriptorId) {
      this.hud?.clearUpcomingWave()
      this.nextWaveInfo = null
    }
    this.hud?.clearTelegraphMessage()
    const descriptor = this.resolveWaveDescriptor(payload.descriptorId)
    if (!descriptor.telegraph) {
      this.announcer.playAudioKey(descriptor.audioCue, payload.fallback ? 0 : 1)
    }
  }

  private handleWaveTelegraph = (payload: any) => {
    if (!this.hud) return
    const descriptor = this.resolveWaveDescriptor(payload.descriptorId)
    this.announcer.playAudioKey(descriptor.audioCue, payload.fallback ? 0 : 1)
    if (descriptor.telegraph) {
      const typeLabel = descriptor.telegraph.type === 'circle'
        ? 'Circular Telegraph'
        : descriptor.telegraph.type === 'line'
          ? 'Line Telegraph'
          : 'Zone Telegraph'
      this.hud.setTelegraphMessage(`${typeLabel}: ${descriptor.enemyType.toUpperCase()}`)
    } else {
      this.hud.setTelegraphMessage(`Incoming: ${descriptor.enemyType.toUpperCase()}`)
    }
  }

  private handleEnemyMiss(enemy: Enemy) {
    const isBoss = enemy.getData('isBoss') === true
    this.cleanupEnemy(enemy, false)
    this.comboCount = 0
    this.hud.setCombo(0)
    this.lastHitEnemyId = null
    this.scoring.registerMiss(isBoss ? this.bossMissPenalty : this.missPenalty)
    this.hud.showMissFeedback(isBoss ? 'Boss Escaped!' : 'Miss!')
    if (isBoss) {
      this.hud.setBossHealth(null)
      this.bossSpawned = false
      this.activeBoss = null
    }
  }

  private damagePlayer(amount: number, opts: { feedback?: string; missPenalty?: number; showFeedback?: boolean } = {}): boolean {
    const now = this.time.now
    if (now < this.iframesUntil) return false
    if (this.powerups.hasShield) {
      this.effects.hitSpark(this.player.x, this.player.y)
      return false
    }

    this.playerHp = Math.max(0, this.playerHp - amount)
    this.comboCount = 0
    this.hud.setCombo(0)
    this.iframesUntil = now + 800
    this.hud.setHp(this.playerHp)
    if (!this.reducedMotion) this.cameras.main.shake(150, 0.01)

    if (typeof opts.missPenalty === 'number') {
      this.scoring.registerMiss(opts.missPenalty)
    }

    const shouldShowFeedback = opts.showFeedback ?? Boolean(opts.feedback)
    if (shouldShowFeedback && opts.feedback) {
      this.hud.showMissFeedback(opts.feedback)
    }

    if (this.playerHp <= 0) {
      this.endRun()
    }
    return true
  }

  private onBossDown() {
    this.activeBoss = null
    this.bossSpawned = false
    this.currentStage += 1
    this.hud.setBossHealth(null)
    this.hud.setStage(this.currentStage)
    this.updateDifficultyForStage()
    this.announcer.playEvent('get_ready')
  }

  private handleBarStart = (event: { barIndex: number }) => {
    this.barsElapsed = event.barIndex
    if (this.gameplayMode !== 'vertical') return
    if (this.bossSpawned || this.activeBoss) return
    const barsPerBoss = 8
    if (event.barIndex > 0 && event.barIndex % barsPerBoss === 0 && this.spawner.getGroup().countActive(true) < Math.max(4, Math.round(this.enemyCap * 0.45))) {
      const boss = this.spawner.spawnBoss('brute', { hp: 120, speedMultiplier: 0.55 })
      this.bossSpawned = true
      this.activeBoss = boss
      this.hud.setBossHealth(1, boss.getData('etype') as string)
      this.announcer.playEvent('boss')
    }
  }

  private handleFireInputDown() {
    if (this.releaseFireMode) {
      this.releaseFireArmed = true
      return
    }
    if (this.opts.fireMode === 'click') {
      const t = this.time.now
      if (t - this.lastShotAt >= this.fireCooldownMs) {
        this.fireBullet()
        this.lastShotAt = t
      }
      return
    }
    this.isShooting = true
    if (this.opts.fireMode === 'hold_quantized') {
      this.nextQuantizedShotAt = this.lastBeatAt + this.beatPeriodMs
    }
  }

  private handleFireInputUp() {
    if (this.releaseFireMode) {
      if (this.releaseFireArmed) {
        this.releaseFireArmed = false
        this.executeReleaseShot()
      }
      return
    }
    this.isShooting = false
    this.nextQuantizedShotAt = 0
  }

  private executeReleaseShot() {
    const now = this.time.now
    if (now - this.lastShotAt < this.fireCooldownMs) return
    const deltaMs = this.analyzer?.nearestBeatDeltaMs?.() ?? null
    const judgement = this.beatWindow.classify(deltaMs)
    this.fireBullet(judgement, typeof deltaMs === 'number' ? deltaMs : undefined)
    this.lastShotAt = now
  }

  private onGamepadConnected(pad: Phaser.Input.Gamepad.Gamepad) {
    if (!pad) return
    this.activeGamepad = pad
  }

  private onGamepadDisconnected(pad: Phaser.Input.Gamepad.Gamepad) {
    if (this.activeGamepad === pad) {
      this.activeGamepad = undefined
      this.gamepadFireActive = false
      this.handleFireInputUp()
    }
  }

  private computeScrollBase(bpm: number): number {
    const referenceBpm = 120
    const ratio = bpm > 0 ? bpm / referenceBpm : 1
    const clampedRatio = Phaser.Math.Clamp(ratio, 0.5, 1.8)
    const stageMultiplier = this.currentStageConfig?.scrollMultiplier ?? 1
    const baseAtReference = this.difficultyProfile.baseScrollSpeed * stageMultiplier
    const scaled = baseAtReference * clampedRatio
    const min = 70 * stageMultiplier
    const max = 240 * stageMultiplier
    return Phaser.Math.Clamp(scaled, min, max)
  }

  private pulseEnemies(amplitudeMultiplier = 1) {
    const group = this.spawner.getGroup()
    group.children.each((obj: Phaser.GameObjects.GameObject) => {
      const enemy = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      if (!enemy.active) return false
      const skin = enemy.getData('skin') as CubeSkin | undefined
      if (!skin) return true
      const base = (enemy.getData('pulseScale') as number | undefined) ?? 0.1
      skin.pulse(base * amplitudeMultiplier)
      return true
    })
  }

  private triggerBomb() {
    // Clear enemies in radius by disabling all
    const group = this.spawner.getGroup()
   /* group.children.each((e: Phaser.GameObjects.GameObject) => {
      const s = e as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      if (!s.active) return false
      this.effects.explosion(s.x, s.y)
      s.disableBody(true, true)
      return true
    })
    */
    group.children.each((e: Phaser.GameObjects.GameObject) => {
      const s = e as Enemy
      if (!s.active) return true
      this.effects.explosion(s.x, s.y)
      this.cleanupEnemy(s, true)   // ← viktigt, städar skin + bar
      if (s.getData('isBoss') === true) this.onBossDown()
      return true
    })
    this.sound.play('explode_big', { volume: this.opts.sfxVolume })
    this.bumpBomb(-100)
  }

  private bumpBomb(delta: number) {
    const previous = this.bombCharge
    this.bombCharge = Phaser.Math.Clamp(this.bombCharge + delta, 0, 100)
    this.hud.setBombCharge(this.bombCharge / 100)
    if (this.bombCharge >= 100 && previous < 100 && !this.bombReadyAnnounced) {
      this.announcer.playBombReady()
      this.bombReadyAnnounced = true
    } else if (this.bombCharge < 100) {
      this.bombReadyAnnounced = false
    }
  }

  private drawHealthBar(enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const healthBar = enemy.getData('healthBar') as Phaser.GameObjects.Graphics
    if (!healthBar) return

    healthBar.clear()

    const hp = enemy.getData('hp') as number
    const maxHp = (enemy.getData('maxHp') as number) ?? hp
    const healthPercentage = maxHp > 0 && hp > 0 ? hp / maxHp : 0

    const barWidth = 20
    const barHeight = 3
    const x = enemy.x - barWidth / 2
    const y = enemy.y - (enemy.height * enemy.scaleY) / 2 - 8

    healthBar.fillStyle(0x808080)
    healthBar.fillRect(x, y, barWidth, barHeight)

    if (healthPercentage > 0) {
      healthBar.fillStyle(0x0066ff)
      healthBar.fillRect(x, y, barWidth * healthPercentage, barHeight)
    }
  }
  

  private endRun() {
    // Stop music
    this.music?.stop()
    this.sound.removeByKey('music')
    this.cache.audio.remove('music')
    const shots = this.scoring.shots || 0
    const hits = this.scoring.perfect + this.scoring.good
    const accuracy = shots > 0 ? (hits / shots) * 100 : 0
    this.scene.start('ResultScene', { score: this.scoring.score, accuracy })
  }

  private pauseGame() {
    if (this.isPaused) return
    this.isPaused = true
    this.sound.play('ui_back', { volume: this.opts.sfxVolume })
    this.music?.pause()
    this.scene.launch('MenuScene', { resume: true })
    this.scene.bringToTop('MenuScene')
    this.input.setDefaultCursor('default')
    this.scene.pause('GameScene')
  }
  private getMusic(): Phaser.Sound.BaseSound | undefined {
    return this.music;
  }

  private handleWaypoint(data: { cycleIndex: number }) {
    // Example waypoint logic: announce every 4 cycles
    if (data.cycleIndex > 0 && data.cycleIndex % 4 === 0) {
      this.announcer.playEvent('checkpoint');
      console.log(`Waypoint reached: Pattern cycle ${data.cycleIndex}`);
    }
  }

  private handleStageComplete() {
    console.log('Stage Complete!');
    this.announcer.playEvent('stage_clear');
    
    // Transition to the results scene after a short delay
    this.time.delayedCall(2000, () => {
        this.scene.start('ResultsScene', { 
            score: this.scoring.score, 
            accuracy: (this.scoring.perfect + this.scoring.good) / this.scoring.shots, 
            combo: this.scoring.maxCombo 
        });
    });
  }
}
