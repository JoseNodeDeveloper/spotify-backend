import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CLOCK, SystemClock } from '../../shared/domain/clock';
import { GetArtistAlbumsHandler } from './application/get-artist-albums.query';
import { GetSearchHistoryHandler } from './application/get-search-history.query';
import { RecordSearchHandler } from './application/record-search.command';
import { MUSIC_CATALOG, SEARCH_HISTORY } from './domain/ports';
import { SearchHistoryOrmEntity } from './infrastructure/persistence/search-history.orm-entity';
import { TypeOrmSearchHistoryRepository } from './infrastructure/persistence/typeorm-search-history.repository';
import { SpotifyCatalogAdapter } from './infrastructure/spotify/spotify-catalog.adapter';
import { SpotifyTokenProvider } from './infrastructure/spotify/spotify-token.provider';
import { MusicController } from './presentation/http/music.controller';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([SearchHistoryOrmEntity])],
  controllers: [MusicController],
  providers: [
    GetArtistAlbumsHandler,
    GetSearchHistoryHandler,
    RecordSearchHandler,
    SpotifyTokenProvider,
    { provide: MUSIC_CATALOG, useClass: SpotifyCatalogAdapter },
    { provide: SEARCH_HISTORY, useClass: TypeOrmSearchHistoryRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
})
export class MusicModule {}
