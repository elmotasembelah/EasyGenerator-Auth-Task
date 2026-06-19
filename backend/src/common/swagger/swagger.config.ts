import { DocumentBuilder } from '@nestjs/swagger';

const SWAGGER_TITLE = 'EasyGenerator Auth Task API';
const SWAGGER_DESCRIPTION =
  "API documentation for EasyGenerator's auth Task endpoints";
const SWAGGER_VERSION = '1.0';

export const swaggerConfig = new DocumentBuilder()
  .setTitle(SWAGGER_TITLE)
  .setDescription(SWAGGER_DESCRIPTION)
  .setVersion(SWAGGER_VERSION)
  .build();
