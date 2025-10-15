Roadmap för Beat Blaster: Neon Overdrive – v0.5 → v1.0 🚀🎶💥


---

1. Vision & Goals

🎮 Project Title

Beat Blaster: Neon Overdrive
Version Roadmap: v0.5 → v1.0


---

✨ High-Level Vision

Beat Blaster: Neon Overdrive is a rhythm-driven shoot ’em up set in a pulsing, neon-drenched cyber-future where every shot, dodge, and explosion is synced to the beat of the music. The game blends fast-paced arcade combat with reactive visuals, player progression, and evolving mechanics that scale with player skill.

The end goal of v1.0 is to transform the current playable prototype into a complete commercial-ready experience – a game that feels tight, polished, stylish, rewarding, and alive. Every frame, sound, and interaction should feel purposeful, satisfying, and musically synced.


---

🧠 Core Design Philosophy

🎵 “The Beat Is Everything” – Every system in the game (shooting, power-ups, enemy patterns, UI animations) should react to and reinforce the rhythm.

💫 “Flow Over Chaos” – Combat should feel intense but always controlled. Even in chaos, the player should feel in sync with the world.

⚙️ “Player Progression Feeds Mastery” – Skill, upgrades, and knowledge should create exponential depth – easy to learn, hard to master.

🌐 “World as a System” – Menus, levels, campaign map, UI, even achievements should feel like part of one cohesive cyber-world.



---

🚀 Core Goals for v1.0

🥇 Gameplay Goals

Develop a precise beat-synced core loop with rewarding timing mechanics and visual/audio feedback.

Add advanced combat systems (combo meter, perfect-timing multipliers, special abilities).

Introduce dynamic enemy types, mini-bosses, and stage events that react to the soundtrack.


📈 Progression Goals

Implement a player profile system with achievements, stats, and save/load.

Add a full upgrade shop with unlockable weapons, abilities, and cosmetic options.

Build a campaign world map with branching levels, boss fights, and progression paths.


🧭 UI/UX Goals

Complete overhaul of menus and navigation with a mix of minimalist usability and cinematic flair.

Create a cohesive visual language across all interfaces – icons, badges, achievements, upgrades, and map nodes.

Add tutorial layers, accessibility options, and calibration tools for rhythm accuracy.


🪙 Meta & Economy Goals

Introduce an in-game currency system (“BeatCoins”) tied to performance.

Create a shop with progression-based unlockables and clear player choices.

Add daily/weekly challenges and trackable milestones to increase replay value.


🌌 Campaign Goals

Build a global stage map showing the player’s progress across multiple worlds/zones.

Include boss encounters with unique mechanics and music-driven phases.

Add optional story beats / lore entries to give context and motivation.


🧰 Technical & Infrastructure Goals

Refactor project into a modular architecture (core systems, UI, gameplay, audio, etc.).

Implement a robust save/load system for player data, upgrades, and progress.

Create scalable tools for level design, enemy spawning, and beat timing.

Standardize project file structure for future expansion and multiplayer support.



---

📊 Target Outcomes for v1.0

By the time v1.0 ships, the game should include:

✅ Fully playable campaign with 10–15 stages + 2–3 bosses
✅ Dynamic upgrade system with 10+ unlockables
✅ Polished menus, world map, shop, profile, and leaderboards
✅ Advanced beat mechanic with combo scoring, multipliers, and special abilities
✅ Optimized codebase with modular systems ready for v2.0 features (online, events, etc.)


---

🏆 Success Criteria

🎮 Gameplay: Players describe the combat as “tight, reactive, and addictive.”

🎨 Visuals: Every screen looks intentional, stylish, and consistent with the neon synthwave vision.

🧠 Progression: Players feel motivated to replay for upgrades, achievements, and mastery.

🛠️ Tech: Code is modular, scalable, and documented – ready for v2.0 features.

💾 Polish: UI, animations, sound, and feedback feel premium and production-ready.



---

💡 Beat Blaster: Neon Overdrive isn’t just about shooting enemies – it’s about entering a state of flow, syncing with the music, and mastering chaos through rhythm. v1.0 is where the prototype becomes a full-fledged game, and the world of Beat Blaster truly comes alive.


---


2. Core Systems & Current State

(Analysis + Improvement Plan)

🧠 Overview

The current version of Beat Blaster: Neon Overdrive already establishes a strong foundation for a rhythm-based shoot ’em up.
However, many of the systems are still in a prototype state — they work, but they’re either too tightly coupled, lack scalability, or need more feedback loops to feel polished and production-ready.

The purpose of this section is to:

Audit the existing systems and what they currently do well.

Identify weaknesses or missing pieces.

Define how each system should evolve by v1.0.

🎮 2.1 Core Gameplay Loop – Current State

What Exists Now:

Beat detection & timing system that syncs enemy spawns and UI elements to the track.

Basic player movement and shooting controls.

Enemies spawn in rhythmic waves and move along fixed patterns.

Power-ups drop occasionally and affect fire rate, shield, etc.

Bomb mechanic: clears the screen when charged.

Scoring system tied to kills and survival.

Issues / Limitations:

Beat detection is functional but lacks precision windows (perfect, good, miss).

Player feedback (VFX, SFX, UI) is limited – it’s hard to feel the rhythm.

Enemy patterns are predictable and not reactive to music layers.

Bomb mechanic is underused and feels detached from rhythm flow.

Power-ups feel generic and are not tied to player choice or upgrades.

v1.0 Plan:
✅ Add beat-accuracy scoring windows (Perfect / Good / Miss) with combo multipliers.
✅ Implement a Rhythm Ring UI that visually shows timing windows.
✅ Add more enemy AI types and “phase patterns” that react to music intensity.
✅ Redesign bomb mechanic to sync with beat – charging through combos, triggering visual/music climax.
✅ Introduce tiered power-ups and synergy effects (e.g., chain lightning, spread fire, pulse beams).

🧨 2.2 Enemy System

What Exists Now:

Enemy spawner tied to music BPM.

A handful of enemy movement patterns.

Basic projectile and collision logic.

Issues / Limitations:

Behavior is static — enemy waves don’t adapt to player skill or song structure.

No “threat variety”: no shielded, teleporting, or reactive enemies.

Lacks a proper wave design tool for balancing difficulty.

v1.0 Plan:
✅ Modularize enemy behavior into scriptable components (MovementPattern, AttackPattern, SpawnCondition).
✅ Add Reactive AI Types:

Pulse Scouts – fast, dodge player fire.

Bass Shields – shielded enemies weak only on downbeats.

Sync Splitters – split into two smaller enemies if killed off-beat.
✅ Implement a Wave Designer Tool (JSON or editor GUI) to build rhythmic enemy sequences quickly.
✅ Add “Intensity Layers” (low, mid, high) that switch based on track progress.

