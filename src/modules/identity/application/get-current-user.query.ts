import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserNotFoundError } from '../domain/errors';
import { USER_REPOSITORY, UserRepository } from '../domain/ports';
import { UserId } from '../domain/user';

/** Query: read-only. It never modifies state. */
export class GetCurrentUserQuery {
  constructor(readonly userId: UserId) {}
}

/** Read DTO: exposes only what the client needs (never the password hash). */
export interface CurrentUserView {
  readonly id: string;
  readonly username: string;
  readonly email: string;
}

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery, CurrentUserView> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(query: GetCurrentUserQuery): Promise<CurrentUserView> {
    const user = await this.users.findById(query.userId);
    if (!user) throw new UserNotFoundError('User not found');
    return { id: user.id, username: user.username, email: user.email.value };
  }
}
