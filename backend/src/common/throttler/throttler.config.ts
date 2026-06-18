import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const THROTTLER_DEFAULTS = {
  TTL_MS: 60_000,
  LIMIT: 10,
};

export function throttlerConfig(): ThrottlerModuleOptions {
  return {
    throttlers: [
      {
        ttl: THROTTLER_DEFAULTS.TTL_MS,
        limit: THROTTLER_DEFAULTS.LIMIT,
      },
    ],
  };
}
