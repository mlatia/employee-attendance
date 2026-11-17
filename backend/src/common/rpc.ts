import { HttpException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import type { AuthUser } from '../auth/auth.types';

export type Actor = Pick<AuthUser, 'id' | 'role' | 'fullName' | 'employeeNo' | 'department'>;

export interface Envelope<T = unknown> {
  secret: string;
  actor: Actor;
  data: T;
}

export const rpcError = (statusCode: number, message: string) => new RpcException({ statusCode, message });
const logger = new Logger('RPC');

const toHttp = (e: unknown) => {
  const err = e as { statusCode?: unknown; message?: unknown } | null;
  if (typeof err?.statusCode === 'number' && typeof err.message === 'string') {
    return new HttpException(err.message, err.statusCode);
  }
  logger.error(`Remote call gagal: ${JSON.stringify(e)}`);
  return new ServiceUnavailableException('Layanan sedang tidak tersedia, coba lagi sebentar lagi');
};

export const callRemote = <T>(client: ClientProxy, pattern: string, envelope: Envelope): Promise<T> =>
  firstValueFrom(
    client.send<T>(pattern, envelope).pipe(
      timeout(15_000),
      catchError((e) => throwError(() => toHttp(e))),
    ),
  );