import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { join } from 'path';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') === 'development';
        const logsDir = join(process.cwd(), 'logs');

        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            redact: ['req.headers.authorization'],
            transport: {
              targets: [
                ...(isDev
                  ? [
                      {
                        target: 'pino-pretty',
                        options: { colorize: true, singleLine: true },
                        level: 'debug',
                      },
                    ]
                  : []),
                {
                  target: 'pino/file',
                  options: { destination: join(logsDir, 'combined.log'), mkdir: true },
                  level: 'info',
                },
                {
                  target: 'pino/file',
                  options: { destination: join(logsDir, 'error.log'), mkdir: true },
                  level: 'error',
                },
              ],
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
