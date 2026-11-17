import { HttpException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import type { AuthUser } from '../auth/auth.types';
import type { Role } from './role.enum';

/** Identitas aktor yang sudah diverifikasi gateway. Service percaya ini, bukan input browser. */
export type Actor = Pick<AuthUser, 'id' | 'role' | 'fullName' | 'employeeNo' | 'department'>;

/** Pesan antar service tanpa aktor (login dan cek sesi terjadi sebelum aktor dikenal). */
export interface ServiceCall<T = unknown> {
  secret: string;
  data: T;
}

export interface Envelope<T = unknown> extends ServiceCall<T> {
  actor: Actor;
}

export const rpcError = (statusCode: number, message: string) => new RpcException({ statusCode, message });

export const requireRole = (actor: Actor, role: Role) => {
  if (actor.role !== role) throw rpcError(403, 'Forbidden');
};

const logger = new Logger('RPC');

const toHttp = (e: unknown) => {
  const err = e as { statusCode?: unknown; message?: unknown } | null;
  if (typeof err?.statusCode === 'number' && typeof err.message === 'string') {
    return new HttpException(err.message, err.statusCode);
  }
  logger.error(`Remote call gagal: ${JSON.stringify(e)}`);
  return new ServiceUnavailableException('Layanan sedang tidak tersedia, coba lagi sebentar lagi');
};

export const callRemote = <T>(client: ClientProxy, pattern: string, payload: ServiceCall & { actor?: Actor }): Promise<T> =>
  firstValueFrom(
    client.send<T>(pattern, payload).pipe(
      timeout(15_000),
      catchError((e) => throwError(() => toHttp(e))),
    ),
  );