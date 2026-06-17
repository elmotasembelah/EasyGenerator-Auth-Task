import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { JWT_CONSTANTS } from './jwt.constants';

export function jwtConfig(config: ConfigService): JwtModuleOptions {
  return {
    secret: config.get<string>(JWT_CONSTANTS.SECRET_KEY),
    signOptions: {
      expiresIn: config.get<string>(
        JWT_CONSTANTS.EXPIRES_IN_KEY,
      ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
    },
  };
}
