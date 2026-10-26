import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Email } from '../domain/email';
import { InvalidCredentialsError, InvalidEmailError } from '../domain/errors';
import {
  AccessToken,
  PASSWORD_HASHER,
  PasswordHasher,
  TOKEN_ISSUER,
  TokenIssuer,
  USER_REPOSITORY,
  UserRepository,
} from '../domain/ports';

/**
 * Logging in is a command, not a query: it issues a new credential
 * (the token), which is a side effect with security consequences.
 */
export class AuthenticateUserCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}

@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler implements ICommandHandler<AuthenticateUserCommand, AccessToken> {
  /**
   * Dummy hash to compare against when the email does not exist. This way the response takes
   * the same time whether or not the user exists, and registered emails cannot be guessed
   * by measuring response times (timing attack).
   */
  private dummyHash: Promise<string> | null = null;

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_ISSUER) private readonly tokens: TokenIssuer,
  ) {}

  async execute(command: AuthenticateUserCommand): Promise<AccessToken> {
    let email: Email;
    try {
      email = Email.create(command.email);
    } catch (error) {
      if (error instanceof InvalidEmailError) throw new InvalidCredentialsError();
      throw error;
    }

    const user = await this.users.findByEmail(email);
    const hashToCompare = user?.passwordHash ?? (await this.getDummyHash());
    const passwordMatches = await this.hasher.verify(command.password, hashToCompare);

    if (!user || !passwordMatches) {
      throw new InvalidCredentialsError();
    }

    return this.tokens.issue({ userId: user.id, email: user.email.value });
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash('timing-equalizer-not-a-real-password');
    return this.dummyHash;
  }
}
