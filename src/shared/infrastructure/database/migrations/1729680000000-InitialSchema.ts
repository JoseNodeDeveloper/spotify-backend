import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema for version 2. Replaces the previous four migrations:
 * - Removes `spotify_token` from users (it was an application token, not a user token).
 * - Removes `user_ip` from search history (unnecessary personal data).
 * - Adds a unique index (user, term) so history has no duplicates.
 * - Adds a foreign key with cascade delete: deleting a user deletes their history.
 */
export class InitialSchema1729680000000 implements MigrationInterface {
  name = 'InitialSchema1729680000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id CHAR(36) NOT NULL,
        username VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE search_history (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id CHAR(36) NOT NULL,
        term VARCHAR(100) NOT NULL,
        term_key VARCHAR(100) NOT NULL,
        searched_at DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_search_history_user_term (user_id, term_key),
        KEY ix_search_history_user_date (user_id, searched_at),
        CONSTRAINT fk_search_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE search_history');
    await queryRunner.query('DROP TABLE users');
  }
}
