import { Email } from './email';
import { User, UserId } from './user';

/*
 * PORTS (hexagonal architecture).
 * The domain and application layers declare WHAT they need; infrastructure decides HOW.
 * The symbols act as NestJS injection tokens without the domain importing NestJS.
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  nextId(): UserId;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  /** Throws EmailAlreadyInUseError if the email already exists (the database has a unique index). */
  save(user: User): Promise<void>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export const TOKEN_ISSUER = Symbol('TOKEN_ISSUER');

export interface AccessToken {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
}

export interface TokenIssuer {
  issue(subject: { userId: UserId; email: string }): Promise<AccessToken>;
}
