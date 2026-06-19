import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import { UserDocument } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { CreateUserInput } from './types/create-user.input';
import { FindByEmailOptions } from './types/find-by-email.options';
import { USERS_CONSTANTS } from './users.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async create(data: CreateUserInput): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(
      data.password,
      USERS_CONSTANTS.SALT_ROUNDS,
    );

    try {
      const user = await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });
      this.logger.log(
        { event: 'user:created', email: data.email },
        'User created',
      );
      return user;
    } catch (error) {
      if (
        (error as { code?: number }).code ===
        USERS_CONSTANTS.MONGO_DUPLICATE_KEY_CODE
      ) {
        this.logger.warn(
          { event: 'user:create:duplicate', email: data.email },
          'Duplicate email',
        );
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async findByEmail(
    email: string,
    options: FindByEmailOptions = {},
  ): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email, options);
  }
}
