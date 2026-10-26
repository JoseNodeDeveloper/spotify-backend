import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CLOCK, Clock } from '../../../shared/domain/clock';
import { UserId } from '../../identity/domain/user';
import { SEARCH_HISTORY, SearchHistoryRepository } from '../domain/ports';
import { SearchTerm } from '../domain/search-term';

export class RecordSearchCommand {
  constructor(
    readonly userId: UserId,
    readonly term: string,
  ) {}
}

@CommandHandler(RecordSearchCommand)
export class RecordSearchHandler implements ICommandHandler<RecordSearchCommand, void> {
  constructor(
    @Inject(SEARCH_HISTORY) private readonly history: SearchHistoryRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: RecordSearchCommand): Promise<void> {
    await this.history.record(command.userId, SearchTerm.create(command.term), this.clock.now());
  }
}
