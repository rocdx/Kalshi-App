# CLAUDE.md — Project Instructions

Read this file at the start of every session before writing any code.

## What we're building

A web app that takes in a person's Kalshi trading history (a CSV they export from
Kalshi) and holds them accountable for HOW they bet — not by predicting winners, but by
showing them the honest, mostly-invisible ways their own habits cost them money.

The tone is a direct, evidence-based "here's what your data actually shows" mirror. Think
of it as an autopsy of someone's betting behavior: calm, specific, backed by their own
numbers, never preachy. It shows people patterns they can't see in themselves.

The goal is AWARENESS and ACCOUNTABILITY, not helping people bet more or win more. See
"The rule that matters most" at the bottom.

## Who the user is

Anyone who trades on Kalshi as a betting platform, across any market category — sports,
esports, crypto, politics, entertainment, weather, whatever Kalshi lists. The app makes
no assumption about what a given user researches versus bets on impulsively; that
distinction isn't visible in the data and shouldn't be invented. Everything in Phase 1
works off the CSV numbers alone — price discipline, fee drag, tilt/sizing, and
overtrading are provable from timestamps and prices regardless of what category the user
was betting in or how much thought they put into it.

Users are analytical and will NOTICE if an insight is hollow — so every claim must be
provable from their data, never storytelling.

