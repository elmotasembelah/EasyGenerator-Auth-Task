import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const databaseConfig = (
  config: ConfigService,
): MongooseModuleOptions => ({
  uri: config.getOrThrow<string>('MONGODB_URI'),
});
