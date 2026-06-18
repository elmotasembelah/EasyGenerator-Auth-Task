import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ACCESS_TOKEN_COOKIE } from '../cookie.config';
import { JwtGuard } from './jwt.guard';

const mockPayload = { sub: 'user-id-1', email: 'john@example.com' };

const mockJwtService = {
  verify: jest.fn(),
} as unknown as jest.Mocked<JwtService>;

function buildContext(cookies: Record<string, string>) {
  const request = { cookies, user: undefined };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    request,
  } as unknown as ExecutionContext & { request: typeof request };
}

describe('JwtGuard', () => {
  let guard: JwtGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<JwtGuard>(JwtGuard);
    jest.clearAllMocks();
  });

  it('should return true and set request.user when token is valid', () => {
    mockJwtService.verify.mockReturnValue(mockPayload);
    const ctx = buildContext({ [ACCESS_TOKEN_COOKIE]: 'valid-token' });

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(ctx.request.user).toEqual(mockPayload);
  });

  it('should throw UnauthorizedException when cookie is missing', () => {
    const ctx = buildContext({});

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid', () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });
    const ctx = buildContext({ [ACCESS_TOKEN_COOKIE]: 'bad-token' });

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