(The example CSV used during development belongs to one bettor with heavy sports +
esports + crypto volume. That's just one possible shape of the data — don't bake
assumptions about category mix, hold-to-settlement behavior, or "researched vs. side
bet" into the app itself.)

## The data we have (Kalshi transaction CSV)

The user exports a CSV from Kalshi (Account -> Documents -> transaction history). Columns:

- `type` — e.g. "trade"
- `quantity` — number of contracts
- `market_ticker` — encodes market type, date, event, side (see parsing below)
- `side` — "yes" or "no"
- `entry_price_cents` — price paid to enter (0-100; this IS the implied probability)
- `exit_price_cents` — price at exit/settlement
- `open_fees_cents`, `close_fees_cents` — fees
- `realized_pnl_without_fees_cents` — profit/loss BEFORE fees
- `realized_pnl_with_fees_cents` — profit/loss AFTER fees
- `open_timestamp`, `close_timestamp` — when the position was opened/closed

Everything in Phase 1 is computed from THIS FILE ALONE. No external API needed.

### Ticker parsing

Tickers are structured but each market type has its own pattern. Real examples:
- `KXNFLSPREAD-26FEB08SEANE-SEA14` = NFL spread, Feb 8, SEA vs NE, Seattle -14
- `KXWCSCORE-26JUN17UZBCOL-UZB0COL2` = World Cup score, Uzbekistan 0 Colombia 2
- `KXWCCORNERS-26JUN17GHAPAN-7` = corners, Ghana/Panama, over 7
- `KXNBATOTAL`, `KXMLBGAME`, `KXVALORANTGAME`, `KXBTC15M`, etc.

Build a parser that extracts, per row: market TYPE (spread/total/moneyline/corners/etc),
CATEGORY (sport/genre — NBA/MLB/soccer/esports/crypto/politics/etc.), and DATE.
Player-level detail is NOT a goal — we are explicitly not doing player props. Parse only
to the market/category level. Since users can bet across any category Kalshi offers, the
parser should degrade gracefully (a reasonable best-guess category) rather than fail on
ticker prefixes it hasn't seen before.

## The four core frameworks (Phase 1 — build these)

All four run on the CSV alone. They are pure arithmetic + timestamps: reliable, provable,
no sample-size fragility, no external data.

### 1. Price discipline (INCLUDING favorite/longshot lean) — THE BACKBONE
- `entry_price_cents` = the implied probability the user paid. 80c ~ betting a ~80% shot.
- Compute average entry price, and win rate + after-fee ROI bucketed by entry price
  (e.g. 0-20c, 20-40c, ... 80-100c).
- Surface systematic leans: "you chronically buy heavy favorites at 80c+" or "you load up
  on longshots."

### 2. Fee drag
- Compare `realized_pnl_without_fees` vs `with_fees` across the whole book.
- Headline: "You're up $X after fees, but $Y before — fees took Z% of your gross edge."
- Most users have no idea how much fees cost them. High-value and always provable.

### 3. Tilt / sizing
- Using `quantity` + timestamps: do position sizes balloon right after a loss?
- Detect stake-escalation-after-loss. The classic emotional-betting tell.

### 4. Overtrading
- Using timestamps + hold time (open->close): flag very short holds and high-frequency
  trading, especially in markets that are inherently fast-moving (e.g. 15-minute crypto
  contracts, esports maps) where rapid re-entry is easy.
- Note honestly: markets with naturally long resolution windows (e.g. a moneyline held to
  settlement) will rarely trigger this — that's expected, not a bug. Don't force an
  overtrading read onto a bet that was simply held to its natural resolution.

### THE HEADLINE that ties #1 and #2 together (build this as the centerpiece)
For any entry price, there's a win rate REQUIRED to break even after fees. Compare:
"the win rate your prices demand" vs "your actual win rate."
Example: "Your average entry demands a 64% win rate to profit after fees. You're hitting
51%." This single line is the most memorable, most accountable insight in the app. Lead
with it. The other frameworks support it.

## Concentration — DEMOTED to a lightweight flag (not a full framework)
For a short-horizon bettor (not a long-term holder), concentration isn't a portfolio risk
in the traditional sense. Use it ONLY as a behavioral nudge: "you've lost your last N in a
row in [category] — consider a break." Do not build it into a major analysis. Keep it
small.

## Phase 2 (build later, after the core works)

### Closing-line / entry-timing value — THE high-value addition
The most respected signal in betting: did you get a GOOD PRICE relative to where the
market ended up, regardless of whether the bet won? Compare the user's `entry_price` to
Kalshi's later/closing market price for that contract.
- Why it's powerful: it measures PROCESS, not outcome — it cuts through variance.
- Why it's Phase 2: it requires pulling Kalshi's market price HISTORY via API (extra
  calls per market), not just the user's CSV. That dependency is why it waits.

### Chasing (rapid re-entry after a loss) — nice-to-have
Using timestamps: after a loss, does the user place another bet within minutes? The
timing-based cousin of tilt (which is size-based). Add if timestamps make it easy.

### Game-level situational enrichment — optional, traditional-sports only
For in-scope sports markets (moneyline/spread/totals/corners/HR/BTTS), fetch the actual
game result from a sports-stats API to explain hits/misses ("you took the over 220.5, it
landed 208"). Do NOT attempt this for esports/crypto/novelty markets — no clean data
source. And remember: game facts (final scores, margins) come from a stats API, never
from an LLM's memory. Retrieve first, then explain.

## The honesty rules (this is what makes the app trustworthy)

- Every behavioral claim carries its sample size or a confidence note.
- The three arithmetic frameworks (price, fees, sizing) are reliable at any size — lead
  with them.
- For anything involving win-rate-by-category: if the sample is small (a handful of
  bets), SAY SO. Do not report noise as a tendency. "Not enough bets here to tell" is a
  valid, trust-building answer.
- When a loss is just variance, say it's variance. Do NOT invent a behavioral cause for
  every loss. The willingness to say "this was bad luck" is a feature, not a weakness.
- Never manufacture an insight to seem impressive. A confident false claim spends the
  trust the true claims earn.

## Build order & stack

- Phase 1 runs entirely in the browser on the uploaded CSV — no backend needed yet.
  Parse CSV client-side (PapaParse), compute in JS, render dashboard + written analysis.
- Add a backend (Python + FastAPI, SQLite) only when something forces it: saving history
  across sessions, the closing-line API calls (Phase 2), or an LLM narrative layer.
- Frontend: React (the user already ships React in VS Code). Charts: Recharts.

## The rule that matters most

This app is a mirror, not a casino. It exists to make people MORE aware of how they bet —
including the possibility that they should bet less. Never turn it into a tool for
betting more or "winning smarter." When the data shows loss-chasing or tilt, surface a
responsible-gambling resource such as 1-800-GAMBLER rather than encouraging more action.

Build the mirror, not the casino.