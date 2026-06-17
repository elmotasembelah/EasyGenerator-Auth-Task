import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import { UserRepository } from './repositories/user.repository';
import { CreateUserInput } from './types/create-user.input';
import { UsersService } from './users.service';

const mockUser = {
  _id: 'user-id-1',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed-password',
};

const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
} as unknown as jest.Mocked<UserRepository>;

const mockLogger = { log: jest.fn(), warn: jest.fn() };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const input: CreateUserInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password1!',
    };

    it('should hash the password before passing it to the repository', async () => {
      mockUserRepository.create.mockResolvedValue(mockUser as never);

      await service.create(input);

      const receivedData = mockUserRepository.create.mock.calls[0][0];
      const isHashed = await bcrypt.compare(
        input.password,
        receivedData.password,
      );

      expect(isHashed).toBe(true);
    });

    it('should not mutate name and email fields', async () => {
      mockUserRepository.create.mockResolvedValue(mockUser as never);

      await service.create(input);

      const receivedData = mockUserRepository.create.mock.calls[0][0];

      expect(receivedData.name).toBe(input.name);
      expect(receivedData.email).toBe(input.email);
    });

    it('should return the created user document', async () => {
      mockUserRepository.create.mockResolvedValue(mockUser as never);

      const result = await service.create(input);

      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when email is already in use', async () => {
      mockUserRepository.create.mockRejectedValue({ code: 11000 });

      await expect(service.create(input)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as never);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
        {},
      );
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toStrictEqual(null);
    });

    it('should pass withPassword option to the repository', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as never);

      await service.findByEmail('john@example.com', { withPassword: true });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
        { withPassword: true },
      );
    });
  });
});
