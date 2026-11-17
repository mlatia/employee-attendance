import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { rpcError, ServiceCall } from './rpc';

@Injectable()
export class InternalGuard implements CanActivate {
  private readonly expected: Buffer;

  constructor(config: ConfigService) {
    this.expected = Buffer.from(config.getOrThrow<string>('INTERNAL_SECRET'));
  }

  canActivate(ctx: ExecutionContext): boolean {
    const given = Buffer.from(ctx.switchToRpc().getData<ServiceCall | undefined>()?.secret ?? '');
    if (given.length !== this.expected.length || !timingSafeEqual(given, this.expected)) {
      throw rpcError(403, 'Forbidden');
    }
    return true;
  }
}