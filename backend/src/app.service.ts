import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    return `Hello World! NODE_ENV=${nodeEnv}`;
  }
}
