# Matched Betting Personal

Webapp personale per analisi e gestione operativa del matched betting.

## Stato

Il progetto è predisposto per collegare quote reali tramite un provider HTTP server-side.

Non vengono utilizzati:
- eventi hardcoded;
- quote demo;
- bookmaker hardcoded;
- exchange hardcoded;
- opportunità simulate.

Senza provider configurato, lo scanner restituisce un errore di configurazione e non inventa dati.

## Architettura

```text
Provider API reale
        ↓
Next.js server route
        ↓
Provider HTTP adapter
        ↓
ProviderQuote (canonical model)
        ↓
Odds Matcher
        ↓
Opportunità
        ↓
Calcolo Back/Lay
        ↓
Registro Operazioni
        ↓
Bankroll
```

La API key rimane lato server.

## Configurazione Vercel

Configurare le seguenti Environment Variables:

```text
MATCHBET_QUOTES_API_URL
MATCHBET_QUOTES_API_KEY
MATCHBET_QUOTES_API_AUTH_HEADER
MATCHBET_QUOTES_PROVIDER_ID
MATCHBET_QUOTES_PROVIDER_NAME
```

`MATCHBET_QUOTES_API_AUTH_HEADER` è opzionale e di default vale `Authorization`.

Quando l'header è `Authorization`, la chiave viene inviata come:

```text
Authorization: Bearer <API_KEY>
```

Per altri header viene usato direttamente il valore della API key.

## Contratto quote

L'endpoint configurato deve restituire un array JSON di quote nel modello canonico:

```json
[
  {
    "id": "unique-quote-id",
    "eventId": "provider-event-id",
    "event": "Event name",
    "sport": "football",
    "startTime": "2026-08-24T18:00:00Z",
    "market": "1X2",
    "selection": "Home",
    "side": "BACK",
    "odds": 2.1,
    "bookmakerId": "bookmaker-id",
    "bookmakerName": "Bookmaker name",
    "timestamp": "2026-08-24T12:00:00Z",
    "sourceProviderId": "provider-id"
  },
  {
    "id": "unique-lay-id",
    "eventId": "provider-event-id",
    "event": "Event name",
    "sport": "football",
    "market": "1X2",
    "selection": "Home",
    "side": "LAY",
    "odds": 2.02,
    "exchangeId": "exchange-id",
    "exchangeName": "Exchange name",
    "timestamp": "2026-08-24T12:00:00Z",
    "sourceProviderId": "provider-id"
  }
]
```

Quando scegliamo il provider reale, se il suo JSON non corrisponde a questo contratto, si implementa un adapter specifico nel layer `lib/providers/` senza modificare UI, matcher o calcolatore.

## Installazione

```bash
npm install
npm run dev
```

## Test

```bash
npm test
npm run build
```

## Limiti attuali

Il sistema analizza le quote e registra localmente le operazioni.

Non esegue automaticamente:
- login ai bookmaker;
- piazzamento Back;
- piazzamento Lay;
- cash-out;
- gestione automatica dei mercati.

Questa parte resta separata e potrà essere valutata successivamente.
