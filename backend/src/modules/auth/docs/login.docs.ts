import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginDto } from '../dto/login.dto';

export function LoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Login with email and password' }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({
      type: LoginResponseDto,
      description: 'Login successful',
    }),
    ApiBadRequestResponse({ description: 'Validation error' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );
}
