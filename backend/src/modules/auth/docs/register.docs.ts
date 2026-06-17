import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';

export function RegisterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: RegisterDto }),
    ApiCreatedResponse({
      type: RegisterResponseDto,
      description: 'User registered successfully',
    }),
    ApiBadRequestResponse({ description: 'Validation error' }),
    ApiConflictResponse({ description: 'Email already in use' }),
  );
}
