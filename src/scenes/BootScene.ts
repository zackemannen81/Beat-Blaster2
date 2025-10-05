import Phaser from 'phaser'

type AudioSourceManifest = Record<string, string[]>

const ANNOUNCER_AUDIO_SOURCES: AudioSourceManifest = (() => {
  const wavFiles = import.meta.glob('../assets/audio/sfx/**/*.wav', {
    eager: true,
    as: 'url'
  }) as Record<string, string>
  const mp3Files = import.meta.glob('../assets/audio/sfx/**/*.mp3', {
    eager: true,
    as: 'url'
  }) as Record<string, string>

  const grouped: AudioSourceManifest = {}

  const register = (entries: Record<string, string>) => {
    Object.entries(entries).forEach(([path, url]) => {
      const fileName = path.split('/').pop() ?? ''
      if (!fileName.startsWith('announcer_')) return
      const key = fileName.replace(/\.(wav|mp3)$/i, '')
      if (!grouped[key]) grouped[key] = []
      if (!grouped[key].includes(url)) grouped[key].push(url)
    })
  }

  register(wavFiles)
  register(mp3Files)

  return grouped
})()

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }
  private makeThrusterPinkCanvas(key = 'thruster_pink', w = 64, h = 64) {
    // Ta bort gammal om den finns
    if (this.textures.exists(key)) this.textures.remove(key)

    const tex = this.textures.createCanvas(key, w, h)
    if (!tex) {
      console.warn('createCanvas gav null för', key)
      return
    }

    const ctx = tex.getContext()
    if (!ctx) {
      console.warn('Ingen 2D context för', key)
      tex.destroy()
      return
    }

    // Rensa
    ctx.clearRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2

    // Rosa huvud-glow
    const rOuter = Math.min(w, h) * 0.48
    const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rOuter)
    g1.addColorStop(0.0, 'rgba(255, 93, 177, 1.00)') // #ff5db1
    g1.addColorStop(0.30, 'rgba(255, 93, 177, 0.65)')
    g1.addColorStop(0.65, 'rgba(255, 93, 177, 0.18)')
    g1.addColorStop(1.0, 'rgba(255, 93, 177, 0.00)')
    ctx.fillStyle = g1
    ctx.beginPath()
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2)
    ctx.fill()

    // Vit hot-core (lite mindre)
    const rCore = rOuter * 0.38
    const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rCore)
    g2.addColorStop(0.0, 'rgba(255,255,255,0.95)')
    g2.addColorStop(1.0, 'rgba(255,255,255,0.00)')
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = g2
    ctx.beginPath()
    ctx.arc(cx, cy, rCore, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    tex.refresh()
  }
 /* private makeSynthParticles() {
    const makeGlow = (key: string, color: number, size = 20) => {
      // Skapa grafik i scenen, men göm den så den inte syns när vi ritar texturen
      const g = this.add.graphics({ x: 0, y: 0 });
      g.setVisible(false);
  
      const cx = size / 2, cy = size / 2;
      const layers = 6;
      const r = size * 0.48;
  
      // “Fejk-gradient” med flera cirklar → mjuk neon-glow
      for (let i = 0; i < layers; i++) {
        const t = 1 - i / layers;          // 1..0
        const a = 0.10 + 0.12 * t;         // fallande alpha
        g.fillStyle(color, a);
        g.fillCircle(cx, cy, r * t);
      }
  
      // Liten highlight-ring för crisp kant
      g.lineStyle(1, 0xffffff, 0.12);
      g.strokeCircle(cx, cy, r * 0.85);
  
      g.generateTexture(key, size, size);
      g.destroy();
    };
  
    makeGlow('p_glow_cyan', 0x00e5ff, 20);
    makeGlow('p_glow_pink', 0xff5db1, 20);
  }
  */

  preload() {
    // Atlases (TexturePacker JSON Hash)
    this.load.atlas(
      'gameplay',
      'src/assets/sprites/gameplay.atlas.png',
      'src/assets/sprites/gameplay.atlas.json'
    )
    this.load.atlas(
      'ui',
      'src/assets/sprites/ui.atlas.png',
      'src/assets/sprites/ui.atlas.json'
    )
    this.load.atlas(
      'particles',
      'src/assets/sprites/particles.atlas.png',
      'src/assets/sprites/particles.atlas.json'
    )
    /*
    this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
    this.load.atlas('cube', 'assets/animations/cube.png', 'assets/animations/cube.json')
    this.load.setBaseURL('')
    */
    // Background now procedural (Starfield system); no image required
    // Load menu logo
    this.load.image('menulogo', 'src/assets/sprites/menulogo.png')
    // Load background image.
    this.load.image('background', 'src/assets/backgrounds/anal.png')

    // Config
    this.load.json('tracks', 'src/config/tracks.json')
    this.load.json('graphics', 'src/config/graphics.json')
    this.load.json('balance', 'src/config/balance.json')

    // Minimal SFX; Phaser supports array for codec fallbacks
    this.load.audio('ui_move', [
      'src/assets/audio/sfx/ui_move.wav',
      'src/assets/audio/sfx/ui_move.mp3',
      'src/assets/audio/sfx/ui_move.ogg'
    ])
    this.load.audio('ui_select', [
      'src/assets/audio/sfx/ui_select.wav',
      'src/assets/audio/sfx/ui_select.mp3',
      'src/assets/audio/sfx/ui_select.ogg'
    ])
    this.load.audio('ui_back', [
      'src/assets/audio/sfx/ui_back.wav',
      'src/assets/audio/sfx/ui_back.mp3',
      'src/assets/audio/sfx/ui_back.ogg'
    ])
    this.load.audio('shot', [
      'src/assets/audio/sfx/shot.wav'
    ])
    this.load.audio('hit_enemy', [
      'src/assets/audio/sfx/hit_enemy.ogg'
    ])
    this.load.audio('explode_big', [
      'src/assets/audio/sfx/explode_big.wav',
      'src/assets/audio/sfx/explode_big.ogg'
    ])
    this.load.audio('metronome', [
      'src/assets/audio/sfx/metronome.wav',
      'src/assets/audio/sfx/metronome.mp3'
    ])
    Object.entries(ANNOUNCER_AUDIO_SOURCES).forEach(([key, sources]) => {
      this.load.audio(key, sources)
    })
    // Note: pickup sound uses UI select as placeholder for browser compatibility

    const plasmaBasePath = 'src/assets/sprites/plasmabeam'
    const loadSequence = (prefix: string, count: number) => {
      for (let i = 0; i < count; i++) {
        this.load.image(`${prefix}_${i}`, `${plasmaBasePath}/${prefix}_${i}.png`)
      }
    }

    loadSequence('bullet_plasma', 6)
    loadSequence('bullet_plasma_charge', 5)
    loadSequence('bullet_plasma_impact', 6)
    loadSequence('plasma_trail', 4)
    loadSequence('enemy_hit_plasma', 6)
    loadSequence('enemy_explode_plasma', 8)
    loadSequence('enemy_shard', 4)

    const loadPowerupSeq = (prefix: string) => {
      for (let i = 0; i < 8; i++) {
        this.load.image(`${prefix}_${i}`, `src/assets/sprites/powerups/${prefix}_${i}.png`)
      }
    }

    loadPowerupSeq('powerup_shield')
    loadPowerupSeq('powerup_rapid')
    loadPowerupSeq('powerup_split')
    loadPowerupSeq('powerup_slowmo')

    this.load.image('powerup_badge_shield', 'src/assets/sprites/powerups/powerup_badge_shield.png')
    this.load.image('powerup_badge_rapid', 'src/assets/sprites/powerups/powerup_badge_rapid.png')
    this.load.image('powerup_badge_split', 'src/assets/sprites/powerups/powerup_badge_split.png')
    this.load.image('powerup_badge_slowmo', 'src/assets/sprites/powerups/powerup_badge_slowmo.png')

    this.load.image('pink_beam_arc', `${plasmaBasePath}/pink_beam_arc.png`)
    this.load.image('plasma_glow_disc', `${plasmaBasePath}/plasma_glow_disc.png`)
    this.load.image('particle_plasma_spark', `${plasmaBasePath}/particle_plasma_spark.png`)
    this.load.image('particle_plasma_dot', `${plasmaBasePath}/particle_plasma_dot.png`)
  }

  create() {
 /*
    this.anims.create({
      key: 'spin',
      frames: this.anims.generateFrameNames('cube', { prefix: 'frame', start: 1, end: 23 }),
      frameRate: 50,
      repeat: -1
  });
  */
    //this.makeSynthParticles();
    this.makeThrusterPinkCanvas('thruster_pink', 64, 64)
    this.ensureProceduralPowerups()
    this.ensurePlasmaAnimations()
    const tracks = this.cache.json.get('tracks') as any[]
    this.registry.set('tracks', tracks)
    this.registry.set('selectedTrackId', tracks?.[0]?.id || null)
    const balance = this.cache.json.get('balance')
    this.registry.set('balance', balance)
    // Audio unlock overlay for browsers that suspend audio context

    const mgr = this.sound
    // @ts-expect-error context exists when using WebAudio
    const ctx = mgr.context
    if (ctx && ctx.state === 'suspended') {
      const { width, height } = this.scale
      const msg = this.add.text(width / 2, height / 2, 'Click to enable audio', { fontFamily: 'UiFont', fontSize: '22px', color: '#fff' }).setOrigin(0.5)
      this.input.once('pointerdown', async () => {
        try { await ctx.resume() } catch {}
        msg.destroy()
        this.scene.start('MenuScene')
      })
    } else {
      this.scene.start('MenuScene')
    }
  }

  private ensurePlasmaAnimations() {
    const makeFrames = (prefix: string, count: number) =>
      Array.from({ length: count }, (_v, i) => ({ key: `${prefix}_${i}` }))

    if (!this.anims.exists('bullet_plasma_idle')) {
      this.anims.create({
        key: 'bullet_plasma_idle',
        frames: makeFrames('bullet_plasma', 6),
        frameRate: 20,
        repeat: -1
      })
    }

    if (!this.anims.exists('bullet_plasma_charge')) {
      this.anims.create({
        key: 'bullet_plasma_charge',
        frames: makeFrames('bullet_plasma_charge', 5),
        frameRate: 24,
        repeat: 0,
        hideOnComplete: true
      })
    }

    if (!this.anims.exists('bullet_plasma_impact')) {
      this.anims.create({
        key: 'bullet_plasma_impact',
        frames: makeFrames('bullet_plasma_impact', 6),
        frameRate: 30,
        repeat: 0,
        hideOnComplete: true
      })
    }

    if (!this.anims.exists('plasma_trail_cycle')) {
      this.anims.create({
        key: 'plasma_trail_cycle',
        frames: makeFrames('plasma_trail', 4),
        frameRate: 18,
        repeat: -1
      })
    }

    if (!this.anims.exists('enemy_hit_plasma')) {
      this.anims.create({
        key: 'enemy_hit_plasma',
        frames: makeFrames('enemy_hit_plasma', 6),
        frameRate: 26,
        repeat: 0,
        hideOnComplete: true
      })
    }

    if (!this.anims.exists('enemy_explode_plasma')) {
      this.anims.create({
        key: 'enemy_explode_plasma',
        frames: makeFrames('enemy_explode_plasma', 8),
        frameRate: 22,
        repeat: 0,
        hideOnComplete: true
      })
    }

    if (!this.anims.exists('enemy_shard_twinkle')) {
      this.anims.create({
        key: 'enemy_shard_twinkle',
        frames: makeFrames('enemy_shard', 4),
        frameRate: 18,
        repeat: -1
      })
    }

    const ensurePowerupAnim = (type: 'shield' | 'rapid' | 'split' | 'slowmo' | 'chain_lightning' | 'homing_missiles' | 'time_stop') => {
      const key = `powerup_pickup_${type}`
      if (this.anims.exists(key)) return
      const frames = makeFrames(`powerup_${type}`, 8)
      this.anims.create({ key, frames, frameRate: 12, repeat: -1 })
    }

    ensurePowerupAnim('shield')
    ensurePowerupAnim('rapid')
    ensurePowerupAnim('split')
    ensurePowerupAnim('slowmo')
    ensurePowerupAnim('chain_lightning')
    ensurePowerupAnim('homing_missiles')
    ensurePowerupAnim('time_stop')
  }

  private ensureProceduralPowerups() {
    const specs = [
      { type: 'chain_lightning', base: 0x5ce6ff, accent: 0xffffff, ring: 0x2aa3ff },
      { type: 'homing_missiles', base: 0xffb347, accent: 0xfff1c6, ring: 0xff8247 },
      { type: 'time_stop', base: 0x9c6bff, accent: 0xf2e7ff, ring: 0x6f3dff }
    ] as const
    specs.forEach((spec) => {
      this.generatePowerupFrames(spec.type, spec.base, spec.accent, spec.ring)
      this.ensurePowerupBadge(spec.type, spec.base)
    })
  }

  private generatePowerupFrames(type: string, baseColor: number, accentColor: number, ringColor: number) {
    const size = 64
    const cx = size / 2
    const cy = size / 2
    if (this.textures.exists(`powerup_${type}_0`)) return

    const frameCount = 8
    for (let i = 0; i < frameCount; i++) {
      const graphics = this.add.graphics({ x: 0, y: 0 })
      graphics.setVisible(false)
      graphics.clear()

      const rotation = (Math.PI * 2 * i) / frameCount

      graphics.fillStyle(baseColor, 0.7)
      graphics.fillCircle(cx, cy, 20)

      graphics.lineStyle(3, ringColor, 0.6)
      graphics.strokeCircle(cx, cy, 22)

      if (type === 'chain_lightning') {
        const segments = 6
        graphics.lineStyle(4, accentColor, 0.95)
        graphics.beginPath()
        graphics.moveTo(cx, cy - 18)
        for (let s = 1; s <= segments; s++) {
          const t = s / segments
          const offset = (s % 2 === 0 ? 1 : -1) * 10
          const px = cx + Math.sin(rotation + t * Math.PI * 1.5) * offset
          const py = Phaser.Math.Linear(cy - 18, cy + 18, t)
          graphics.lineTo(px, py)
        }
        graphics.strokePath()
      } else if (type === 'homing_missiles') {
        graphics.lineStyle(4, accentColor, 0.95)
        for (let n = -1; n <= 1; n++) {
          const angle = rotation + n * 0.28
          const tipX = cx + Math.cos(angle) * 20
          const tipY = cy + Math.sin(angle) * 20
          const tailX = cx + Math.cos(angle + Math.PI) * 8
          const tailY = cy + Math.sin(angle + Math.PI) * 8
          graphics.beginPath()
          graphics.moveTo(tailX, tailY)
          graphics.lineTo(tipX, tipY)
          graphics.lineTo(
            tipX + Math.cos(angle - Math.PI / 2) * 6,
            tipY + Math.sin(angle - Math.PI / 2) * 6
          )
          graphics.lineTo(
            tipX + Math.cos(angle + Math.PI / 2) * 6,
            tipY + Math.sin(angle + Math.PI / 2) * 6
          )
          graphics.lineTo(tailX, tailY)
          graphics.strokePath()
        }
      } else if (type === 'time_stop') {
        graphics.lineStyle(3, accentColor, 0.95)
        graphics.strokeCircle(cx, cy, 16)
        const minuteAngle = rotation
        const hourAngle = rotation * 0.5
        graphics.beginPath()
        graphics.moveTo(cx, cy)
        graphics.lineTo(cx + Math.cos(minuteAngle) * 16, cy + Math.sin(minuteAngle) * 16)
        graphics.strokePath()
        graphics.beginPath()
        graphics.moveTo(cx, cy)
        graphics.lineTo(cx + Math.cos(hourAngle) * 11, cy + Math.sin(hourAngle) * 11)
        graphics.strokePath()
        graphics.fillStyle(accentColor, 0.9)
        graphics.fillCircle(cx, cy, 3)
      }

      graphics.generateTexture(`powerup_${type}_${i}`, size, size)
      graphics.destroy()
    }
  }

  private ensurePowerupBadge(type: string, color: number) {
    const key = `powerup_badge_${type}`
    if (this.textures.exists(key)) return
    const size = 52
    const graphics = this.add.graphics({ x: 0, y: 0 })
    graphics.setVisible(false)
    graphics.clear()
    graphics.fillStyle(color, 0.92)
    graphics.fillRoundedRect(0, 0, size, size, 14)
    graphics.lineStyle(2, 0xffffff, 0.85)
    graphics.strokeRoundedRect(0, 0, size, size, 14)

    graphics.lineStyle(4, 0xffffff, 0.95)
    const cx = size / 2
    const cy = size / 2
    if (type === 'chain_lightning') {
      graphics.beginPath()
      graphics.moveTo(cx - 8, cy - 14)
      graphics.lineTo(cx, cy - 2)
      graphics.lineTo(cx - 6, cy + 4)
      graphics.lineTo(cx + 6, cy + 14)
      graphics.strokePath()
    } else if (type === 'homing_missiles') {
      graphics.beginPath()
      graphics.moveTo(cx - 10, cy + 10)
      graphics.lineTo(cx + 10, cy)
      graphics.lineTo(cx - 4, cy - 10)
      graphics.lineTo(cx - 10, cy + 10)
      graphics.strokePath()
    } else if (type === 'time_stop') {
      graphics.strokeCircle(cx, cy, 14)
      graphics.lineStyle(3, 0xffffff, 0.9)
      graphics.beginPath()
      graphics.moveTo(cx, cy)
      graphics.lineTo(cx, cy - 10)
      graphics.strokePath()
      graphics.beginPath()
      graphics.moveTo(cx, cy)
      graphics.lineTo(cx + 8, cy + 4)
      graphics.strokePath()
      graphics.fillStyle(0xffffff, 0.95)
      graphics.fillCircle(cx, cy, 2)
    }

    graphics.generateTexture(key, size, size)
    graphics.destroy()
  }
}
