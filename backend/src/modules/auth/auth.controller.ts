import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  cookieConfig,
} from '../../common/security/cookie.config';
import { AUTH_THROTTLER } from './auth.constants';
import { THROTTLER_DEFAULTS } from '../../common/throttler/throttler.config';
import { AuthService } from './auth.service';
import { LoginDocs } from './docs/login.docs';
import { RegisterDocs } from './docs/register.docs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  private readonly isProd: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get<string>('NODE_ENV') === 'production';
  }

  @Post('register')
  @Throttle({
    default: {
      ttl: THROTTLER_DEFAULTS.TTL_MS,
      limit: AUTH_THROTTLER.REGISTER_LIMIT,
    },
  })
  @RegisterDocs()
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      result.accessToken,
      cookieConfig(this.isProd),
    );
    return this.isProd ? { user: result.user } : result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      ttl: THROTTLER_DEFAULTS.TTL_MS,
      limit: AUTH_THROTTLER.LOGIN_LIMIT,
    },
  })
  @LoginDocs()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      result.accessToken,
      cookieConfig(this.isProd),
    );
    return this.isProd ? { user: result.user } : result;
  }
}
