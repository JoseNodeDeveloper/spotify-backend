import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserId } from '../../identity/domain/user';
import { SEARCH_HISTORY, SearchHistoryEntry, SearchHistoryRepository } from '../domain/ports';

export class GetSearchHistoryQuery {
  constructor(
    readonly userId: UserId,
    readonly limit: number,
  ) {}
}

@QueryHandler(GetSearchHistoryQuery)
export class GetSearchHistoryHandler implements IQueryHandler<GetSearchHistoryQuery, SearchHistoryEntry[]> {
  constructor(@Inject(SEARCH_HISTORY) private readonly history: SearchHistoryRepository) {}

  execute(query: GetSearchHistoryQuery): Promise<SearchHistoryEntry[]> {
    return this.history.findRecentByUser(query.userId, query.limit);
  }
}
