import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from '../../common/logger/logger.module';
import { User, UserSchema } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    LoggerModule,
  ],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
