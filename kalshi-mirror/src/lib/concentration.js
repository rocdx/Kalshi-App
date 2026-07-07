function round1(n) {
  return Math.round(n * 10) / 10
}

// Breaks down what % of all bets fell into each category (by the `sport`
// field already parsed from the ticker). Purely descriptive — a count, not
// a judgment — so it stays a lightweight flag rather than a full framework.
// Caps the number of slices so the pie doesn't fill up with tiny categories;
// anything past the top `maxSlices` gets folded into "Other".
export function computeConcentration(bets, maxSlices = 7) {
  const counts = new Map()
  for (const bet of bets) {
    counts.set(bet.sport, (counts.get(bet.sport) || 0) + 1)
  }

  const total = bets.length
  const sorted = [...counts.entries()]
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count)

  const top = sorted.slice(0, maxSlices)
  const rest = sorted.slice(maxSlices)

  const result = top.map((s) => ({
    sport: s.sport,
    count: s.count,
    pct: round1((s.count / total) * 100),
  }))

  if (rest.length > 0) {
    const restCount = rest.reduce((sum, s) => sum + s.count, 0)
    result.push({
      sport: 'Other',
      count: restCount,
      pct: round1((restCount / total) * 100),
    })
  }

  return result
}
