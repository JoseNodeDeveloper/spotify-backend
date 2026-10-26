import { Email } from './email';
import { InvalidUsernameError } from './errors';

/**
 * "Branded type": the runtime value is still a string, but the compiler
 * prevents passing arbitrary strings where a UserId is expected.
 */
export type UserId = string & { readonly __brand: 'UserId' };

export const asUserId = (value: string): UserId => value as UserId;

export interface UserSnapshot {
  readonly id: UserId;
  readonly username: string;
  readonly email: Email;
  readonly passwordHash: string;
  readonly createdAt: Date;
}

/**
 * Domain entity. It has no TypeORM decorators: persistence is an
 * infrastructure detail and mapping happens in the repository.
 */
export class User {
  private constructor(private readonly state: UserSnapshot) {}

  static register(params: { id: UserId; username: string; email: Email; passwordHash: string; now: Date }): User {
    const username = params.username.trim();
    if (username.length < 2 || username.length > 20) {
      throw new InvalidUsernameError('The username must be between 2 and 20 characters long');
    }
    return new User({
      id: params.id,
      username,
      email: params.email,
      passwordHash: params.passwordHash,
      createdAt: params.now,
    });
  }

  /** Rebuild an existing user (used by the repository when reading from the database). */
  static restore(snapshot: UserSnapshot): User {
    return new User(snapshot);
  }

  get id(): UserId {
    return this.state.id;
  }

  get username(): string {
    return this.state.username;
  }

  get email(): Email {
    return this.state.email;
  }

  get passwordHash(): string {
    return this.state.passwordHash;
  }

  toSnapshot(): UserSnapshot {
    return { ...this.state };
  }
}
