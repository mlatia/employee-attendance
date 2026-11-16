import { applyDecorators, CanActivate, createParamDecorator, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../common/role.enum';
import type { AuthUser } from './auth.types';
import { AuthedRequest, JwtAuthGuard } from './jwt-auth.guard';

const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const { user } = ctx.switchToHttp().getRequest<AuthedRequest>();
    if (!roles.includes(user.role)) throw new ForbiddenException();
    return true;
  }
}

export const Auth = (...roles: Role[]) =>
  applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(JwtAuthGuard, RolesGuard));

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest<AuthedRequest>().user,
);