🔫 2.3 Player System

What Exists Now:

WASD/Arrow movement

Continuous fire

Bomb

Power-up pickups

Issues / Limitations:

Input feels slightly “floaty” – player lacks weight and acceleration.

Collision boxes are too forgiving (reduces challenge).

Power-ups don’t persist across levels.

No loadout customization.

v1.0 Plan:
✅ Rewrite movement with acceleration/deceleration curves for tighter control.
✅ Add dodge/dash mechanic tied to beat window.
✅ Introduce weapon loadouts (choose before mission).
✅ Add passive abilities (e.g., auto-shield, overdrive mode).
✅ Redesign collision boxes and difficulty scaling.

🎯 2.4 Beat & Timing System

What Exists Now:

Core beat detection based on BPM analysis.

Enemy waves spawn on beat.

Some UI elements flash in sync.

Issues / Limitations:

Limited beat subdivisions (only 1/1 or 1/2).

Timing windows aren’t exposed to player visually.

Beat system doesn’t drive enough gameplay elements (e.g., power-ups, abilities).

v1.0 Plan:
✅ Add Beat Window API:

onBeat(cb)

onSubBeat(n, cb)

isWithinWindow(ms)

✅ Expand beat resolution to include 1/4, 1/8, syncopation.
✅ Tie more systems into beat events:

Shield recharge on beat

Ability cooldown resets

Visual/audio sync cues
✅ Integrate with combo system and scoring multipliers.

📊 2.5 Scoring & Combo System

What Exists Now:

Basic score system.

No multipliers or bonus criteria.

Issues / Limitations:

Lacks depth and doesn’t reward skillful play.

No risk/reward mechanics tied to accuracy.

v1.0 Plan:
✅ Add combo multiplier system based on Perfect streaks.
✅ Add bonus scores for:

Flawless section clears

Boss kill on beat

Surviving waves without taking damage

✅ Add leaderboard-relevant metrics:

Accuracy %

Highest combo

Fastest clear time

🪙 2.6 Economy System (Placeholder)

What Exists Now:

Basic score, no currency.

v1.0 Plan:
✅ Introduce BeatCoins (earned from performance).
✅ Connect to shop and upgrade purchases.
✅ Add bonus multipliers for higher difficulties or Perfect runs.

📁 2.7 Save & Profile System

What Exists Now:

Basic profile data storage.

v1.0 Plan:
✅ Store:

Upgrades

Currency

High scores

Completed stages

Settings

✅ Enable multiple profiles.
✅ Add save auto-backup and reset options.

📦 2.8 Technical Gaps to Address

SystemIssuev1.0 SolutionBeat DetectionNot modular / limited timing windowsFull Beat API w/ window exposurePlayer ControlFloaty / inconsistent feelRewrite with acceleration + dashEnemy AIPredictable patternsModular AI with reactive phasesScoreFlat scoringCombos, multipliers, bonusesUI FeedbackMinimalRhythm indicators, hit accuracy, on-beat HUDProgressionNoneProfiles, save data, unlockable upgradesEconomyMissingBeatCoin system linked to performance 

✅ Summary:
The current prototype is a solid foundation, but many systems need to evolve from “functional” to “dynamic, modular, and interconnected.”
The goal by v1.0 is that every subsystem talks to the beat, every player action feels meaningful, and every mechanic feeds into progression.



3. UI / UX Roadmap

(Menus, Navigation, Profiles, Shop, World Map, Visual Language)

🎨 3.1 Core UI Philosophy

The UI in Beat Blaster: Neon Overdrive should do two things at once:

Stay minimal, fast, and functional – so players can focus on the rhythm and combat.

Feel cinematic and alive – moving, pulsing, and glowing to the beat.

It’s not just about menus – every interface, HUD element, button and icon should feel like it’s part of a cohesive, reactive neon world.
The UI is part of the rhythm – not a static layer on top of it.

📁 3.2 Main Menu – “Neon Command Deck”

Goals

Create a clean, intuitive entry point into the game.

Give a cinematic feel without overwhelming the player.

Offer quick access to all major systems: Play, Profile, Shop, Settings, and Exit.

Structure

SectionPurpose🎮 PlayStart new campaign, continue saved game, quick start arcade mode🪪 ProfileView stats, achievements, change avatar, loadout🪙 ShopBuy upgrades, weapons, cosmetics🌌 World MapCampaign progression overview⚙️ SettingsControls, audio, graphics, accessibility 

UX Design Notes:

Top-Level Navigation: Vertical list or rotating carousel.

Dynamic Background: Animated cityscape or waveform reacting to background music.

Shortcuts: 

Enter = Quick Start

P = Profile

S = Shop

Interaction Feedback:

Buttons pulse gently on hover (scale 1.0 → 1.05).

Selection plays a “click-beat” sound synced with the current BPM.

Menu transitions fade and scale in with rhythmic easing curves.

📊 3.3 Player HUD (In-Game UI)

Goals

Deliver critical gameplay info without clutter.

Visually reinforce rhythm and timing.

Provide satisfying feedback for skillful play.

HUD Elements

ElementDescription🩸 Health / Shield BarTop-left. Reactive to beat (pulses on each measure).🔫 Weapon IndicatorShows current weapon and power level.🔥 Combo MeterCenter-top. Increases with perfect hits. Flash effect when multiplier grows.🎯 Accuracy RingAround player ship – changes color (red/yellow/green) based on hit timing.💥 Bomb MeterBottom-right. Fills with combo hits, flashes when ready.🪙 BeatCoinsSmall UI chip bottom-left – shows earnings per run. 

UX Improvements:

Perfect/Good/Miss Pop-ups: Floating text near the player’s ship.

Beat Pulse FX: Subtle HUD pulsation synced to music peaks.

Combo Announcer: “x5 COMBO!” pops up mid-screen on milestone streaks.

🧭 3.4 World Map UI – “Neon Sector Grid”

Goals

Make progression visual, exciting, and motivating.

Let players navigate campaign stages like a galactic mission map.

Tie into story beats and difficulty scaling.

Structure

Sector View: Each campaign world is a “sector” of the galaxy.

Nodes: Levels, bosses, and bonus missions are represented as connected neon nodes.

Completion Indicators: 

✅ Cleared

🔒 Locked

⭐ Rated (1–3 stars for performance)

Features:

Hover Info: Shows score, best combo, accuracy, unlocks.

Zoom Levels: 

Galaxy view – overview of all sectors.

Sector view – zoomed-in node network.

Story Events: Some nodes trigger cutscenes or lore fragments.

Navigation:

Keyboard / gamepad D-pad for node selection.

Mouse hover + click (if desktop).

“Auto-path” option: Press Space to jump to next unlocked level.

🪪 3.5 Player Profile UI

Goals

Create a sense of identity and long-term progression.

Let players customize their avatar and track their journey.

