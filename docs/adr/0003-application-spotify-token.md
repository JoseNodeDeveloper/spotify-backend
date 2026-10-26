# 0003 · Application-Level Spotify Token with Caching

**Status:** accepted

## Context

The API uses Spotify’s _client credentials_ flow: the token identifies the application, not the user. Version 1 requested a token at each login, stored it in each user’s `spotify_token` column, and when expired, refreshed it but **did not retry the search**: users received an error and had to retry manually.

## Decision

- `SpotifyTokenProvider` stores one token in memory and refreshes it one minute before expiry.
- If multiple requests need a token simultaneously, they share the same promise (_single flight_).
- On a 401, the adapter invalidates the token and retries **once**.
- Search results are cached for 10 minutes per artist (`TtlCache`, max 500 entries).
- All calls use a 5-second timeout (`AbortSignal.timeout`).

## Alternatives considered

- **Store token in database:** only useful when sharing across multiple instances; even then, Redis is usually better.
- **Redis for cache:** needed in multi-instance setups. With a single instance, it adds infrastructure without benefit. `TtlCache` has a simple replaceable interface.

## Consequences

- Fewer calls to Spotify and lower latency for repeated searches.
- The user table no longer stores third-party data.
- With multiple instances, each keeps its own token and cache: acceptable at this scale.
