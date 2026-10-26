# 0002 · Lightweight CQRS with `@nestjs/cqrs`

**Status:** accepted

## Context

The old `GET /searchArtistAlbums` endpoint wrote to the database (saved the search) and also read from Spotify. A GET request with side effects breaks HTTP expectations: caches, retries, and browser prefetching can trigger it without user intent.

## Decision

Separate responsibilities explicitly:

- **Commands** (change state): `RegisterUser`, `AuthenticateUser`, `RecordSearch`.
- **Queries** (read only): `GetCurrentUser`, `GetArtistAlbums`, `GetSearchHistory`.

The album controller executes the query and then the logging command, explicitly. `CommandBus`/`QueryBus` from `@nestjs/cqrs` is used so each use case is a small class with one responsibility.

## Alternatives considered

- **Event sourcing and separate read/write databases:** full CQRS. Valuable with very different read models or heavy load. Here it adds complexity without benefit.
- **Emit `ArtistSearched` from the query and save history in a handler:** more decoupled, but hides a side effect inside a query. We preferred making both steps explicit in the controller.

## Consequences

- Each use case is understandable by reading a ~30-line file.
- Queries can be cached or moved to a read replica without touching commands.
- Cost: slightly more ceremony (command class + handler) than a service method.
