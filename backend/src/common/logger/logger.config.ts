import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';
import { join } from 'path';

const buildTransport = (isDev: boolean) => {
  const logsDir = join(process.cwd(), 'logs');

  return {
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
  };
};

export const pinoConfig = (config: ConfigService): Params => {
  const isDev = config.get<string>('NODE_ENV') === 'development';

  return {
    pinoHttp: {
      level: isDev ? 'debug' : 'info',
      redact: ['req.headers.authorization'],
      transport: buildTransport(isDev),
    },
  };
};
