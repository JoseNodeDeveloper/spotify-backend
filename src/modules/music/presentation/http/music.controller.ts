import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser } from '../../../identity/infrastructure/security/jwt.strategy';
import { CurrentUser, JwtAuthGuard } from '../../../identity/presentation/http/auth.guard';
import { GetArtistAlbumsQuery } from '../../application/get-artist-albums.query';
import { GetSearchHistoryQuery } from '../../application/get-search-history.query';
import { RecordSearchCommand } from '../../application/record-search.command';
import { SearchHistoryEntry } from '../../domain/ports';
import { AlbumSummary } from '../../domain/track';
import { ArtistParamDto, HistoryQueryDto } from './music.dto';

@ApiTags('music')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1' })
export class MusicController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  /**
   * Previously: GET /searchArtistAlbums/:artist/:userIp, with the IP sent by the client.
   * Now: a clear REST resource, and the user comes from the token.
   * Two separate operations run: a command (record the search) and a query (get the albums).
   */
  @Get('artists/:artist/albums')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async artistAlbums(
    @CurrentUser() user: AuthenticatedUser,
    @Param() { artist }: ArtistParamDto,
  ): Promise<AlbumSummary[]> {
    const albums = await this.queries.execute<GetArtistAlbumsQuery, AlbumSummary[]>(new GetArtistAlbumsQuery(artist));
    await this.commands.execute(new RecordSearchCommand(user.userId, artist));
    return albums;
  }

  @Get('me/searches')
  history(@CurrentUser() user: AuthenticatedUser, @Query() { limit }: HistoryQueryDto): Promise<SearchHistoryEntry[]> {
    return this.queries.execute(new GetSearchHistoryQuery(user.userId, limit));
  }
}
