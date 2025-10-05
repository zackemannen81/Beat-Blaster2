# Beat-Blaster – Detaljerad spelbeskrivning

## Översikt
Beat-Blaster är ett rytmstyrt arkadskjutspel byggt i Phaser 3. Musiken är motorn i allt: banans tempo, fiendernas mönster, visuella effekter och poängsystemet reagerar på analyserade beats (kick, snare och hi-hat). Spelet stöder både den klassiska omni-arenan och ett nytt vertikalt "forward scroller"-läge, med konfigurerbara svårighetsprofiler per låt. Målet är att överleva hela spåret, kedja perfekta träffar och jaga highscore utan att krocka eller missa takten.

## Kärnloop & Progression
- Lyssna och reagera på musiken: `AudioAnalyzer` och `Conductor` triggar beat-event som styr spawn-cykler och lane-justeringar.
- Skjut fienderna på beat: träffar inom ±60 ms ger "Perfect" (extra skada, multiplikator), medan +120 ms ger "Good".
- Håll dig vid liv: undvik kulor, utnyttja lane-snapping och aktivera bomben när banan fylls.
- Avancera vågor och bossar: banor är uppdelade i sekvenser om 16 takter, med mini-boss och bossfaser som höjer intensiteten.
- Bygg poäng: kombon stiger med varje Perfect, powerups och announcer-cues driver fram pulsen.

## Spellägen
- **Omni (arena):** Fri rörelse i ett kvadratiskt fält. Förvalt läge i legacy-versionen. Spelaren kan skjuta i valfri riktning via muspekare.
- **Vertical (forward scroller):** Spelaren låses till den nedre tredjedelen och världen scrollar nedåt i BPM-styrd fart. LanePatternController expanderar/kollapsar lanes dynamiskt (3→5→7) när musiken kräver det.

## Kontroller
- **PC (tangentbord + mus):** WASD eller piltangenter för rörelse, vänsterklick för push-to-shoot, högerklick/Space för bomb. Musen låser sikte i omni-läget och kan låsas upp i vertical via Options.
- **Gamepad:** Vänster spak för rörelse med lane-snapping när spaken släpps, höger trigger för eld, höger bumper/trigger för bomb. OptionsScene exponerar deadzone och känslighet.
- **Touch:** Halva skärmen styr rörelse/lane, andra halvan skjuter via hold-to-shoot. Dubbeltryck aktiverar bomb.

## Beat- & Lane-system
- `AudioAnalyzer` extraherar beat-events (low/mid/high) genom en FFT på Web Audio API. Resultatet matas till `Conductor` som publicerar `spawn:*` cues.
- `LanePatternController` håller en deterministisk 16-takts loop med lane-expansioner, hop-mönster och flooders. Den är ansvarig för att snappa spelarens position till lane-centra och ge magnetiska mellan-ankare när input släpps.
- Beats mappar mot fiendebeteenden:
  - Low/kick triggar spawn, lane-shifts och shuffle.
  - Mid/snare driver formationernas rotation och fiendeskott.
  - High/hi-hat styr teleporteringsblink, snabba swarms och specialattacker.

## Fiender & Bossar
- **Lane Hoppers:** Hoppar mellan två lanes varje low-beat; byter partner-lane var fjärde takt.
- **Weavers:** Rör sig i sinusbanor över lanes, med amplitude-boost på hi-hat.
- **Formation Dancers:** Grupper som roterar på snare och byter formation vid bar-slut.
- **Exploders:** Tankiga fiender som varnar innan de spränger hela lanes om de inte dödas inom tre beats.
- **Mirrorers:** Speglar spelarens X-position och rusar på hi-hat-pulser.
- **Teleporters:** Blinkar ut/in på high-beat med visuella ringeffekter.
- **Lane Flooders:** Skapar väggar som tvingar lane-byte.
- **Bossar/Mini-bossar:** Attackfaser bundna till beats (ex: skada bara på 1 & 3); HUD visar HP och triggers för stage progression.

## Spelmekanik & Powerups
- Projektiler: push-to-shoot (desktop) eller hold-to-shoot (touch), med Rapidfire som möjliggör autofire.
- Powerups inkluderar Rapidfire, Precision (större beat-fönster) och Charge Shot (håll och släpp på beat).
- Bombmeter laddas av kills och accuracy; bomben rensar kulor, stunnar fiender och triggar announcer callouts.

## Poäng, svårighet och progression
- Svårighetsprofiler definieras i `src/config/tracks.json` (Easy/Normal/Hard) och påverkar scrollhastighet, spawn-density, HP-multipliers och miss-straff.
- HP-skalning ökar 10 % per wave, men kompenseras för högre BPM.
- Score-systemet belönar Perfect-träffar, kedjor, no-hit-bonusar och track clear.
- Stage progression i vertical-läget sker via bossar, med 12 % spawnökning och 8 % HP-ökning per stage.

## Audiovisuell identitet
- Neon/retrowave-estetik med NeonGrid och starfield-lager som pulserar i takt.
- Lane-expansioner/kollapser visualiseras med glow-spår och in-/utandande effekter.
- Projektil- och explosionseffekter använder additive partiklar och skärmskak.
- `Announcer`-systemet erbjuder tre röstbanker (default, bee, cyborg) genererade via Edge TTS och triggar cues för combo, bomb, varning och boss.

## Inställningar & Tillgänglighet
- OptionsScene låter spelaren byta spelläge, svårighet, mus-sensitivitet, gamepad deadzones, Reduced Motion och Mouse Aim Unlock.
- Reduced Motion-läget ersätter tunga shake- och partikeleffekter med diskreta blinkningar.
- Högkontrast- och färgpalett justeras för att vara färgblindsvänlig.
- Touch- och gamepad-profiler säkerställer att spelet fungerar på desktop och mobil.

## Teknik & Pipeline
- **Motor & språk:** Phaser 3, TypeScript, Vite-baserad build, Vitest för tester.
- **Projektstruktur:** `src/scenes/` för Boot/Menu/Game/Result, `src/systems/` för AudioAnalyzer, Conductor, Spawner, Announcer, LanePatternController m.fl.
- **Assets:** Ljud och grafik ligger under `src/assets/` med script för att generera röster och paketera musik.
- **Build & distribution:** `npm run dev` startar och `npm run build` producerar en distribuerbar `dist/` för webben.
- **QA:** Dokumenterade checklistor (t.ex. `docs/vertical-mode.md`, `QA/`) och Vitest-svit för kritiska system.

## Lanseringsstatus
- Stöd för Chrome, Firefox och Safari i desktop-läge, med responsivt UI för mobil.
- Både omni-arenan och vertical scroller är spelbara, komplett med boss-loopar, dynamiska lanes, powerups och announcer-cues.
- Projektet har interna dokument för framtida innehåll (nya powerups, beam weapons, spawn-reworks) utifall teamet vill expandera efter lansering.
