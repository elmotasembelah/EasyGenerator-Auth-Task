import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export function corsConfig(config: ConfigService): CorsOptions {
  return {
    origin: config.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  };
}
