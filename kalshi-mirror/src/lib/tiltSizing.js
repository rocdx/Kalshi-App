function round2(n) {
  return Math.round(n * 100) / 100
}

// Below this many bets in a bucket, an average is more noise than signal —
// flag it rather than presenting it as a reliable tendency (per CLAUDE.md's
// honesty rules).
const SMALL_SAMPLE_THRESHOLD = 10

// Trailing window for the rolling-average chart. A real calendar-time
// window (not a fixed bet count), so it can't be secretly diluted by bets
// from weeks apart just because they happen to be "the last 20." Easy to
// tune — nothing else in this file needs to change if you adjust it.
export const DEFAULT_WINDOW_HOURS = 48

function stakeOf(bet) {
  return bet.quantity * bet.entryPrice
}

function sortByOpenTime(bets) {
  return bets
    .filter((b) => b.openTime)
    .slice()
    .sort((a, b) => a.openTime - b.openTime)
}

// Direct bet-to-bet sequence comparison (not windowed), so it doesn't have
// the "spans weeks" problem the rolling chart has — reliable as-is.
export function computeStakeAfterOutcome(bets) {
  const sequence = sortByOpenTime(bets)

  const afterWin = []
  const afterLoss = []

  for (let i = 1; i < sequence.length; i++) {
    const prev = sequence[i - 1]
    const curr = sequence[i]
    ;(prev.won ? afterWin : afterLoss).push(stakeOf(curr))
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
    hasEnoughData: afterWin.length > 0 && afterLoss.length > 0,
    isSmallSample:
      afterWin.length < SMALL_SAMPLE_THRESHOLD ||
      afterLoss.length < SMALL_SAMPLE_THRESHOLD,
  }
}

// Trailing-window rolling average stake, sampled at each bet's own
// timestamp: "as of this bet, what was the average stake over the last
// `windowHours`?" Slides continuously as you move through the sequence.
//
// Honesty guard: when the gap since the previous bet exceeds the window
// itself, the two points share no window overlap — connecting them with a
// line would visually claim continuous activity that didn't happen. So a
// null point is inserted there, which breaks the line (Recharts doesn't
// connect across null by default) instead of smoothing over a dead stretch.
export function computeRollingStakeSeries(bets, windowHours = DEFAULT_WINDOW_HOURS) {
  const sequence = sortByOpenTime(bets)
  const windowMs = windowHours * 60 * 60 * 1000

  const points = []
  let start = 0

  for (let i = 0; i < sequence.length; i++) {
    const t = sequence[i].openTime.getTime()

    while (sequence[start].openTime.getTime() < t - windowMs) start++

    const windowBets = sequence.slice(start, i + 1)
    const avgStake =
      windowBets.reduce((sum, b) => sum + stakeOf(b), 0) / windowBets.length

    if (i > 0) {
      const prevT = sequence[i - 1].openTime.getTime()
      if (t - prevT > windowMs) {
        points.push({ time: prevT + 1, rollingAvg: null })
      }
    }

    points.push({ time: t, rollingAvg: round2(avgStake) })
  }

  return points
}

// One point per losing bet, at its real timestamp, for the loss-marker
// overlay. `y` is a constant — the chart plots these on their own hidden
// axis so they render as a flat row of ticks regardless of the stake
// axis's scale.
export function computeLossTicks(bets) {
  return sortByOpenTime(bets)
    .filter((b) => !b.won)
    .map((b) => ({ time: b.openTime.getTime(), y: 0 }))
}