Features:

Avatar Selector: Unlockable avatars (ships, pilots, AI cores).

Stats Dashboard: 

Total play time

Best accuracy

Highest combo

Total enemies destroyed

Bosses defeated

Achievements Gallery: Grid layout with locked/unlocked states.

Title System: Unlock player titles (e.g., Beat Master, Pulse Runner).

UX Notes:

Avatar Animations: Avatars react to cursor hover.

Achievements: Play unlock sound + glow burst when achieved.

Stat Cards: Animated number count-ups for total stats.

🛍️ 3.6 Shop UI – “Pulse Forge”

Goals

Provide a clean and satisfying upgrade experience.

Visually emphasize progression and choice.

Support multiple categories and currencies.

Categories:

🔫 Weapons – New fire modes, spread types, lasers.

🛡️ Defense – Shields, dash upgrades, resistances.

🧠 Abilities – Slow-mo, beat burst, overdrive.

🎨 Cosmetics – Ship skins, glow trails, avatars.

UI Layout:

Grid of Cards: Each item = image, name, description, price, and upgrade level.

Comparison Panel: Shows current stats vs. post-upgrade.

Confirm Modal: “Purchase X for Y BeatCoins?”

Feedback: 

Successful purchase = neon burst + coin drain animation.

Insufficient funds = red pulse + error sound.

🛠️ 3.7 Settings & Accessibility UI

Features:

Audio sliders (music, SFX, master).

Control remapping.

Screen shake & motion toggle.

Colorblind modes (deuteranopia/protanopia-friendly palettes).

Latency calibration (press key on beat to sync input window).

📣 3.8 Menus & Navigation Flow (Recommended UX Hierarchy)

Main Menu ├─ Play │ ├─ New Campaign │ ├─ Continue │ └─ Quick Arcade ├─ World Map │ └─ Sector / Stage Selection ├─ Profile │ ├─ Stats │ ├─ Achievements │ └─ Avatar / Title ├─ Shop │ ├─ Weapons │ ├─ Defense │ ├─ Abilities │ └─ Cosmetics └─ Settings ├─ Audio ├─ Controls ├─ Accessibility └─ Calibration 

✅ Summary:
The UI/UX of Beat Blaster: Neon Overdrive must be fast, intuitive, stylish, and reactive. It should never get in the player’s way – instead, it should enhance immersion by becoming part of the rhythm, the vibe, and the sense of flow.

Menus are no longer static screens – they’re in-world interfaces that glow, pulse, and react to the same beat the player is fighting to.



4. Gameplay Mechanics & Advanced Features

(Combat Depth, Rhythm Systems, Abilities, Boss Design, Events)

🧠 4.1 Core Gameplay Philosophy

The soul of Beat Blaster: Neon Overdrive is built on a single mantra:

🎵 “Everything must move to the music.” 🎵

Every shot, dash, explosion, enemy spawn, and even upgrade choice should connect back to the beat.
Gameplay depth is achieved not by adding complexity but by weaving mechanics into a layered rhythm system that rewards precision, mastery, and flow.

🔥 4.2 Rhythm & Timing Systems

🕒 Beat Windows

Perfect: ±30 ms → Highest score, +combo, bonus BeatCoins.

Good: ±75 ms → Normal score.

Miss: >±75 ms → Combo reset, penalty.

✅ Gameplay Impact:

Combos grow faster with more Perfect hits.

Certain abilities trigger only on Perfect timing.

Enemy types react differently if shot on/off beat.

🎯 Combo & Multiplier System

Combo increases with consecutive Perfect or Good hits.

Every 10x combo = +0.1x global score multiplier.

Combo breaks if player misses a beat or takes damage.

“Combo Fever” – At 100x combo, trigger temporary Overdrive mode (faster fire, slow-motion, score x2 for 10s).

🥁 Beat-Driven Environment

Background layers pulse with the music’s frequency bands.

Some obstacles open or close on certain beats.

Bosses enter new attack phases when the track drops or transitions.

💫 4.3 Special Abilities System

Abilities are unlockable skills that give the player tactical options beyond basic shooting. They are beat-tied — activating them on-beat increases their power or reduces cooldown.

AbilityEffectOn-Beat Bonus⚡ Pulse DashQuick invulnerable dash in movement directionDouble dash distance🔥 Overdrive+50% fire rate and damage for 8s+75% if activated on downbeat🛡️ Beat ShieldAbsorbs next 3 hitsReflects damage if triggered on beat💥 Blast NovaRadial AOE burst clearing enemiesBigger radius if perfectly timed🌀 Tempo ShiftSlows enemies and projectiles for 5sFreezes them completely for 1s on beat 

✅ Each ability has a cooldown (10–45s) and can be upgraded in the shop.
✅ Abilities appear in a radial UI overlay with beat-reactive icons.
✅ Activating abilities slightly affects the track visuals – e.g., waveform distortions.

🔫 4.4 Weapon System & Loadouts

Weapons are no longer static — they evolve through upgrades, unlocks, and synergy.

Weapon Categories

WeaponDescriptionSpecial Feature🔫 Pulse BlasterRapid-fire, balanced weaponHigh combo gain🔥 Wave CannonSlow but heavy shotsKnockback on Perfect hits⚡ Split BeamFires two projectiles diagonallyRicochet on walls🧨 Bass BombsExplosive projectiles with splashSyncs with bass hits🔥 Beat SlicerShort-range laser sweepDamage scales with combo 

✅ Players can equip one main and one secondary weapon.
✅ Certain weapon combos unlock synergy effects (e.g., Split Beam + Tempo Shift → Chain Lightning).
✅ Weapons evolve visually with upgrades (glow intensity, particle effects, shot color).

🧟‍♂️ 4.5 Enemy Types & Behaviors

Adding enemy diversity creates layers of challenge and encourages tactical thinking.

EnemyBehaviorBeat Interaction🐍 Tempo DronesSlow, predictable patternsSpawn on every beat⚡ Pulse ScoutsFast, evasive movementDodge shots off-beat🛡️ Bass GuardsShielded except on downbeatsVulnerable on bass hits🧬 Sync SplittersSplit into two smaller enemies if killed off-beatBonus if destroyed perfectly🌀 Phase WeaversTeleport between lanesBlink frequency follows hi-hats 

✅ Mini-boss variants: larger HP, multiple phases, reactive behavior.
✅ Enemy spawns are defined in wave JSON files with timing data synced to the track.

💀 4.6 Boss Mechanics & Phases

Boss fights should feel like musical duels — evolving as the song evolves.

Boss Design Principles:

Multi-phase fights tied to music sections (intro, verse, chorus, drop).

Attacks telegraphed visually and musically (build-up before blast).

Unique mechanics per boss (shield puzzles, beat-matching attacks, lane swaps).

