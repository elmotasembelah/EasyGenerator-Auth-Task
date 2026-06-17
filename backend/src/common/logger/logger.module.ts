import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { pinoConfig } from './logger.config';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: pinoConfig,
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
