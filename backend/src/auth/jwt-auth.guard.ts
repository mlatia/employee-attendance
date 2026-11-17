import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IdentityClient } from '../identity/identity.client';
import { SESSION_COOKIE } from './auth.constants';
import type { AuthUser, JwtPayload } from './auth.types';

export type AuthedRequest = Request & { user: AuthUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly identity: IdentityClient,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const token: string | undefined = req.cookies?.[SESSION_COOKIE];
    if (!token) throw new UnauthorizedException();
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }
    // tanda tangan valid belum cukup: status akun dan authVersion dicek ke employee-service
    req.user = await this.identity.session({ sub: payload.sub, av: payload.av });
    return true;
  }
}