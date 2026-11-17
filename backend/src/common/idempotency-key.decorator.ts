import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isUUID } from 'class-validator';
import type { Request } from 'express';

export const IdempotencyKey = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const value = ctx.switchToHttp().getRequest<Request>().headers['idempotency-key'];
  if (typeof value !== 'string' || !isUUID(value, '4')) {
    throw new BadRequestException('Header Idempotency-Key wajib berupa UUID v4');
  }
  return value;
});