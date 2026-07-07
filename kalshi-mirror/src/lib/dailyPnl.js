const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function round2(n) {
  return Math.round(n * 100) / 100
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Buckets realized P&L by the calendar day each bet CLOSED. Only includes
// days that actually had a closed bet — a day with no activity is simply
// absent, not shown as a $0 dip.
export function computeDailyPnl(bets) {
  const buckets = new Map()

  for (const bet of bets) {
    if (!bet.closeTime) continue
    const day = startOfDay(bet.closeTime)
    const key = day.toISOString().slice(0, 10)
    if (!buckets.has(key)) {
      buckets.set(key, { key, day, netPnl: 0, grossPnl: 0, betCount: 0 })
    }
    const bucket = buckets.get(key)
    bucket.netPnl += bet.pnl
    bucket.grossPnl += bet.pnlBeforeFees
    bucket.betCount += 1
  }

  return [...buckets.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((b) => {
      const label = `${MONTH_LABELS[b.day.getMonth()]} ${b.day.getDate()}`
      return {
        label,
        rangeLabel: label,
        netPnl: round2(b.netPnl),
        grossPnl: round2(b.grossPnl),
        betCount: b.betCount,
      }
    })
}

