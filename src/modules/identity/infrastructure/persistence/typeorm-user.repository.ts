import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { Email } from '../../domain/email';
import { EmailAlreadyInUseError } from '../../domain/errors';
import { UserRepository } from '../../domain/ports';
import { asUserId, User, UserId } from '../../domain/user';
import { UserOrmEntity } from './user.orm-entity';

const MYSQL_DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

/**
 * OUTBOUND ADAPTER: implements the `UserRepository` port with TypeORM + MySQL.
 * If we switch to PostgreSQL or another library tomorrow, only this file is rewritten.
 */
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(@InjectRepository(UserOrmEntity) private readonly orm: Repository<UserOrmEntity>) {}

  nextId(): UserId {
    return asUserId(randomUUID());
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.orm.findOneBy({ email: email.value });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.orm.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    const snapshot = user.toSnapshot();
    try {
      await this.orm.save({
        id: snapshot.id,
        username: snapshot.username,
        email: snapshot.email.value,
        passwordHash: snapshot.passwordHash,
        createdAt: snapshot.createdAt,
      });
    } catch (error) {
      // Two simultaneous sign-ups with the same email: the database unique index is the last line of defense.
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === MYSQL_DUPLICATE_ENTRY) {
        throw new EmailAlreadyInUseError('An account with that email already exists');
      }
      throw error;
    }
  }

  private toDomain(row: UserOrmEntity): User {
    return User.restore({
      id: asUserId(row.id),
      username: row.username,
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    });
  }
}
