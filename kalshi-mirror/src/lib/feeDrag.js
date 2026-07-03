function round2(n) {
  return Math.round(n * 100) / 100
}

// Fee drag: gross P&L (before fees) vs. net P&L (after fees) across the
// whole book. Pure arithmetic — no timestamps, no thresholds. Per CLAUDE.md.
export function computeFeeDrag(bets) {
  const grossPnl = bets.reduce((sum, b) => sum + b.pnlBeforeFees, 0)
  const netPnl = bets.reduce((sum, b) => sum + b.pnl, 0)
  const totalFees = round2(grossPnl - netPnl)

  // Fees as a % of the pre-fee result, either direction: how much of a gain
  // they ate, or how much they piled onto a loss. Undefined only when gross
  // is exactly zero (nothing to take a percentage of).
  const dragPct =
    grossPnl !== 0 ? round2((totalFees / Math.abs(grossPnl)) * 100) : null

  return {
    grossPnl: round2(grossPnl),
    netPnl: round2(netPnl),
    totalFees,
    dragPct,
    betCount: bets.length,
  }
}
