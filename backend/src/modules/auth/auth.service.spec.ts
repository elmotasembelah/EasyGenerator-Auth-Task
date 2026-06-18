import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const mockUser = {
  id: 'user-id-1',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed-password',
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
} as unknown as jest.Mocked<UsersService>;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
} as unknown as jest.Mocked<JwtService>;

const mockLogger = { log: jest.fn(), warn: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('signed-token');
  });

  describe('register', () => {
    it('should create a user and return accessToken and user', async () => {
      mockUsersService.create.mockResolvedValue(mockUser as never);

      const result = await service.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should sign the JWT with sub and email', async () => {
      mockUsersService.create.mockResolvedValue(mockUser as never);

      await service.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe('login', () => {
    it('should return accessToken and user on valid credentials', async () => {
      const hashed = await bcrypt.hash('Password1!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      } as never);

      const result = await service.login({
        email: 'john@example.com',
        password: 'Password1!',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noone@example.com', password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const hashed = await bcrypt.hash('Password1!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      } as never);

      await expect(
        service.login({ email: 'john@example.com', password: 'WrongPass1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should fetch user with withPassword option', async () => {
      const hashed = await bcrypt.hash('Password1!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      } as never);

      await service.login({
        email: 'john@example.com',
        password: 'Password1!',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
        { withPassword: true },
      );
    });
  });
});
