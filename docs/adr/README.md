# Architecture Decision Record (ADR) Log

Each ADR documents a decision: context, the decision itself, rejected alternatives, and consequences. This helps anyone joining the project understand why the code looks the way it does.

| No.                                       | Decision                                                     | Status   |
| ----------------------------------------- | ------------------------------------------------------------ | -------- |
| [0001](0001-hexagonal-architecture.md)    | Modular hexagonal architecture                               | Accepted |
| [0002](0002-lightweight-cqrs.md)          | Lightweight CQRS with `@nestjs/cqrs`, without event sourcing | Accepted |
| [0003](0003-application-spotify-token.md) | Application-level Spotify token with caching                 | Accepted |
| [0004](0004-authentication-security.md)   | Short-lived JWT, validated secrets, and rate limiting        | Accepted |
| [0005](0005-stop-storing-ip.md)           | Stop storing user IP addresses                               | Accepted |
| [0006](0006-validate-external-data.md)    | Runtime validation of Spotify responses                      | Accepted |