Example Boss: “SYNCOPATE PRIME”

🌀 Phase 1: Standard bullet-hell pattern synced to beat.

⚡ Phase 2: Teleport + summons minions every 8 beats.

🧨 Phase 3: Track drop – arena transforms, adds environmental hazards.

💥 Finale: Timed “beat duel” – deflect 16 beats perfectly to finish the fight.

🌀 4.7 Dynamic Events & Stage Modifiers

To keep runs fresh and replayable, introduce dynamic modifiers that change stage flow.

ModifierDescription🌪️ Beat SurgeBPM temporarily increases by 10-15%. Faster enemies, higher score multiplier.🔥 OverloadAll enemy projectiles double in speed for 10s.🧨 Power SurgeAll player shots explode on impact.🧠 Sync LockOnly Perfect hits deal damage for 20s.🪩 Neon BloomScreen pulses heavily with music, distorting enemy visibility. 

✅ Random modifiers appear 1–2 times per stage.
✅ Some modifiers are tied to difficulty or daily challenges.

🧱 4.8 Difficulty Scaling

Difficulty is determined dynamically based on:

BPM and track intensity

Player accuracy and combo performance

Stage progression (later stages introduce more enemies per wave)

Player upgrades and equipped abilities

Difficulty Tiers:

🟢 Casual: Wider timing windows, slower spawns.

🟠 Standard: Normal beat windows, mixed enemy types.

🔴 Hardcore: Tight windows, reactive enemies, frequent modifiers.

🟣 Zenith: Double BPM, no Good hits count — Perfect or nothing.

✅ Summary:
By v1.0, the gameplay experience should feel alive — not just reactive but symphonic.
The player isn’t just shooting enemies; they’re conducting a battle to the beat, mastering timing, chaining abilities, and adapting to dynamic threats.
Every successful run should feel like playing a song perfectly, and every miss like hitting a wrong note.


5. Upgrade Shop & Economy

(Currency, Progression Systems, Purchases, Unlockables, Balancing)

🪙 5.1 Core Philosophy

The upgrade and economy system in Beat Blaster: Neon Overdrive should do mer än bara låta spelaren köpa starkare saker. Det ska:

🧠 Reward skill – bättre spelare tjänar mer valuta, låser upp mer.

🔁 Encourage replayability – varje run bidrar till progression.

🔧 Enable customization – spelaren formar sin spelstil med val.

📈 Create milestones – stora uppgraderingar ska kännas som framsteg, inte bara siffror.

💸 5.2 Currency System – “BeatCoins”

Earning BeatCoins

SourceDescriptionAvg. Payout🎮 Stage CompletionReward for clearing a level250–800 BC💥 Combo PerformanceBonus for maintaining long combos50–300 BC🥇 AccuracyBonus for >90% perfect hits100 BC💣 Boss DefeatExtra payout per boss phase cleared300–500 BC📆 Daily ChallengeFlat reward for completion500 BC🌟 AchievementsOne-time payouts100–1000 BC 

On-Beat Bonus:
If more than 70% of actions are timed Perfect, total currency is multiplied by 1.25×.

Difficulty Multiplier:

Casual: ×1.0

Standard: ×1.25

Hardcore: ×1.5

Zenith: ×2.0

🏪 5.3 Shop Categories

The shop is divided into 4 core categories to match different types of progression:

CategoryDescription🔫 WeaponsNew weapon types and projectile behaviors🛡️ DefenseShields, HP, dodge upgrades🧠 AbilitiesActive skills and cooldown reducers🎨 CosmeticsAvatars, ship skins, glow trails 

🔫 5.4 Weapon Upgrades

Each weapon has 3–5 upgrade levels, each improving one or more properties.

WeaponUpgrade PathEffectPulse Blaster+Fire Rate, +Damage, +Combo GainRapidly scales into late gameWave Cannon+AOE Radius, +Impact DamagePerfect for crowd controlSplit Beam+Projectile Count, +RicochetBounces increase with levelBass Bombs+Explosion Size, +Beat Sync DamageDeals bonus damage on downbeatsBeat Slicer+Length, +Damage ScalingIncreases with combo multiplier 

✅ Unlock Condition: Some weapons require boss defeats or achievements to purchase.
✅ Each weapon visually evolves as it’s upgraded.

🛡️ 5.5 Defense Upgrades

UpgradeMax LevelEffectShield Capacity5+1 hit per levelShield Regen Speed3-20% cooldown per levelDash Distance3+15% per levelDash Cooldown3-10% cooldown per levelAuto-Heal Module1Recover 10% HP after each stage 

🧠 5.6 Ability Upgrades

AbilityMax LevelUpgrade EffectsPulse Dash3+distance, -cooldownOverdrive3+duration, +damageBeat Shield3+hits absorbed, +reflect chanceBlast Nova3+radius, +damageTempo Shift3+duration, +slow strength 

✅ Abilities can also gain “Beat Mods” — passive bonuses if activated perfectly.
e.g., Overdrive + Beat Mod = instantly restores bomb meter when triggered on beat.

🎨 5.7 Cosmetic Store (Optional Layer)

Purely visual – does not affect gameplay.

Ship Skins: Unlockable hull designs, glow colors.

Glow Trails: Different particle effects behind the ship.

Avatars: Player profile icons.

Victory Emotes: End-of-stage animations.

✅ Unlock with BeatCoins or by completing specific achievements.

📦 5.8 Item Unlock Requirements (Meta Progression)

To add depth and replay value, some items unlock only after certain milestones:

ConditionUnlocksDefeat 3 bossesNew weapon type100 Perfect Hits in one runAbility upgrade tier1,000 total killsRare ship skinComplete World 1Unlock World 2 shop tierReach Rank S on 5 levelsElite upgrades 

📈 5.9 Shop UI / UX Details

Item Card Layout: Icon, name, description, price, level.

Preview Panel: Shows before/after stats and beat effects.

Purchase Animation: Coin drain + glow pulse.

Feedback States: 

Insufficient funds: red shake + “Error” SFX

New unlock available: glowing border around category

📊 5.10 Balancing & Economy Design

Balancing currency is crucial so that progression feels rewarding but not trivial.

Average player should afford 1–2 upgrades per stage.

Completing ~10 stages should unlock a major weapon or ability.

Cosmetics should be more expensive to maintain long-term goals.

Example Progression Curve (Standard Mode):

Level 1: ~400 BeatCoins

Level 5: ~1200 BeatCoins

Level 10: ~2500 BeatCoins

Boss: ~3000+ BeatCoins

🪙 5.11 Future-Proofing the Economy

The system should easily support future expansions:

Secondary currencies (e.g., Neon Cores from bosses).

Limited-time events and special store rotations.

Trade-in / respec options for refunding upgrades.

