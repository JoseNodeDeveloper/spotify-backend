import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserId } from '../../../identity/domain/user';
import { SearchHistoryEntry, SearchHistoryRepository } from '../../domain/ports';
import { SearchTerm } from '../../domain/search-term';
import { SearchHistoryOrmEntity } from './search-history.orm-entity';

@Injectable()
export class TypeOrmSearchHistoryRepository implements SearchHistoryRepository {
  constructor(
    @InjectRepository(SearchHistoryOrmEntity) private readonly orm: Repository<SearchHistoryOrmEntity>,
  ) {}

  /**
   * Atomic UPSERT in a single query (INSERT ... ON DUPLICATE KEY UPDATE).
   * Previously it did "find and, if missing, insert": two queries and a race
   * condition if two identical requests arrived at the same time.
   */
  async record(userId: UserId, term: SearchTerm, at: Date): Promise<void> {
    await this.orm.upsert(
      { userId, term: term.value, termKey: term.key, searchedAt: at },
      { conflictPaths: ['userId', 'termKey'] },
    );
  }

  /** Uses the (user_id, searched_at) index and returns only the columns needed. */
  async findRecentByUser(userId: UserId, limit: number): Promise<SearchHistoryEntry[]> {
    const rows = await this.orm.find({
      select: { term: true, searchedAt: true },
      where: { userId },
      order: { searchedAt: 'DESC' },
      take: limit,
    });
    return rows.map((row) => ({ term: row.term, searchedAt: row.searchedAt }));
  }
}
