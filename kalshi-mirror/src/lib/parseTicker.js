// Exact lookup for ticker prefixes we've seen in real exports — keyed by the
// segment before the first "-" in market_ticker. Preferred over the keyword
// fallback below because it's unambiguous.
const TICKER_TABLE = {
  KXNFLSPREAD: ['NFL', 'spread'],
  KXSB: ['NFL', 'outright'],
  KXNBAGAME: ['NBA', 'moneyline'],
  KXNBASPREAD: ['NBA', 'spread'],
  KXNBATOTAL: ['NBA', 'total'],
  KXWNBAGAME: ['WNBA', 'moneyline'],
  KXMLBGAME: ['MLB', 'moneyline'],
  KXMLBSPREAD: ['MLB', 'spread'],
  KXMLBF5SPREAD: ['MLB', 'spread'],
  KXMLBTOTAL: ['MLB', 'total'],
  KXMLBHR: ['MLB', 'home_run'],
  KXMLBRFI: ['MLB', 'first_inning_run'],
  KXBUNDESLIGAGAME: ['Soccer', 'moneyline'],
  KXCONCACAFCCUPGAME: ['Soccer', 'moneyline'],
  KXCONMEBOLLIBGAME: ['Soccer', 'moneyline'],
  KXCONMEBOLSUDGAME: ['Soccer', 'moneyline'],
  KXDFBPOKALGAME: ['Soccer', 'moneyline'],
  KXEPLGAME: ['Soccer', 'moneyline'],
  KXEPLSPREAD: ['Soccer', 'spread'],
  KXKLEAGUEGAME: ['Soccer', 'moneyline'],
  KXLALIGAGAME: ['Soccer', 'moneyline'],
  KXUCLGAME: ['Soccer', 'moneyline'],
  KXWCGAME: ['Soccer', 'moneyline'],
  KXWCSCORE: ['Soccer', 'score'],
  KXWCCORNERS: ['Soccer', 'corners'],
  KXWCTCORNERS: ['Soccer', 'corners'],
  KXWCGOAL: ['Soccer', 'goal'],
  KXWCTOTAL: ['Soccer', 'total'],
  KXWCTEAMTOTAL: ['Soccer', 'total'],
  KXWC1HSPREAD: ['Soccer', 'spread'],
  KXIPLGAME: ['Cricket', 'moneyline'],
  KXATPMATCH: ['Tennis', 'match'],
  KXATPCHALLENGERMATCH: ['Tennis', 'match'],
  KXWTAMATCH: ['Tennis', 'match'],
  KXITFMATCH: ['Tennis', 'match'],
  KXITFWMATCH: ['Tennis', 'match'],
  KXPGATOUR: ['Golf', 'tournament_winner'],
  KXPGATOP5: ['Golf', 'top5'],
  KXPGAR1LEAD: ['Golf', 'round_lead'],
  KXPGAR2LEAD: ['Golf', 'round_lead'],
  KXNASCARRACE: ['Motorsport', 'race_winner'],
  KXCS2: ['Esports (CS2)', 'outright'],
  KXCS2GAME: ['Esports (CS2)', 'moneyline'],
  KXCS2MAP: ['Esports (CS2)', 'map'],
  KXCS2TOTALMAPS: ['Esports (CS2)', 'total_maps'],
  KXVALORANTGAME: ['Esports (Valorant)', 'moneyline'],
  KXVALORANTMAP: ['Esports (Valorant)', 'map'],
  KXLOLMAP: ['Esports (LoL)', 'map'],
  KXBTC15M: ['Crypto', '15min'],
  KXBTCD: ['Crypto', 'daily_range'],
  KXTRUMPMENTIONB: ['Politics', 'mention'],
  KXMVECROSSCATEGORY: ['Combo', 'combo'],
  KXMVESPORTSMULTIGAMEEXTENDED: ['Combo', 'combo'],
}

// Fallback keyword inference for ticker prefixes we haven't seen before, so
// a future export with a new league/tournament still gets a reasonable guess
// instead of falling into "Other".
const SPORT_KEYWORDS = [
  [/WNBA/, 'WNBA'],
  [/NBA/, 'NBA'],
  [/NFL/, 'NFL'],
  [/MLB/, 'MLB'],
  [/NHL/, 'NHL'],
  [/BUNDESLIGA|EPL|LALIGA|SERIEA|LIGUE1|UEFA|UCL|MLS|KLEAGUE|CONCACAF|CONMEBOL|DFBPOKAL|FIFA|^KXWC/, 'Soccer'],
  [/IPL|CRICKET/, 'Cricket'],
  [/ATP|WTA|ITF/, 'Tennis'],
  [/PGA|GOLF/, 'Golf'],
  [/NASCAR/, 'Motorsport'],
  [/CS2/, 'Esports (CS2)'],
  [/VALORANT/, 'Esports (Valorant)'],
  [/LOL/, 'Esports (LoL)'],
  [/DOTA/, 'Esports (Dota)'],
  [/BTC|ETH|CRYPTO/, 'Crypto'],
  [/TRUMP|MENTION|POLITIC/, 'Politics'],
  [/MVE/, 'Combo'],
]

const MARKET_TYPE_KEYWORDS = [
  [/TOTALMAPS/, 'total_maps'],
  [/SPREAD/, 'spread'],
  [/TOTAL/, 'total'],
  [/CORNERS/, 'corners'],
  [/SCORE/, 'score'],
  [/GOAL/, 'goal'],
  [/MAP/, 'map'],
  [/GAME/, 'moneyline'],
  [/MATCH/, 'match'],
  [/HR/, 'home_run'],
  [/RFI/, 'first_inning_run'],
  [/TOP5/, 'top5'],
  [/TOUR/, 'tournament_winner'],
  [/R1LEAD|R2LEAD/, 'round_lead'],
  [/RACE/, 'race_winner'],
  [/15M/, '15min'],
  [/CROSSCATEGORY|MULTIGAMEEXTENDED/, 'combo'],
  [/MENTION/, 'mention'],
]

function inferSport(prefix) {
  const hit = SPORT_KEYWORDS.find(([re]) => re.test(prefix))
  return hit ? hit[1] : 'Other'
}

function inferMarketType(prefix) {
  const hit = MARKET_TYPE_KEYWORDS.find(([re]) => re.test(prefix))
  return hit ? hit[1] : 'other'
}

// Parses only to market/category level (sport + market type) — never
// extracts player names or other sub-market detail, per CLAUDE.md.
export function parseTicker(ticker) {
  const prefix = (ticker || '').split('-')[0]
  const [sport, marketType] = TICKER_TABLE[prefix] ?? [
    inferSport(prefix),
    inferMarketType(prefix),
  ]

  return { sport, marketType }
}