✅ Summary:
The upgrade shop isn’t just a “store” — it’s the player’s progression engine. It gives every run a long-term purpose, lets players experiment with builds, and keeps the reward loop flowing.
By v1.0, the shop and economy should be integral to the gameplay loop — not an optional extra.


6. World Map & Campaign Progression

(Stage Structure, Progression Flow, Boss Placement, Difficulty Curve)

🌌 6.1 Core Concept – “The Neon Grid”

The World Map isn’t just a level selector – it’s the heart of the campaign and a visual representation of the player’s journey through the game’s universe.
It should feel alive, reactive, and deeply tied to the beat, giving the player a sense of scale, purpose, and momentum as they progress.

🪐 6.2 Campaign Structure

The campaign is divided into sectors (worlds), each with a distinct theme, visual identity, difficulty curve, and boss encounter.
Each sector contains 4–6 stages plus a boss level.

SectorThemeStagesBossDifficulty1️⃣ Neon GenesisCore City5 + Boss“SYNCOPATE PRIME”🟢 Easy2️⃣ Chromatic RiftSpace Station5 + Boss“BASS TITAN”🟠 Medium3️⃣ Harmonic DunesDesert Circuit6 + Boss“TEMPO LICH”🟠 Medium4️⃣ Pulse NexusDeep Core Reactor6 + Boss“WAVE JUDGE”🔴 Hard5️⃣ Echo FrontierOuter Rim Void7 + Final Boss“OMNI-FLOW”🟣 Very Hard 

✅ Total: ~30+ stages (including bosses)

🧭 6.3 World Map Layout

Visual Style

A glowing neon galaxy grid, divided into connected nodes.

Each node = one stage. Completed nodes glow; locked nodes are dim.

Boss nodes pulsate with their own rhythm and particle effects.

Background evolves as the player progresses — from dense cityscapes to deep space.

Node States

🔒 Locked: Beat previous stage to unlock.

🟡 Available: Ready to play.

✅ Cleared: Completed at any rank.

⭐ Mastered: Cleared with S-rank or 100% accuracy.

Navigation

Keyboard/Gamepad: Arrow/D-pad to move between nodes.

Mouse: Hover over nodes for stage preview.

Shortcut: Press Space to jump to next available level.

📈 6.4 Progression Flow

Stage Types

TypeDescriptionReward🔫 StandardMain gameplay stage, introduces new enemies/mechanicsBeatCoins + XP💥 ChallengeOptional side level with strict conditions (e.g. “No damage”)Bonus BeatCoins🧠 LoreShort interactive story or dialogue sceneCosmetic unlock⚙️ Upgrade TrialTimed run with fixed gear – tests masteryUnique ability mod🏆 BossMajor encounter with multiple phasesUnlock next sector 

📜 6.5 Story / Lore Hooks (Optional)

A light story thread can connect the worlds and give more context and motivation without requiring heavy narrative content.

The player is an autonomous AI pilot trying to restore “The Flow” — the universe’s rhythmic heartbeat — disrupted by hostile Noise Entities.

Each boss represents a corrupted musical concept (Tempo, Bass, Harmony, Wave, Flow).

Optional lore nodes unlock text logs, hologram messages, or AI monologues between missions.

✅ This layer is 100% optional but adds depth and identity to the world.

🗺️ 6.6 Stage Progression Design

Each stage should introduce a new concept, mechanic, or challenge type.
The campaign’s pacing should follow a “teach – test – master – combine” design arc:

Teach: Introduce a new mechanic or enemy type in isolation.

Test: Combine it with previous ones under mild pressure.

Master: Increase intensity or add modifiers.

Combine: Mix multiple mechanics into complex scenarios.

Example Flow:

Stage 1: Basic enemies & beat tutorial

Stage 2: Introduce Pulse Scouts (evasive enemies)

Stage 3: Add obstacles & timing hazards

Stage 4: Layer multiple enemy types

Stage 5: Mini-boss challenge

Stage 6: Full-scale boss fight

🧪 6.7 Dynamic Progression Systems

To make the campaign more replayable and scalable:

⭐ Stage Ranking

Each stage assigns a rank based on performance:

S – 90%+ accuracy, no damage

A – 80%+ accuracy

B – 65%+ accuracy

C – Completed

Higher ranks yield more BeatCoins and cosmetic unlocks.

🪩 Difficulty Scaling

Players can replay cleared stages on higher difficulties to earn bonus rewards.
Higher difficulty unlocks additional enemy types and faster BPM modifiers.

🪐 6.8 World Events & Challenges (Optional Expansion)

To extend the campaign beyond completion:

Daily Missions: Random stage modifiers and bonus rewards.

Sector Challenges: Time-limited high-score competitions.

Endless Mode: Infinite stage scaling with increasing BPM.

✅ Summary:
The world map transforms the linear stage list into a living galactic rhythm grid.
It gives context, purpose, and anticipation — players see where they’re heading, what’s left to conquer, and how far they’ve come. Each node is a milestone, each sector a chapter, and each boss a musical showdown.



7. Technical Architecture & File Structure

(modules, data-driven configs, timing, performance, testing, build & ops)

7.1 Architectural style (high-level)

Goals: modular, data-driven, testable, low-GC, beat-first.

Layered + feature-modular: 

core/: engine-agnostic utilities (timing, math, event bus).

audio/: beat/timing analysis, music sync.

gameplay/: player, enemies, weapons, abilities, waves, bosses.

ui/: HUD, menus, world map, shop, profile.

systems/: save, economy, achievements, telemetry (optional).

content/: JSON data for levels, waves, items, worlds.

Event-driven via a lightweight EventBus to decouple systems.

Data-driven configs (JSON/Scriptable-like in TS): weapons, enemies, waves, worlds, shop.

Object Pooling for projectiles, popups, particles.

Deterministic beat timeline: one source of truth (dsp-like timer) → everyone subscribes.

7.2 Folder structure (TypeScript / Phaser project)

