export type AccuracyLevel = 'Perfect' | 'Good' | 'Offbeat'

export default class Scoring {
  score = 0
  multiplier = 1
  combo = 0
  perfectMs = 60
  goodMs = 120
  shots = 0
  perfect = 0
  good = 0
  misses = 0
  kills = 0

  registerShot(deltaToNearestBeatMs: number) {
    const ad = Math.abs(deltaToNearestBeatMs)
    let acc: AccuracyLevel = 'Offbeat'
    if (ad <= this.perfectMs) acc = 'Perfect'
    else if (ad <= this.goodMs) acc = 'Good'

    if (acc === 'Perfect') {
      this.score += Math.round(100 * this.multiplier)
      this.perfect++
    } else if (acc === 'Good') {
      this.score += Math.round(50 * this.multiplier)
      this.good++
    }
    this.shots++
    return acc
  }

  addKill(
    type:
      | 'brute'
      | 'dasher'
      | 'swarm'
      | 'exploder'
      | 'weaver'
      | 'formation'
      | 'mirrorer'
      | 'teleporter'
      | 'flooder'
      | 'boss_swarm'
      | 'boss_juggernaut'
      | 'boss_trickster'
  ) {
    const base = type === 'brute'
      ? 100
      : type === 'dasher'
        ? 75
        : type === 'exploder'
          ? 120
          : type === 'weaver'
            ? 90
            : type === 'formation'
              ? 140
              : type === 'mirrorer'
                ? 110
                : type === 'teleporter'
                  ? 95
                  : type === 'flooder'
                    ? 130
                    : type === 'boss_swarm'
                      ? 320
                      : type === 'boss_juggernaut'
                        ? 480
                        : type === 'boss_trickster'
                          ? 360
                          : 25
    this.score += Math.round(base * this.multiplier)
    this.kills++
  }

  getKills() {
    return this.kills
  }

  registerMiss(penalty = 50) {
    this.misses++
    this.resetCombo()
    this.score = Math.max(0, this.score - penalty)
  }

  updateCombo(comboCount: number, multiplier: number) {
    this.combo = comboCount
    this.multiplier = Math.max(1, multiplier)
  }

  resetCombo() {
    this.updateCombo(0, 1)
  }
}
