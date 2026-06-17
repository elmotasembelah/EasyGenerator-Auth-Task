import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { jwtConfig } from './jwt.config';

@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
