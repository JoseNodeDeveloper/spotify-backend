# 0001 · Modular Hexagonal Architecture

**Status:** accepted

## Context

In version 1, `UserSearchesService` called Spotify, read and wrote MySQL, and applied business rules in the same method. `AuthService` depended on `SpotifyApiService`. Nothing could be tested without a running database and network, and CLI-generated tests did not even compile due to missing dependencies.

## Decision

Organize code into business modules (`identity`, `music`) and, inside each, into four layers:

- **Domain:** entities, value objects, rules, and **ports** (interfaces). Pure TypeScript.
- **Application:** use cases (commands and queries) orchestrating the domain through ports.
- **Infrastructure:** **adapters** implementing ports (TypeORM, bcrypt, JWT, Spotify).
- **Presentation:** HTTP controllers and DTOs.

Dependencies point inward, and ESLint (`no-restricted-imports`) enforces this.

## Alternatives considered

- **Classic NestJS layering (controller → service → repository):** faster to write, but it couples logic to TypeORM and Spotify. For a project meant to demonstrate design judgment, this is insufficient.
- **Separate microservices for identity and music:** excessive. Two clearly bounded modules inside a monolith provide the same separation without operational overhead.

## Consequences

- Positive: use cases are tested with in-memory doubles in milliseconds. Replacing Spotify with another catalog, or MySQL with PostgreSQL, only changes one adapter.
- Negative: more files and explicit mapping between domain and ORM entities. For a trivial CRUD this would not pay off; here it does, due to real business rules and external integration.
- Pragmatic trade-off: application handlers use `@nestjs/cqrs` decorators. They are metadata and do not affect logic: tests instantiate handlers with `new` without NestJS.
