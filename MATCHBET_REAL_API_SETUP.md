# MatchBet — real API setup

Architecture:

The Odds API → bookmaker BACK quotes
Betfair Exchange API → exchange LAY quotes
                         ↓
                   common normalizer
                         ↓
                       matcher
                         ↓
                    opportunities

## Vercel environment variables

### The Odds API

- `MATCHBET_ODDS_API_KEY`
- `MATCHBET_ODDS_API_SPORT` (default `soccer_italy_serie_a`)
- `MATCHBET_ODDS_API_REGIONS` (default `eu`)
- `MATCHBET_ODDS_API_MARKETS` (default `h2h`)
- `MATCHBET_ODDS_API_BOOKMAKERS` (optional)

### Betfair Exchange

- `MATCHBET_BETFAIR_APP_KEY`
- `MATCHBET_BETFAIR_SESSION_TOKEN`
- `MATCHBET_BETFAIR_EVENT_TYPE_ID` (default `1`)
- `MATCHBET_BETFAIR_MARKET_TYPE_CODE` (default `MATCH_ODDS`)
- `MATCHBET_BETFAIR_HOURS_AHEAD` (default `48`)

The Betfair adapter calls the real Exchange Betting API:
- `listMarketCatalogue`
- `listMarketBook`

It requests `MATCH_ODDS` markets and reads the best available LAY price.

## Important

The Odds API is NOT used as an exchange. Its prices are treated only as bookmaker BACK prices.

The old behavior that could classify an aggregator quote as LAY has been removed.

No betting execution is implemented. The app only discovers/calculates opportunities.

## Cross-provider matching

Provider-specific event IDs are not comparable, so the patch introduces:
- `eventKey`
- `selectionKey`

For football 1X2:
- home team → `home`
- draw / The Draw → `draw`
- away team → `away`

This allows a bookmaker event ID and Betfair event ID to be matched without assuming their IDs are equal.
