# 0004 · Short-Lived JWT, Validated Secrets, and Rate Limiting

**Status:** accepted

## Context

Issues found in version 1:

1. JWT secret `'super-secret'` hard-coded in two places.
2. Non-expiring tokens.
3. `POST /auth/getUser` issued a token for any email in the request body, without password.
4. `.env` with Spotify _client secret_ committed to a public repository.
5. CORS open to any origin and no login attempt throttling.

## Decision

- Validate environment variables at startup with zod. `JWT_SECRET` requires at least 32 characters; if missing, the app does not start.
- HS256 tokens with 15-minute expiration. User identity always comes from token (`@CurrentUser()`), never from body or URL.
- Remove `/auth/getUser` and replace it with protected `GET /auth/me`.
- Login uses a single message for wrong email/password and performs hash comparison even when email does not exist, to avoid account enumeration.
- Global rate limiting (100/min) plus stricter limits on login/register (5/min).
- `helmet`, CORS allowlist, and `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`.
- bcrypt cost 12 and password policy in the domain.

## Alternatives considered

- **Refresh tokens in httpOnly cookies:** better UX and stronger XSS protection. Left as a next step because it requires CSRF protection and rotation endpoints, which increase scope.
- **Argon2 instead of bcrypt:** recommended for new projects. The `PasswordHasher` port allows this swap without changing domain code.

## Consequences

- With 15-minute tokens and no refresh token, users must log in again after expiration. This is an explicit security trade-off.
- **Required action outside code:** rotate the Spotify client secret exposed in version 1 and remove `.env` from git history.
