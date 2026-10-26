import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodError } from 'zod';
import { Env } from '../../../../config/env';
import { TtlCache } from '../../../../shared/infrastructure/ttl-cache';
import { CatalogUnavailableError, MusicCatalog } from '../../domain/ports';
import { SearchTerm } from '../../domain/search-term';
import { Track } from '../../domain/track';
import { SpotifyTrackSearch, spotifyTrackSearchSchema } from './spotify.schemas';
import { SpotifyTokenProvider } from './spotify-token.provider';

const REQUEST_TIMEOUT_MS = 5_000;
const RESULTS_LIMIT = 50;
/** Artist albums change rarely: a 10-minute cache saves calls and latency. */
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX_ENTRIES = 500;

/**
 * Outbound adapter implementing the MusicCatalog port via Spotify's Web API.
 * Responsibilities: auth, timeout, retry on 401, validation, and translation.
 */
@Injectable()
export class SpotifyCatalogAdapter implements MusicCatalog {
  private readonly logger = new Logger(SpotifyCatalogAdapter.name);
  private readonly cache = new TtlCache<Track[]>(CACHE_TTL_MS, CACHE_MAX_ENTRIES);

  constructor(
    private readonly tokens: SpotifyTokenProvider,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async searchTracksByArtist(artist: SearchTerm): Promise<Track[]> {
    const cached = this.cache.get(artist.key);
    if (cached) return cached;

    const tracks = this.toDomain(await this.fetchWithRetry(artist.value));
    this.cache.set(artist.key, tracks);
    return tracks;
  }

  private async fetchWithRetry(artist: string): Promise<SpotifyTrackSearch> {
    let response = await this.request(artist, await this.tokens.getToken());

    // The token may expire earlier than expected: invalidate it and retry only once.
    if (response.status === 401) {
      this.tokens.invalidate();
      response = await this.request(artist, await this.tokens.getToken());
    }

    if (!response.ok) {
      this.logger.warn(`Spotify search failed (HTTP ${response.status})`);
      throw new CatalogUnavailableError('Music catalog is currently unavailable');
    }

    try {
      return spotifyTrackSearchSchema.parse(await response.json());
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error('Spotify returned an unexpected format', error.issues);
        throw new CatalogUnavailableError('Unexpected response from the music catalog');
      }
      throw error;
    }
  }

  private async request(artist: string, token: string): Promise<Response> {
    // URLSearchParams encodes user input. Previously it was concatenated directly into the URL.
    const params = new URLSearchParams({
      q: `artist:"${artist.replaceAll('"', '')}"`,
      type: 'track',
      limit: String(RESULTS_LIMIT),
    });
    try {
      return await fetch(`${this.config.get('SPOTIFY_API_URL', { infer: true })}/v1/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error('Spotify did not respond in time', error);
      throw new CatalogUnavailableError('Music catalog is currently unavailable');
    }
  }

  /** Anti-corruption layer: Spotify's wire format does not leak outside this file. */
  private toDomain(payload: SpotifyTrackSearch): Track[] {
    return payload.tracks.items.map((item) => ({
      primaryArtist: item.artists[0]?.name ?? '',
      popularity: item.popularity,
      album: {
        name: item.album.name,
        coverUrl: item.album.images[0]?.url ?? null,
        releaseDate: item.album.release_date,
        totalTracks: item.album.total_tracks,
      },
    }));
  }
}
