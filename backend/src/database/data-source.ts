import type { DataSourceOptions } from 'typeorm';

export type DbService = 'IDENTITY' | 'ATTENDANCE';

/** Tiap service memakai database dan user MySQL sendiri, dan hanya memuat entity miliknya. */
export function dbOptions(
  env: NodeJS.ProcessEnv,
  entities: DataSourceOptions['entities'],
  service: DbService,
): DataSourceOptions {
  return {
    type: 'mysql',
    host: env.DB_HOST ?? '127.0.0.1',
    port: Number(env.DB_PORT ?? 3306),
    username: env[`${service}_DB_USER`],
    password: env[`${service}_DB_PASSWORD`],
    database: env[`${service}_DB_NAME`],
    entities,
    charset: 'utf8mb4',
    timezone: 'Z',
    synchronize: false, 
    extra: { connectionLimit: 10 },
  };
}