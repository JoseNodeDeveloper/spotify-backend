import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Search history. The user's IP is no longer stored: it is personal data (GDPR)
 * that adds nothing to the product, and since the browser itself sent it, it could be spoofed.
 */
@Entity({ name: 'search_history' })
@Index('uq_search_history_user_term', ['userId', 'termKey'], { unique: true })
@Index('ix_search_history_user_date', ['userId', 'searchedAt'])
export class SearchHistoryOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  /** Text exactly as the user typed it, for display. */
  @Column({ type: 'varchar', length: 100 })
  term!: string;

  /** Lowercase version, so the unique constraint is case-insensitive. */
  @Column({ name: 'term_key', type: 'varchar', length: 100 })
  termKey!: string;

  @Column({ name: 'searched_at', type: 'datetime', precision: 3 })
  searchedAt!: Date;
}
