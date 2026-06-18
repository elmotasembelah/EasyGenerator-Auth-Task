import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function LogoutDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Logout and clear auth cookie' }),
    ApiNoContentResponse({ description: 'Logged out successfully' }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid token' }),
  );
}
