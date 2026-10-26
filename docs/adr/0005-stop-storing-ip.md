# 0005 · Stop Storing User IP Addresses

**Status:** accepted

## Context

The frontend fetched the user’s public IP from an external service and sent it in every search URL. The backend stored it in `user_searches.user_ip`.

## Decision

Remove the field and parameter.

## Reasons

- **Privacy (GDPR):** an IP address is personal data. Storing it requires purpose and legal basis; there was none.
- **Integrity:** because the client sent it, anyone could forge the value.
- **Product:** no feature used it.
- **Performance:** the frontend made an extra third-party call on every load.

## Consequences

If IP is needed in the future (for example, abuse detection), it should be captured on the server (`request.ip` with `trust proxy`), with documented purpose and retention period.
