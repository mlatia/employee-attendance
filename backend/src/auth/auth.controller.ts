import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { IdentityClient } from '../identity/identity.client';
import { Auth, CurrentUser } from './auth.decorator';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, sessionCookieOptions } from './auth.constants';
import type { AuthUser, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly identity: IdentityClient,
    private readonly jwt: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthUser> {
    const { user, authVersion } = await this.identity.login(dto); // kredensial diperiksa employee-service
    const payload: JwtPayload = { sub: user.id, av: authVersion };
    const token = await this.jwt.signAsync(payload); // gateway yang menandatangani JWT
    res.cookie(SESSION_COOKIE, token, { ...sessionCookieOptions(), maxAge: SESSION_TTL_SECONDS * 1000 });
    return user;
  }

  @Get('me')
  @Auth()
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  @Auth()
  async logout(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.identity.revoke(user);
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  }
}