import type { CookieOptions } from 'express';

export const SESSION_COOKIE = 'wfh_session';
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export const sessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});