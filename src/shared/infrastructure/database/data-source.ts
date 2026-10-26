import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { validateEnv } from '../../../config/env';

/** Configuration used by the TypeORM CLI to generate and run migrations. */
const env = validateEnv(process.env);

export default new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  entities: [`${__dirname}/../../../modules/**/infrastructure/persistence/*.orm-entity.{ts,js}`],
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
});
