import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ACCESS_TOKEN_COOKIE } from '../src/common/security/cookie.config';

const USER = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password1!',
};

async function buildApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser.default());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  await app.init();
  return app;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.FRONTEND_URL = 'http://localhost:3001';
    process.env.NODE_ENV = 'test';

    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and set access_token cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(USER)
        .expect(201);

      expect((res.body as { user: unknown }).user).toMatchObject({
        name: USER.name,
        email: USER.email,
      });
      expect(res.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining(ACCESS_TOKEN_COOKIE)]),
      );
    });

    it('should return 409 when email is already registered', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(USER)
        .expect(409);
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...USER, email: 'not-an-email' })
        .expect(400);
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: USER.email, password: USER.password })
        .expect(400);
    });

    it('should return 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...USER, name: 'ab' })
        .expect(400);
    });

    it('should return 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...USER, email: 'other@example.com', password: 'Sh0rt!' })
        .expect(400);
    });

    it('should return 400 when password has no special character', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...USER, email: 'other@example.com', password: 'Password123' })
        .expect(400);
    });

    it('should return 400 when password has no number', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...USER, email: 'other@example.com', password: 'Password!' })
        .expect(400);
    });

    it('should return 400 when password has no letter', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...USER, email: 'other@example.com', password: '12345678!' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login and set access_token cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: USER.email, password: USER.password })
        .expect(200);

      expect((res.body as { user: unknown }).user).toMatchObject({
        name: USER.name,
        email: USER.email,
      });
      expect(res.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining(ACCESS_TOKEN_COOKIE)]),
      );
    });

    it('should return 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: USER.email, password: 'WrongPass1!' })
        .expect(401);
    });

    it('should return 401 for non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: USER.password })
        .expect(401);
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: USER.password })
        .expect(400);
    });

    it('should return 400 when password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: USER.email })
        .expect(400);
    });
  });

  describe('Cookie security attributes', () => {
    it('should set HttpOnly and SameSite=Lax on the cookie after register', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...USER, email: 'cookie-test@example.com' })
        .expect(201);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      const accessTokenCookie = cookies.find((c) =>
        c.startsWith(ACCESS_TOKEN_COOKIE),
      );
      expect(accessTokenCookie).toContain('HttpOnly');
      expect(accessTokenCookie).toContain('SameSite=Lax');
    });

    it('should set HttpOnly and SameSite=Lax on the cookie after login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: USER.email, password: USER.password })
        .expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      const accessTokenCookie = cookies.find((c) =>
        c.startsWith(ACCESS_TOKEN_COOKIE),
      );
      expect(accessTokenCookie).toContain('HttpOnly');
      expect(accessTokenCookie).toContain('SameSite=Lax');
    });
  });

  describe('GET /api/v1/users/me', () => {
    let cookie: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: USER.email, password: USER.password });

      cookie = (res.headers['set-cookie'] as unknown as string[])[0];
    });

    it('should return the current user from the JWT cookie', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Cookie', cookie)
        .expect(200);

      const body = res.body as { id: string; name: string; email: string };
      expect(body).toMatchObject({ name: USER.name, email: USER.email });
      expect(body.id).toBeDefined();
    });

    it('should return 401 when no cookie is provided', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });

    it('should return 401 with a tampered JWT cookie', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Cookie', `${ACCESS_TOKEN_COOKIE}=tampered.jwt.token`)
        .expect(401);
    });

    it('should return 401 with a malformed cookie value', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Cookie', `${ACCESS_TOKEN_COOKIE}=not-a-jwt-at-all`)
        .expect(401);
    });
  });
});

describe('Rate limiting (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.FRONTEND_URL = 'http://localhost:3001';

    // Setup: register a user with throttle skipped
    process.env.NODE_ENV = 'test';
    const setupApp = await buildApp();
    await request(setupApp.getHttpServer()).post('/api/v1/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password1!',
    });
    await setupApp.close();

    // Enable throttling for the actual throttle tests
    process.env.NODE_ENV = 'e2e-throttle';
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('should return 429 after exceeding register limit (3 req/min)', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: `throttle-${i}@example.com`,
          password: 'Password1!',
        });
    }

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'John Doe',
        email: 'throttle-99@example.com',
        password: 'Password1!',
      });

    expect(res.status).toBe(429);
  });

  it('should return 429 after exceeding login limit (5 req/min)', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'john@example.com', password: 'WrongPass1!' });
    }

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'john@example.com', password: 'Password1!' });

    expect(res.status).toBe(429);
  });
});
