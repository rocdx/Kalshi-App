import { parseTicker } from './parseTicker'

function toDollars(cents) {
  const n = Number(cents)
  return Number.isFinite(n) ? n / 100 : 0
}

// Converts one raw CSV row (all strings) into a clean bet object: dollars
// instead of cents-strings, Date objects instead of timestamp strings, and
// sport/marketType/won/holdTimeMinutes derived rather than raw.
export function normalizeBet(row) {
  const { sport, marketType } = parseTicker(row.market_ticker)

  const openTime = row.open_timestamp ? new Date(row.open_timestamp) : null
  const closeTime = row.close_timestamp ? new Date(row.close_timestamp) : null
  const holdTimeMinutes =
    openTime && closeTime
      ? Math.round((closeTime - openTime) / 60000)
      : null

  const pnl = toDollars(row.realized_pnl_with_fees_cents)

  return {
    ticker: row.market_ticker,
    sport,
    marketType,
    side: row.side,
    quantity: Number(row.quantity) || 0,
    entryPrice: toDollars(row.entry_price_cents),
    exitPrice: toDollars(row.exit_price_cents),
    fees: toDollars(row.open_fees_cents) + toDollars(row.close_fees_cents),
    pnlBeforeFees: toDollars(row.realized_pnl_without_fees_cents),
    pnl,
    won: pnl > 0,
    openTime,
    closeTime,
    holdTimeMinutes,
  }
}