/src /core EventBus.ts Time.ts // fixed update tick, delta smoothing Pool.ts // generic object pool RNG.ts // seeded rng for replays Types.ts // shared types /audio BeatClock.ts // dsp-like timer; onBeat, onSubBeat BeatAnalyzer.ts // bpm/offset; optional precomputed MusicService.ts // track control (play/pause/seek) LatencyCalibrator.ts /systems SaveService.ts ProfileService.ts EconomyService.ts AchievementService.ts DifficultyService.ts LeaderboardService.ts (stub/local now) Telemetry.ts (optional, no-op in dev) /gameplay /player PlayerController.ts InputBindings.ts Dash.ts HealthShield.ts Loadout.ts /combat Weapon.ts (base) weapons/ PulseBlaster.ts WaveCannon.ts SplitBeam.ts BassBomb.ts BeatSlicer.ts Projectile.ts Damage.ts Ability.ts (base) + abilities/ PulseDash.ts Overdrive.ts BeatShield.ts BlastNova.ts TempoShift.ts /enemies Enemy.ts (base) behaviors/ MovePattern.ts AttackPattern.ts TeleportPattern.ts ShieldBehavior.ts spawner/ WaveRunner.ts WaveParser.ts /boss Boss.ts BossPhase.ts SyncopePrime.ts (example) /fx HitFlash.ts ScreenShake.ts Particles.ts Trails.ts /ui /hud HUDRoot.ts ComboMeter.ts RhythmRing.ts BossBar.ts Toasts.ts /menus MainMenu.ts ProfileView.ts ShopView.ts SettingsView.ts LeaderboardView.ts /worldmap WorldMapScene.ts NodeGraph.ts NodeCard.ts /scenes BootScene.ts PreloadScene.ts MainMenuScene.ts GameScene.ts WorldMapScene.ts ShopScene.ts ProfileScene.ts /config game.config.json audio/ tracks.json // id, bpm, offset, sectors worlds/ world1.json // nodes/edges world2.json waves/ w1_l1.json // enemy spawns per beat shop/ items.json enemies/ types.json // hp, speed, behaviors weapons/ weapons.json // base stats, upgrade curves /utils Mathf.ts Easing.ts Colors.ts RectGrid.ts index.ts types.d.ts /assets /sprites /ui /audio /fx /tests unit/ integration/ /docs DEVELOPMENT_PLAN.md // (this doc, when exported) 

7.3 Event Bus (decoupling)

Minimal pub/sub to avoid spaghetti deps.

// core/EventBus.ts type EventMap = { 'beat:tick': { beat: number, bar: number }, 'beat:window': { msLeft: number }, 'combo:changed': { value: number, mult: number }, 'player:hit': { hp: number }, 'currency:changed': { delta: number, total: number }, 'stage:completed': { id: string, rank: string, stats: RunStats }, }; export class EventBus<T extends Record<string, any>> { private m = new Map<keyof T, Set<(p: any)=>void>>(); on<K extends keyof T>(k: K, cb: (p: T[K])=>void) { if (!this.m.has(k)) this.m.set(k, new Set()); this.m.get(k)!.add(cb); return () => this.m.get(k)!.delete(cb); } emit<K extends keyof T>(k: K, p: T[K]) { this.m.get(k)?.forEach(cb => cb(p)); } } export const bus = new EventBus<EventMap>(); 

Usage:

BeatClock emits beat:tick & beat:window

ComboMeter listens combo:changed

EconomyService listens stage:completed → awards coins

HUD listens to many, but never calls gameplay directly.

7.4 Beat & timing design

BeatClock drives a fixed beat timeline based on track BPM + offset (calibrated).

Exposes: 

onBeat(cb), onSubBeat(division, cb)

isWithinWindow(ms) for Perfect/Good

getBeatProgress() for UI arcs (RhythmRing)

LatencyCalibrator stores inputOffsetMs per device/profile.

All timing-critical actions (combo increments, ability bonuses) check BeatClock.

7.5 Data-driven content (JSON schemas)

Keep configs versioned & validated.

Weapon (weapons.json):

{ "id": "split_beam", "name": "Split Beam", "base": { "dmg": 6, "firerate": 4.5, "projectiles": 2 }, "upgrades": [ {"dmg": +2}, {"projectiles": +1}, {"ricochet": true} ], "beatMods": { "perfectBonusDmgPct": 25 } } 

Enemy (enemies/types.json):

{ "id":"bass_guard", "hp": 40, "speed": 120, "behaviors": ["shield_on_offbeat","shoot_every_2beats"] } 

Wave (waves/w1_l1.json):

{ "track":"neon_kick_01", "bpm":128, "offsetMs":38, "spawns":[ {"atBeat":4, "type":"tempo_drone", "lane":2, "count":5, "intervalBeats":0.5}, {"atBeat":12, "type":"bass_guard", "lane":"any", "count":3} ] } 

World (worlds/world1.json):

{ "id":"w1", "name":"Neon Genesis", "nodes":[ {"id":"w1.l1","neighbors":["w1.l2"],"track":"neon_kick_01"}, {"id":"w1.l2","neighbors":["w1.l3"]}, {"id":"w1.boss","boss":true} ] } 

Shop (shop/items.json):

[ {"id":"dmg","type":"stat","target":"weapon","key":"dmg","levels":[2,2,3],"price":[200,350,600]}, {"id":"shield","type":"stat","target":"player","key":"shield","levels":[1,1,1],"price":[300,500,800]} ] 

Validate with zod or ajv at load → clean errors early.

7.6 Services (single-responsibility)

SaveService: load/save profiles (JSON), versioned schema, migration steps.

ProfileService: active profile, stats, settings, avatar, achievements.

EconomyService: currency math, difficulty multipliers, session earnings.

AchievementService: counters, thresholds, unlock events.

DifficultyService: computes live difficulty from BPM + player skill.

LeaderboardService: local storage now; API-ready for future.

Telemetry (optional): pluggable no-op in dev; events buffered & flushed.

All services are DI-injected (simple manual DI): pass instances to scenes/constructors or export factory that takes config.

7.7 Scenes & lifecycle (Phaser)

BootScene → load minimal fonts, config.

PreloadScene → pack loading, audio decode, data JSON parse/validate.

MainMenuScene → menu nav, background VFX (beat-reactive even here).

WorldMapScene → node graph; on select → GameScene.

GameScene → constructs GameController which wires: 

BeatClock, WaveRunner, PlayerController, Pool, HUDRoot

Subscribes to EventBus, disposes on shutdown

ShopScene, ProfileScene → pull from services, never from gameplay.

Important: isolate gameplay logic from scene objects (thin scenes, fat controllers).

7.8 Performance strategy

Pooling: projectiles, particles, floating texts, damage popups.

Avoid GC in hot paths: reuse vectors, pre-alloc arrays, typed arrays where helpful.

FixedUpdate (simulation) decoupled from render framerate (e.g. 120hz sim cap).

Culling: deactivate offscreen enemies; cap active projectiles per frame on low-end.

Cheap shaders: limit full-screen post FX on low hardware; toggle via Settings.

Profiling: built-in profiler + frame budget targets: 

CPU main-thread: < 6ms avg @1080p

GC alloc/frame: ~0 in hot loops

Draw calls: keep < 1.5k typical

7.9 Input & feel

InputBindings via unified map (keyboard/gamepad).

Sticky lanes / hysteresis: snap & deadzones to make it feel “magnetic”.

Dash respects beat: shorter off-beat, longer on-beat.

Aim (if added later) uses assist within small cone on-beat.

7.10 Save format & versioning

profiles.json

