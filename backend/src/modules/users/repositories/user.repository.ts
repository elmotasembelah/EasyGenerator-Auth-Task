import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { CreateUserInput } from '../types/create-user.input';
import { FindByEmailOptions } from '../types/find-by-email.options';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserInput): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findByEmail(
    email: string,
    options: FindByEmailOptions = {},
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });

    if (options.withPassword) {
      query.select('+password');
    }

    return query.exec();
  }
}
