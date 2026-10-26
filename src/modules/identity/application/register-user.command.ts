import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CLOCK, Clock } from '../../../shared/domain/clock';
import { Email } from '../domain/email';
import { EmailAlreadyInUseError } from '../domain/errors';
import { assertPasswordIsStrong } from '../domain/password-policy';
import { PASSWORD_HASHER, PasswordHasher, USER_REPOSITORY, UserRepository } from '../domain/ports';
import { User, UserId } from '../domain/user';

/** Command: intent to change system state. Immutable and without business logic. */
export class RegisterUserCommand {
  constructor(
    readonly username: string,
    readonly email: string,
    readonly password: string,
  ) {}
}

export interface RegisterUserResult {
  readonly userId: UserId;
}

/**
 * "Register user" use case. It depends only on ports (interfaces),
 * so tests can pass in-memory implementations.
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, RegisterUserResult> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    const email = Email.create(command.email);
    assertPasswordIsStrong(command.password);

    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyInUseError('An account with that email already exists');
    }

    const user = User.register({
      id: this.users.nextId(),
      username: command.username,
      email,
      passwordHash: await this.hasher.hash(command.password),
      now: this.clock.now(),
    });

    await this.users.save(user);
    return { userId: user.id };
  }
}