{ "schema": 3, "current": "rickard", "profiles": [{ "id": "rickard", "name":"Rickard", "avatar":"neon_pilot_02", "settings":{"music":0.8,"sfx":0.9,"offsetMs":-12,"bloom":true}, "progress":{"world":"w1","cleared":["w1.l1"],"stars":{"w1.l1":2}}, "stats":{"bestScore":132450,"perfectHits":845,"playTimeSec":4821}, "currency":740, "upgrades":{"dmg":1,"firerate":2,"shield":1}, "unlocks":{"weapons":["split_beam"],"abilities":["overdrive"]} }] } 

Schema migrations: SaveService.migrate(from,to) with steps logged.

Auto-backup: keep profiles.bakN.json (ring buffer).

Integrity: checksum per profile block (optional lightweight).

7.11 Testing strategy

Unit tests (vitest/jest): 

BeatClock (edge timing, sub-beats, windows)

Combo math, scoring, rank calculation

WaveParser → deterministic spawns

Economy math (difficulty multipliers, payouts)

Save migrations

Integration tests: 

Run simulated levels (headless) with seeded RNG → assert events order.

Goldens: 

Snapshot HUD states for common scenarios.

CI (GitHub Actions):

npm ci

npm run lint && npm run test

Build artifacts for web (vite) on main and tag releases.

7.12 Logging & diagnostics

Log levels: debug/info/warn/error, toggled by querystring (?debug=1).

Overlay (dev): beat phase, FPS, objects count, pools usage.

Replay dump (optional): record input + RNG seed for determinism; replay for bugs.

7.13 Asset pipeline

Texture atlases with sensible paging (HUD vs gameplay atlases).

Audio: preload stems (optional later), ensure peak-normalized tracks.

Named imports via manifest JSON → hashed filenames for cache-busting.

Theming: /assets/themes/{neon}/… with same sprite contracts.

7.14 Accessibility & settings plumbing

UI scale factor (≥1.0–1.5).

Colorblind-safe palette toggle (swap Good/Perfect colors + pattern in RhythmRing).

Screen shake/motion intensity sliders.

Latency calibration writes offsetMs → BeatClock compensates globally.

7.15 Security & future online

Keep LeaderboardService local now; design API interface: 

submitScore(stageId, payload)

getTop(stageId, bucket)

Sanitize profile names; never eval JSON configs (validate w/ schema).

If/when backend: sign payloads, basic anti-cheat sanity checks.

7.16 Build targets

Web (primary): Vite build, static hosting.

Desktop (optional later): Electron/Tauri wrapper; same codebase.

Keep platform abstraction light: only MusicService & FS differ.

✅ Summary:
Det här ger dig en ren, modulär och data-driven grund där rytmen är systemets nav. Alla delar kan utvecklas parallellt (UI, shop, bossar, waves) utan att trampa varandra på tårna — och vi bygger in testbarhet, prestanda och framtida online-stöd från start. Neon-snyggt och ingen spagetti. Mmm 😌💅



8. Detailed Sprint Roadmap (v0.5 → v1.0)

