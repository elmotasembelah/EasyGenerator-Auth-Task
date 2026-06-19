import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MeResponseDto } from '../dto/me-response.dto';

export function MeDocs() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiOperation({ summary: 'Get current authenticated user' }),
    ApiOkResponse({ type: MeResponseDto, description: 'Current user data' }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid token' }),
  );
}
