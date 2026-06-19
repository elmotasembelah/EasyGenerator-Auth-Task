import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { corsConfig } from './common/cors/cors.config';
import { setupSwagger } from './common/swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  app.enableCors(corsConfig(app.get(ConfigService)));
  app.useLogger(app.get(Logger));
  app.use(cookieParser.default());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
