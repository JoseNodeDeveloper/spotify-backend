import { DomainError } from '../../../shared/domain/domain-error';
import { UserId } from '../../identity/domain/user';
import { SearchTerm } from './search-term';
import { Track } from './track';

export class CatalogUnavailableError extends DomainError {
  readonly code = 'CATALOG_UNAVAILABLE';
}

/** Port to "a music catalog". Today it is Spotify; the domain does not know that. */
export const MUSIC_CATALOG = Symbol('MUSIC_CATALOG');

export interface MusicCatalog {
  /** Throws CatalogUnavailableError if the provider fails or does not respond in time. */
  searchTracksByArtist(artist: SearchTerm): Promise<Track[]>;
}

export interface SearchHistoryEntry {
  readonly term: string;
  readonly searchedAt: Date;
}

export const SEARCH_HISTORY = Symbol('SEARCH_HISTORY');

export interface SearchHistoryRepository {
  /** If the user already searched for that term, only the date is updated (no duplicate rows). */
  record(userId: UserId, term: SearchTerm, at: Date): Promise<void>;
  findRecentByUser(userId: UserId, limit: number): Promise<SearchHistoryEntry[]>;
}
