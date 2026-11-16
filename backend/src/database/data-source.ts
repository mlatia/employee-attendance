import type { DataSourceOptions } from 'typeorm';
import { Account } from './entities/account.entity';
import { Employee } from './entities/employee.entity';

export function dbOptions(env: NodeJS.ProcessEnv): DataSourceOptions {
  return {
    type: 'mysql',
    host: env.DB_HOST ?? '127.0.0.1',
    port: Number(env.DB_PORT ?? 3306),
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: [Employee, Account],
    charset: 'utf8mb4',
    timezone: 'Z',
    synchronize: false, 
    extra: { connectionLimit: 10 },
  };
}