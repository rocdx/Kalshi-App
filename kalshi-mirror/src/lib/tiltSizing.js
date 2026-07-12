function round2(n) {
  return Math.round(n * 100) / 100
}

// Below this many bets in a bucket, an average is more noise than signal —
// flag it rather than presenting it as a reliable tendency (per CLAUDE.md's
// honesty rules).
const SMALL_SAMPLE_THRESHOLD = 10

function sortByOpenTime(bets) {
  return bets
    .filter((b) => b.openTime)
    .slice()
    .sort((a, b) => a.openTime - b.openTime)
}

// The bet sequence in the order they were PLACED (open time — that's when
// the sizing decision happened), each carrying its own stake ($ risked to
// open the position) and its own win/loss outcome. Feeds the "stake line
// with win/loss dots" chart — spikes right after clusters of red is the
// tilt tell.
export function computeBetSequence(bets) {
  return sortByOpenTime(bets).map((bet, i) => ({
    index: i + 1,
    stake: round2(bet.quantity * bet.entryPrice),
    won: bet.won,
    sport: bet.sport,
    openTime: bet.openTime,
  }))
}

// Compares average stake on bets that immediately followed a win vs. a
// loss, walking the same time-ordered sequence.
export function computeStakeAfterOutcome(bets) {
  const sequence = sortByOpenTime(bets)

  const afterWin = []
  const afterLoss = []

  for (let i = 1; i < sequence.length; i++) {
    const prev = sequence[i - 1]
    const curr = sequence[i]
    const stake = curr.quantity * curr.entryPrice
    ;(prev.won ? afterWin : afterLoss).push(stake)
  }

  const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0)
  const avgAfterWin = round2(avg(afterWin))
  const avgAfterLoss = round2(avg(afterLoss))

  const pctDiff =
    avgAfterWin > 0
      ? round2(((avgAfterLoss - avgAfterWin) / avgAfterWin) * 100)
      : null

  return {
    avgAfterWin,
    avgAfterLoss,
    countAfterWin: afterWin.length,
    countAfterLoss: afterLoss.length,
    pctDiff,
    isSmallSample:
      afterWin.length < SMALL_SAMPLE_THRESHOLD ||
      afterLoss.length < SMALL_SAMPLE_THRESHOLD,
  }
}
