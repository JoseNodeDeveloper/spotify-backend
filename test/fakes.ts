import { Clock } from '../src/shared/domain/clock';
import { Email } from '../src/modules/identity/domain/email';
import { EmailAlreadyInUseError } from '../src/modules/identity/domain/errors';
import { AccessToken, PasswordHasher, TokenIssuer, UserRepository } from '../src/modules/identity/domain/ports';
import { asUserId, User, UserId } from '../src/modules/identity/domain/user';

/*
 * In-memory port implementations. Thanks to the hexagonal architecture,
 * use cases are tested without MySQL, bcrypt, or NestJS, and each test runs in milliseconds.
 */
export class InMemoryUserRepository implements UserRepository {
  readonly users = new Map<UserId, User>();
  private sequence = 0;

  nextId(): UserId {
    this.sequence += 1;
    return asUserId(`user-${this.sequence}`);
  }

  async findByEmail(email: Email): Promise<User | null> {
    return [...this.users.values()].find((user) => user.email.equals(email)) ?? null;
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    const existing = await this.findByEmail(user.email);
    if (existing && existing.id !== user.id) throw new EmailAlreadyInUseError('duplicate');
    this.users.set(user.id, user);
  }
}

/** Fast reversible "hash": enough for tests, never for production. */
export class FakePasswordHasher implements PasswordHasher {
  verifyCalls = 0;

  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    this.verifyCalls += 1;
    return hash === `hashed:${plain}`;
  }
}

export class FakeTokenIssuer implements TokenIssuer {
  async issue(subject: { userId: UserId; email: string }): Promise<AccessToken> {
    return { accessToken: `token-for-${subject.userId}`, tokenType: 'Bearer', expiresIn: 900 };
  }
}

export class FixedClock implements Clock {
  constructor(private readonly fixed: Date = new Date('2026-01-01T10:00:00Z')) {}

  now(): Date {
    return this.fixed;
  }
}
