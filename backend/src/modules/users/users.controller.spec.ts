import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { JwtGuard } from '../../common/security/guards/jwt.guard';
import { UsersController } from './users.controller';

const mockUser = {
  sub: 'user-id-1',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockJwtGuard = {
  canActivate: (_ctx: ExecutionContext) => true,
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('me', () => {
    it('should return id, name and email from the decoded JWT payload', () => {
      const req = { user: mockUser } as unknown as Request;

      const result = controller.me(req);

      expect(result).toEqual({
        id: mockUser.sub,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should throw when user is not set on the request', () => {
      const req = {} as Request;

      expect(() => controller.me(req)).toThrow();
    });
  });
});
