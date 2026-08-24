# The Odds API integration

The application is now prepared for The Odds API v4.

Official documentation:
https://the-odds-api.com/liveapi/guides/v4/

## Vercel environment variables

Required:

MATCHBET_ODDS_API_KEY

Recommended:

MATCHBET_ODDS_API_SPORT=soccer_italy_serie_a
MATCHBET_ODDS_API_REGIONS=eu
MATCHBET_ODDS_API_MARKETS=h2h

Optional:

MATCHBET_ODDS_API_BOOKMAKERS=

## Important

The API must return exchange lay markets as `h2h_lay`.
The Odds API documents that lay odds are automatically included for
relevant betting exchanges when requesting `h2h`.

The adapter converts:

h2h -> BACK
h2h_lay -> LAY

and maps bookmaker/exchange metadata into the application's canonical
ProviderQuote model.

No quote, event, bookmaker or exchange is hardcoded.

## Security

MATCHBET_ODDS_API_KEY is server-side only.
Never prefix it with NEXT_PUBLIC_.

## First production configuration

Set only:

MATCHBET_ODDS_API_KEY=<your key>

MATCHBET_ODDS_API_SPORT=soccer_italy_serie_a
MATCHBET_ODDS_API_REGIONS=eu
MATCHBET_ODDS_API_MARKETS=h2h

Then redeploy.

The application will remain empty if the API returns no compatible
BACK/LAY combination. It will not fabricate opportunities.
