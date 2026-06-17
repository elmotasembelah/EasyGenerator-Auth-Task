import { Module } from '@nestjs/common';
import { JwtModule } from '../../common/security/jwt.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';

@Module({
  imports: [UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard],
  exports: [JwtGuard],
})
export class AuthModule {}
