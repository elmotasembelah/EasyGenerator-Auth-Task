import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  cookieConfig,
} from '../../common/security/cookie.config';
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
