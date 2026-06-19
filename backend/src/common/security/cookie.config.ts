import { CookieOptions } from 'express';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const ACCESS_TOKEN_COOKIE = 'access_token';

export function cookieConfig(isProd: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: ONE_DAY_MS,
  };
}
