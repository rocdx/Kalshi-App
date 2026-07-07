function round1(n) {
  return Math.round(n * 10) / 10
}

function round2(n) {
  return Math.round(n * 100) / 100
}

// Below this many bets, a win rate / ROI is more noise than signal — flag
// it rather than presenting it as a reliable tendency (per CLAUDE.md's
// honesty rules).
const SMALL_SAMPLE_THRESHOLD = 10

function statsForGroup(group) {
  const count = group.length
  const wins = group.filter((b) => b.won).length
  const netPnl = group.reduce((sum, b) => sum + b.pnl, 0)
  const staked = group.reduce((sum, b) => sum + b.quantity * b.entryPrice, 0)

  return {
    count,
    winRate: round1((wins / count) * 100),
    netPnl: round2(netPnl),
    roi: staked > 0 ? round1((netPnl / staked) * 100) : null,
    isSmallSample: count < SMALL_SAMPLE_THRESHOLD,
  }
}

// Breaks down what % of all bets fell into each category (by the `sport`
// field already parsed from the ticker), plus how each category actually
// performed (win rate, net P&L, ROI on dollars staked). Descriptive, not a
// judgment — stays a lightweight flag rather than a full framework per
// CLAUDE.md. Caps the number of slices so the pie doesn't fill up with tiny
// categories; anything past the top `maxSlices` gets folded into "Other".
export function computeConcentration(bets, maxSlices = 7) {
  const groups = new Map()
  for (const bet of bets) {
    if (!groups.has(bet.sport)) groups.set(bet.sport, [])
    groups.get(bet.sport).push(bet)
  }

  const total = bets.length
  const sorted = [...groups.entries()]
    .map(([sport, group]) => ({ sport, group }))
    .sort((a, b) => b.group.length - a.group.length)

  const top = sorted.slice(0, maxSlices)
  const rest = sorted.slice(maxSlices)

  const result = top.map(({ sport, group }) => ({
    sport,
    pct: round1((group.length / total) * 100),
    ...statsForGroup(group),
  }))

  if (rest.length > 0) {
    const restBets = rest.flatMap((r) => r.group)
    result.push({
      sport: 'Other',
      pct: round1((restBets.length / total) * 100),
      ...statsForGroup(restBets),
    })
  }

  return result
}
