import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '../../common/security/jwt.module';
import { User, UserSchema } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule,
  ],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
