import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Persistence model. It is separate from the domain `User` entity:
 * TypeORM decorators stay in infrastructure.
 */
@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  username!: string;

  @Index('uq_users_email', { unique: true })
  @Column({ type: 'varchar', length: 100 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 100 })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;
}
