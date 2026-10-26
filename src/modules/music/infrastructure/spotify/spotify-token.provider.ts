import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../../config/env';
import { CatalogUnavailableError } from '../../domain/ports';
import { spotifyTokenSchema } from './spotify.schemas';

/** Refresh one minute before expiration to avoid using a token near expiry. */
const RENEW_MARGIN_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;

/**
 * Spotify application token (client credentials flow).
 *
 * Previously a new token was requested at each login and stored in the users table,
 * even though the token is shared by the whole application. Now it is requested once,
 * cached in memory until expiration, and concurrent requests share the same promise
 * (single flight) instead of requesting multiple tokens.
 */
@Injectable()
export class SpotifyTokenProvider {
  private readonly logger = new Logger(SpotifyTokenProvider.name);
  private cached: { token: string; expiresAt: number } | null = null;
  private inFlight: Promise<string> | null = null;

  constructor(private readonly config: ConfigService<Env, true>) {}

  async getToken(): Promise<string> {
    if (this.cached && this.cached.expiresAt > Date.now()) return this.cached.token;
    this.inFlight ??= this.fetchToken().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  invalidate(): void {
    this.cached = null;
  }

  private async fetchToken(): Promise<string> {
    const clientId = this.config.get('SPOTIFY_CLIENT_ID', { infer: true });
    const clientSecret = this.config.get('SPOTIFY_CLIENT_SECRET', { infer: true });
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    let response: Response;
    try {
      response = await fetch(`${this.config.get('SPOTIFY_ACCOUNTS_URL', { infer: true })}/api/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error('Could not contact Spotify to fetch an access token', error);
      throw new CatalogUnavailableError('Music catalog is currently unavailable');
    }

    if (!response.ok) {
      // Never log response bodies or credentials; log only the HTTP status code.
      this.logger.error(`Spotify token request failed (HTTP ${response.status})`);
      throw new CatalogUnavailableError('Music catalog is currently unavailable');
    }

    const body = spotifyTokenSchema.parse(await response.json());
    this.cached = {
      token: body.access_token,
      expiresAt: Date.now() + body.expires_in * 1000 - RENEW_MARGIN_MS,
    };
    return body.access_token;
  }
}
