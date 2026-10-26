import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { rankAlbumsByPopularity } from '../domain/album-ranking';
import { MUSIC_CATALOG, MusicCatalog } from '../domain/ports';
import { SearchTerm } from '../domain/search-term';
import { AlbumSummary } from '../domain/track';

export class GetArtistAlbumsQuery {
  constructor(readonly artist: string) {}
}

/**
 * Pure query: asks the catalog for tracks and applies the business rule.
 * It stores nothing; recording the search is a separate command (RecordSearchCommand).
 */
@QueryHandler(GetArtistAlbumsQuery)
export class GetArtistAlbumsHandler implements IQueryHandler<GetArtistAlbumsQuery, AlbumSummary[]> {
  constructor(@Inject(MUSIC_CATALOG) private readonly catalog: MusicCatalog) {}

  async execute(query: GetArtistAlbumsQuery): Promise<AlbumSummary[]> {
    const term = SearchTerm.create(query.artist);
    const tracks = await this.catalog.searchTracksByArtist(term);
    return rankAlbumsByPopularity(tracks, term.value);
  }
}