Cadence: 2-week sprints · Branching: main (stable), dev (integration), feature branches feat/*
Build gates: lint + unit tests green → merge to dev; playable smoke test → merge to main

Sprint 1 — Beat Core & HUD v2 (v0.6)

Theme: make rhythm king again 👑

Objectives

Bygga BeatClock API med exakta tajmningsfönster.

Leverera HUD v2 med Rhythm Ring, combo och bas-KPIs.

Grunda EventBus och koppla UI ←→ systems.

Tasks

(M) core/EventBus.ts (pub/sub + typings).

(M) audio/BeatClock.ts: onBeat, onSubBeat(n), isWithinWindow(ms), getBeatProgress().

(S) audio/LatencyCalibrator.ts + setting offsetMs.

(M) ui/hud/RhythmRing.ts (arc + Perfect/Good window).

(S) ui/hud/ComboMeter.ts (+ popup milestones).

(S) ui/hud/HUDRoot.ts (Score, Health/Shield, Bomb meter placeholders).

(S) fx/HitFlash.ts, (S) fx/ScreenShake.ts (light).

(M) Wire: Player fire checks BeatClock.isWithinWindow.

(S) Unit tests: BeatClock edge cases, combo math.

Dependencies

None (greenfield). Music playback stub OK.

Acceptance Criteria

Perfect window default ±30ms (configurable), Good ±75ms.

Rhythm Ring anim synkad med låten (tolerans ≤ ±10ms visuellt).

Combo ökar endast på Good/Perfect, bryts på Miss/damage.

No GC spikes i hot loop; 60+ FPS @1080p baseline.

Sprint 2 — Player Feel, Dash & Collisions (v0.62)

Theme: tight controls, baby 💅

Objectives

Tighta rörelser (acc/decay), lane-snap/hysteresis.

Beat-buffad Dash (on-beat längre / off-beat kortare).

Rensa upp kollisionsboxar och skada.

Tasks

(M) gameplay/player/PlayerController.ts: acc/decay curves, clamp, smoothing.

(S) gameplay/player/InputBindings.ts (kb/gamepad map).

(M) gameplay/player/Dash.ts: i-frames, cooldown, on-beat modifier.

(S) gameplay/player/HealthShield.ts: shield hits, recharge timer.

(M) Precisa colliders (hurtbox < spritedeck).

(S) Tune camera follow + tiny screenshake on dmg.

Dependencies

Sprint 1 BeatClock event för on-beat dash bonus.

Acceptance Criteria

8-way movement känns “magnetisk” (ingen drift >1px/s).

Dash: 12f i-frame, +40% distance on Perfect-beat.

Hitboxes: 90% av perceived shape; inga “osynliga träffar”.

60+ FPS i fight med 50 projektiler samtidiga.

Sprint 3 — Enemy System v1 & Wave Runner (v0.68)

Theme: orkestrerade vågor 🎼

Objectives

Modulär fiendearkitektur: move/attack patterns.

Data-driven WaveRunner (JSON) per beat.

3 fiendetyper: Tempo Drone, Pulse Scout, Bass Guard.

Tasks

(M) enemies/Enemy.ts (base, hp, onHit, onDeath).

(M) behaviors: MovePattern.ts, AttackPattern.ts, ShieldBehavior.ts.

(M) spawner/WaveParser.ts (JSON schema + validation).

(M) spawner/WaveRunner.ts (subscribe to BeatClock).

(S) Enemy types: 

TempoDrone (basic),

PulseScout (evasive off-beat),

BassGuard (shield on off-beats).

(S) VFX: spawn flash, death particles.

Dependencies

BeatClock + EventBus.

Acceptance Criteria

Waves från waves/w1_l1.json spelas exakt per beat (±10ms).

3 fiendetyper funkar, AI triggas korrekt av beat state.

JSON valideras; fel loggas med rad/nyckel.

120 fiender/min utan stutter på standardlaptop.

Sprint 4 — Scoring 2.0, Bomb, Ability Framework (v0.74)

Theme: make skill pay 💸

Objectives

Poängsystem med combo-multipliers och accuracy.

Bättre Bomb (laddas via combo, beat-sync burst).

Ability-ramverk + 2 abilities (Pulse Dash integriert, Overdrive).

Tasks

(M) systems/ScoringService (combo, multiplier steps, rank).

(S) HUD: show multiplier & accuracy % live.

(M) combat/Ability.ts base + abilities/Overdrive.ts.

(M) Bomb rework: fills on Perfects, AOE on activation, bigger radius on downbeats.

(S) SFX segr/aktivering (ducking music lite vid Bomb).

Dependencies

Combo från Sprint 1, Player från 2, enemies från 3.

Acceptance Criteria

Score = base × (1 + 0.1 per 10 combo), live accuracy visas.

Bomb aktiverbar efter X combo (config), på downbeat +25% radie.

Overdrive: +50% firerate & dmg i 8s (+75% om on-beat).

Resultatskärm visar Score, Accuracy, Best Combo.

Sprint 5 — Save/Profile, Economy & Shop MVP (v0.8)

Theme: meta loop online (lokalt 😉)

Objectives

ProfileService + SaveService (JSON + schema ver).

BeatCoins ekonomi kopplad till performance/difficulty.

Shop MVP: 3 stat-upgrades + 1 cosmetic.

Tasks

(M) systems/SaveService.ts (schema v1, auto-backup, migration stub).

(M) systems/ProfileService.ts (multi-profile, current, stats).

(M) systems/EconomyService.ts (payout tables, multipliers).

(M) ui/ShopView.ts + systems/ShopService.ts.

(S) Items JSON (shop/items.json): dmg, firerate, shield (lvl 0–3), 1 skin.

(S) Purchase flow: compare panel, confirm modal, coin drain anim.

(S) Autosave on purchase / level clear.

Dependencies

Score & ranks från Sprint 4.

Acceptance Criteria

Ny profil skapas, laddas, byts utan restart; autosave funkar.

BeatCoins tilldelas enligt rank + difficulty.

Köp ändrar stats vid nästa level start (ApplyUpgrades()).

Ingen negativ balans; dublettköp spärras; data persist.

Sprint 6 — World Map v1 & Stage Flow (v0.86)

Theme: ge spelvärlden en karta 🌌

Objectives

WorldMapScene med nodgraf (Sector 1: 5 nivåer + boss).

Stage result → unlock next → reflect på kartan.

Stjärnrank (1–3) baserat på accuracy/combos.

Tasks

(M) worlds/world1.json (nodes, neighbors, track IDs).

(M) ui/worldmap/NodeGraph.ts (kb/gamepad/mouse nav).

(S) NodeCard (hover: PB, stars, difficulty).

(S) StageComplete → stage:completed → Save progress.

(S) Rank → Stars mapping & display på noder.

(S) “Next unlocked” autofocus + quick start.

Dependencies

Save/Profile, scoring.

Acceptance Criteria

Klarad nivå låser upp nästa; boss låser upp credits skärm.

Kartnoder: Locked/Available/Cleared/Mastered visuals.

60 FPS i kartvy; snäll in-out transition till GameScene.

Sprint 7 — Weapons v2, Enemies v2, Boss v1 (v0.92)

Theme: djup & variation

Objectives

2 nya vapen (SplitBeam, WaveCannon) + upgrade path.

2 nya fiender (Sync Splitter, Phase Weaver).

Boss v1 (SYNCOPATE PRIME) med 2 faser bundna till låtens sektioner.

Tasks

(M) weapons/SplitBeam.ts (ricochet), WaveCannon.ts (AOE impact).

(M) Weapons config & upgrades (visual evolution).

(M) enemies/SyncSplitter (split off-beat), PhaseWeaver (teleport patterns).

(M) boss/SyncopePrime.ts + BossPhase.ts, telegraphing, shield windows.

(S) BossBar UI med phase ticks.

Dependencies

WaveRunner, Ability/Bomb, HUD.

Acceptance Criteria

Nya vapen känns distinkta, uppgraderingar påverkar DPS ≥15%/lvl.

SyncSplitter split-logik bara off-beat; Perfect kill ger bonus.

Boss: minst 2 faser, tydlig telegraph, fasbyten på musikens “drop”.

Ingen hard-lock; boss klarbar utan RNG-svängningar.

Sprint 8 — Polish, Settings/Accessibility, QA & v1.0 Release Prep (v1.0 RC)

Theme: make it shippable ✨

Objectives

Post-FX toggles (bloom, shake), colorblind mode, latency wizard.

Menu polish (Main, Profile, Leaderboard pass).

Balans- och ekonomi-tuning + bug-bash.

CI/CD, builds, release notes.

Tasks

(S) Settings: audio sliders, motion/FX toggles, UI scale, colorblind palettes.

(S) Latency Calibration wizard (tap on beat → set offsetMs).

(M) Leaderboard (lokal) UI polish: tabs (Daily/Friends/Global stub), highlight self.

(M) Economy/Balance pass: coin curve, shop prices, difficulty multipliers.

(M) Tutorials: lightweight prompts i L1 (count-in, on-beat tips).

(S) Performance pass: pool sizes, culling, GC audit.

(M) Test suite: unit coverage ≥70% core; integration smoke (seeded).

(S) CI: GitHub Actions (lint/test/build artifacts).

(S) Release checklist & CHANGELOG.md.

Dependencies

All previous systems integrated.

Acceptance Criteria (Release Candidate)

Performance: 60 FPS @1080p med bloom ON (standardlaptop).

Timing: Perfect window verifierad via wizard ±3ms repeatability.

Stability: 0 blocker, 0 critical, ≤5 minor known issues.

UX: All primary flows ≤3 klick från huvudmeny.

Content: Sector 1 komplett (5 stages + boss), shop MVP, world map, profiles, leaderboards (lokalt).

Cross-cutting Definition of Done (all sprints)

Feature behind flag tills klar.

Unit tests för core logic; integration where sensible.

Telemetry/log hooks (no-op in prod).

Docs: update README + add short usage notes per module.

No new ESLint errors; npm run test green.

Risks & Mitigations

Audio/beat drift på vissa maskiner → Mitigate: DSP-liknande timer, latency wizard, clamp visual phase till audio time.

Performance drop vid massprojektile → Mitigate: pooling, cap per frame, simplify FX on low.

Scope creep (för många vapen/fiender) → Mitigate: lås scope i S7, flytta extras till backlog.

Save schema changes → Mitigate: versioned migrations + backups.

Backlog (post-v1.0 candidates)

Daily/weekly challenges (+ rotating modifiers).

Endless mode.

Online leaderboards (UGS/own backend).

Async “ghost” races och replays export.

Sector 2–3 content packs.



