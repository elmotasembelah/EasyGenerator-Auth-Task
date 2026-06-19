import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { jwtConfig } from './jwt.config';
import { JwtGuard } from './guards/jwt.guard';

@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
  ],
  providers: [JwtGuard],
  exports: [NestJwtModule, JwtGuard],
})
export class JwtModule {}
