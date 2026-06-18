import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../../common/security/cookie.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthResult = {
  accessToken: 'signed-token',
  user: { id: 'user-id-1', name: 'John Doe', email: 'john@example.com' },
};

const mockAuthService = {
  register: jest.fn().mockResolvedValue(mockAuthResult),
  login: jest.fn().mockResolvedValue(mockAuthResult),
} as unknown as jest.Mocked<AuthService>;

const mockRes = {
  cookie: jest.fn(),
} as unknown as Response;

async function buildController(nodeEnv: string) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      {
        provide: ConfigService,
        useValue: { get: jest.fn().mockReturnValue(nodeEnv) },
      },
    ],
  }).compile();
  return module.get<AuthController>(AuthController);
}

describe('AuthController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should set the access_token cookie', async () => {
      const controller = await buildController('development');
      await controller.register(
        { name: 'John Doe', email: 'john@example.com', password: 'Password1!' },
        mockRes,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRes.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        mockAuthResult.accessToken,
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should return accessToken in body in dev', async () => {
      const controller = await buildController('development');
      const result = await controller.register(
        { name: 'John Doe', email: 'john@example.com', password: 'Password1!' },
        mockRes,
      );
      expect(result).toHaveProperty('accessToken');
    });

    it('should not return accessToken in body in prod', async () => {
      const controller = await buildController('production');
      const result = await controller.register(
        { name: 'John Doe', email: 'john@example.com', password: 'Password1!' },
        mockRes,
      );
      expect(result).not.toHaveProperty('accessToken');
    });
  });

  describe('login', () => {
    it('should set the access_token cookie', async () => {
      const controller = await buildController('development');
      await controller.login(
        { email: 'john@example.com', password: 'Password1!' },
        mockRes,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRes.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        mockAuthResult.accessToken,
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should return accessToken in body in dev', async () => {
      const controller = await buildController('development');
      const result = await controller.login(
        { email: 'john@example.com', password: 'Password1!' },
        mockRes,
      );
      expect(result).toHaveProperty('accessToken');
    });

    it('should not return accessToken in body in prod', async () => {
      const controller = await buildController('production');
      const result = await controller.login(
        { email: 'john@example.com', password: 'Password1!' },
        mockRes,
      );
      expect(result).not.toHaveProperty('accessToken');
    });
  });
});
