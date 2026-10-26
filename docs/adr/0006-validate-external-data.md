# 0006 · Runtime Validation of Spotify Responses

**Status:** accepted

## Context

TypeScript types disappear at runtime. Version 1 accessed `data.tracks.items[...].album.images[0].url` assuming that structure always existed. On Spotify-side failures, `fetching` became `undefined` and the server crashed with `Cannot read properties of undefined`.

## Decision

- Describe the used response shape with **zod** and validate it on receipt.
- Immediately map it to internal `Track` model (anti-corruption layer). No Spotify types leave the adapter.
- If validation fails, throw `CatalogUnavailableError`, which the exception filter maps to a clear **503**.

## Alternatives considered

- **`spotify-web-api-node` SDK:** present in dependencies but unused. Adds a layer that does not validate data and has had limited active maintenance.
- **`class-validator` on responses:** designed for decorator-based DTOs; zod is more direct for nested data and infers types from schema.

## Consequences

A Spotify format change now yields a controlled error at a single point with descriptive logging, instead of random failures scattered across the codebase.
