# AI Usage Documentation

This file documents how AI assistance (Claude) was used throughout the development of this project, as required by the task submission guidelines.

---

## Approach

AI was used as a force multiplier — handling scaffolding, boilerplate, and structure decisions quickly, while I maintained ownership of the architecture, reviewed every output, and made the final calls on approach and implementation details.

---

## Key Prompts & Decisions

### 1. Initial Planning & Task Breakdown

**Prompt:**

> "this is a new project/task. we will be building an auth flow (frontend / backend). the backend will be with nestjs, frontend will be with react. here is the received docs of the task [...] read it and understand what we will be building, as you can see it's an evaluation task for an interview process. we will be building it step by step, feel free to tell me if am doing something wrong or if u want to suggest diff approaches than what i am doing, i will review ur suggestions and decide what to do"

**What AI did:**

- Analyzed the task requirements and identified all deliverables (signup, signin, protected route, README, AI.md)
- Flagged bonus scoring criteria worth targeting: logging, error handling, tests, Swagger docs, CI/CD
- Asked clarifying questions on repo structure, UI library, and testing preference before writing any code

**My decisions:**

- Monorepo structure (`/backend` + `/frontend` at the root)
- shadcn/ui + Tailwind for the frontend
- Include basic tests (they're scored)

---

### 2. Build Order & Step Design

**Prompt:**

> "Init NestJS app / .env + ConfigModule / Logger setup ← moved up here / Database connection + verify it connects / Health check / Swagger setup / Users module — schema + service only / Auth module — register, sign-in, JWT strategy, guard / Users controller — GET /me / CORS config / Frontend / Tests / GitHub Actions CI
>
> here is the order of subtasks that i designed, we will be following this, don't jump to final conclusions of each module/step"

**What AI did:**

- Accepted the order without reordering or collapsing steps
- Committed to not jumping ahead between modules

---

### 3. Git Workflow

**Prompt:**

> "let's do the initial commit, and afterwards we will be following the conventional commits pattern for commit messages. for this project we will be using 2 branches, main and dev. add a note in the md file that because this is a simpler task we will not be going full git flow with feat branches"

**What AI did:**

- Removed the nested `.git` folder that `nest new` created inside `backend/` (would have prevented the root repo from tracking those files)
- Set up conventional commits format for all messages (`feat:`, `fix:`, `chore:`, `docs:`, etc.)

**My decision:**

- No feature branches — two-branch model (main + dev) is sufficient for a scoped assessment

---

### 4. ConfigModule Setup

**Prompt:**

> "okey so for now let's setup the config module, we will be using nestjs config module"

**Thinking flow:**

- Install `@nestjs/config`, register `ConfigModule.forRoot({ isGlobal: true })` in `AppModule` — makes `ConfigService` injectable everywhere without re-importing per module

**Prompt:**

> "we will add the vars as we build their module. so for now we will just install the config and make it global in the app module"

**My correction:** AI suggested defining all env vars upfront. I redirected to add vars incrementally per module.

**Prompt:**

> "let's test it and log the env in the response of the getHello endpoint"

**Thinking flow:**

- Injected `ConfigService` into `AppService`, read `NODE_ENV`, returned it in the hello response as a quick smoke test

**Problem encountered:**

**Prompt:**

> "it is coming back as undefined. the command to start the app doesn't set it explicitly. we will need cross-env to set it up"

**Thinking flow:**

- `NODE_ENV` was undefined because the NestJS start scripts don't set it — `@nestjs/config` loads `.env` file values but `NODE_ENV` is a process-level concern, not a `.env` concern
- I identified the root cause; AI implemented the fix using `cross-env` in all four npm start scripts, which works cross-platform (Windows + Unix)

---

### 5. Logger Setup (Pino)

**Prompt:**

> "okey so now let's start working on the logger. we will use pino logger. we will setup file based logging at the root logs folder with combined and error log files. we will be using pino for it's structured logs. it will be in the common folder since it is shared and infra not a feature"

**What AI did:**

- Created `src/common/logger/` with `logger.module.ts` and `logger.config.ts`
- Configured `nestjs-pino` with multi-target transport: `pino-pretty` in dev, `pino/file` to `logs/combined.log` and `logs/error.log` always
- Wired `LoggerModule` into `AppModule` and set Pino as the app logger in `main.ts` with `bufferLogs: true`

**Prompt:**

> "no need for pino http. we will just use nestjs-pino, pino, and pino-pretty for dev logs"

**My correction:** AI initially suggested `pino-http` as a separate install. I scoped it down — `nestjs-pino` already handles the HTTP layer internally.

**Prompt:**

> "i am moving the logs folder inside of the backend folder, it's not in the root of the monorepo"

**My correction:** AI initially set `logsDir` one level up (`../logs`). I decided logs belong inside `backend/`, so AI updated the path to `process.cwd()/logs`.

**Prompt:**

> "now the setup works but let's refactor it. we have the setup inline in the logger.module.ts. let's create a logger.config.ts file that will have all the setup and config and then import it in the logger.module.ts"

**What AI did:** Extracted all config into `logger.config.ts`, leaving `logger.module.ts` as pure wiring.

**Prompt:**

> "let's define the transport on its own, create a simple function that takes isDev and returns the correct setup for the transport"

**What AI did:** Extracted `buildTransport(isDev)` as a standalone function inside `logger.config.ts`, separating transport logic from the main config factory.

**Prompt:**

> "add export PinoLoggerModule so it's explicit what the contract for the logger module is"

**What AI did:** Added `exports: [PinoLoggerModule]` to `LoggerModule` to make the public API explicit.

**My correction:** When committing the logger feature, AI staged only the source files and left `package.json` and `pnpm-lock.yaml` out of the commit. I caught this and directed AI to include all related files in the same commit.

---

### 6. Database Module (MongoDB + Mongoose)

**Prompt:**
> "okey so let's start working on the next step which is the db. we will be using mongodb and our orm will be mongoose. i have added .env and the .env.example files and updated them with the needed keys for this module. as the logger module, this will be in the common since it's infra. and it will have database.config.ts and database.module.ts files with our established separation of concern pattern"

**What AI did:**
- Created `src/common/database/` with `database.config.ts` holding the `MongooseModuleOptions` factory and `database.module.ts` as pure wiring with `exports: [MongooseModule]`
- Wired `DatabaseModule` into `AppModule`

**Prompt:**
> "okey so connection setup and working, but what is the best way to log connection successful?"

**What AI did:** Added `OnModuleInit` to `DatabaseModule` using `@InjectConnection()` to access the Mongoose `Connection` and log the connected host via `new Logger(DatabaseModule.name)` — which routes through Pino since it's set as the app logger.

**Prompt:**
> "add fail state"

**What AI did:** Added an `else` branch logging `this.logger.error()` with the `readyState` value when the connection is not in the connected state.

---

### 7. Swagger Setup

**Prompt:**
> "okey so we already have the health check so we can skip that. let's start with swagger setup so once we start adding endpoints we can test them"

**Prompt:**
> "we will start that simple and then we will refactor. EasyGenerator Auth Task API / API documentation for EasyGenerator's auth Task endpoints / these are the title and the desc / version is 1.0"

**What AI did:** Added the Swagger setup inline in `main.ts` with the provided title, description, and version, exposed at `/docs`. I installed `@nestjs/swagger`.

**Prompt:**
> "okey so things are working, but instead of having the setup in the main.ts let's create in the common folder swagger folder with swagger.config.ts and swagger.setup.ts. swagger.setup.ts will expose a function that will take the app and setup the swagger"

**What AI did:** Extracted setup into `src/common/swagger/` — `swagger.config.ts` holds the `DocumentBuilder` config, `swagger.setup.ts` exposes `setupSwagger(app)` which is called from `main.ts`.

**Prompt:**
> "okey so now instead of having the string values inline let's put them in global vars"

**What AI did:** Extracted the title, description, and version into named constants in `swagger.config.ts`, and moved `SWAGGER_PATH` to `swagger.setup.ts` since it's a setup concern not a document concern.

**My decision:** Kept constants in their respective files rather than creating a `swagger.constants.ts` — the values are only used in one place each so a dedicated constants file would just add an extra hop with no benefit.

---

### 8. Users Module

**Prompt:**
> "let's start working on the users module, this is the start of the feature modules. the features modules will have multiple main layers: controllers, services, repos, entity. and the other main nestjs layers like guards, pipe. from the task docs the user will have: name (min 3 chars), email (valid email format), password (min 8 chars, atleast 1 letter, atleast 1 number, atleast 1 special char). all required. we will follow security best practices like storing password hash not the actual password"

**My decision:** Custom repository pattern — `UserRepository` wraps the Mongoose model, keeping Mongoose out of the service layer and making the service independently testable. AI asked for clarification on the repo approach; I confirmed it was always the intent.

**My decision:** Feature modules live under `src/modules/` rather than directly under `src/` — keeps infra (`common/`) and features (`modules/`) clearly separated. I made this call after seeing the flat structure and decided it looked cleaner.

**What AI did:**
- Created `user.entity.ts` with `@Schema` decorator, `name`, `email`, `password` fields and `timestamps: true`
- Created `user.repository.ts` with `create` and `findByEmail` methods wrapping the Mongoose model
- Created `users.service.ts` delegating to the repository
- Wired everything in `users.module.ts` with `MongooseModule.forFeature`, exporting `UsersService`

**My correction:** AI used `Partial<User>` as the input type for `create`. I directed replacing it with an explicit `CreateUserInput` interface in a `types/` folder — decouples the input contract from the entity type.

**What AI did:** Created `src/modules/users/types/create-user.input.ts` with `name`, `email`, `password` as explicit string fields, and updated the repository and service to use it.

**Prompt:**
> "let's add select false to the password field for security. and in the repo layer we need to add findbyemail options type and accept option withPassword, and if it is true then we add back the password in the query"

**What AI did:** Added `select: false` to the password field in the entity, created `FindByEmailOptions` interface with `withPassword?: boolean`, and updated `findByEmail` to conditionally add `.select('+password')` to the query.

**My correction:** `FindByEmailOptions` was initially defined inside the repository file. I directed moving it to the `types/` folder for consistency.

**Prompt:**
> "okey so now there is no hashing done, we need to hash the password before we save it. do that in the service layer since that is business logic"

**What AI did:** Added password hashing in `UsersService.create()` before passing data to the repository. I installed `bcrypt` and `@types/bcrypt`.

**Prompt:**
> "okey so create a users.constants.ts with an obj. this config file will store the constants of the users module like the salt rounds"

**What AI did:** Created `users.constants.ts` with a `USERS_CONSTANTS` object and moved `SALT_ROUNDS` into it, updated the service to reference `USERS_CONSTANTS.SALT_ROUNDS`.

**Prompt:**
> "we need to add testing logic to it, add some unit tests: create service / try creating a user / try to create the same user / make sure the repo receives the hashed pass not the original one and that the other fields are not changed / find by email / try fetching the same user we created / and fetching a non existent user"

**What AI did:** Created `users.service.spec.ts` with mocked `UserRepository`, testing: password is hashed before reaching the repo, name and email fields are not mutated, the created document is returned, `findByEmail` returns a user when found, and returns null when not found.

**My correction:** AI initially used untyped mocks causing ESLint `no-unsafe-assignment` errors. I directed resetting to focus on behavior not typing — AI resolved it using `as unknown as jest.Mocked<UserRepository>`.

**Prompt:**
> "add it" (adding the `withPassword` option test case)

**What AI did:** Added a test verifying that `{ withPassword: true }` is passed through from the service to the repository — covering the security-sensitive branch.

**Prompt:**
> "let's add error handling in the create service to handle when the entered email is already used. right now there is no handling of that. try catch the call to the repo and handle the error"

**What AI did:** Wrapped the `userRepository.create` call in a try/catch, checking for MongoDB duplicate key error code `11000` and throwing `ConflictException('Email already in use')`, re-throwing all other errors. Added a matching test case for this scenario.

**Prompt:**
> "now let's add logging to the create in both cases. the success case will log info with `{ event: 'user:created', email: data.email }, 'User created'` and the fail will be warn `{ event: 'user:create:duplicate', email: data.email }, 'Duplicate email'`"

**What AI did:** Injected `Logger` from `nestjs-pino` into `UsersService`, added structured `log()` on success and `warn()` on duplicate. Imported `LoggerModule` into `UsersModule` to provide the `Logger` token. Updated the spec to provide a `mockLogger` so tests don't break.

**Pre-commit review:** I asked AI to review the module before committing. AI identified several improvement points, I agreed to two:

1. **Add `trim: true` to `name` and `email` fields** — without it, leading/trailing whitespace would be stored and `" John"` and `"John"` would be treated as different values.
2. **Move MongoDB duplicate key error code `11000` to `USERS_CONSTANTS`** as `MONGO_DUPLICATE_KEY_CODE` — eliminates the magic number sitting inline in the service catch block.

---

### 9. Make LoggerModule Global

**Prompt:**
> "okey so before we continue. let's make the logger global like the config"

**My decision:** I wanted to follow the same pattern as `ConfigModule` — make the logger available everywhere without re-importing it in each feature module. My initial thought was to set it as global in `AppModule` rather than inside `LoggerModule` itself, to stay consistent with how `ConfigModule.forRoot({ isGlobal: true })` works.

AI clarified that `ConfigModule.isGlobal` is a built-in option on NestJS's `ConfigModule`, not a pattern we can replicate — to make our own module global, the `@Global()` decorator must be placed on the module class itself. After that clarification, I agreed to go with `@Global()` on `LoggerModule`.

**What AI did:**
- Added `@Global()` decorator to `LoggerModule`
- Removed the now-redundant `LoggerModule` import from `UsersModule` and `AuthModule`

---

### 10. Auth Module

**Prompt:**
> "okey so now let's start working on the auth module. we will have 2 flows, login and register. there will be no entity or repo, just controllers and services. we will have the dto folder. i will add the vars to the .env and the .env.example"

**My decisions:**
- Access token only — no refresh token
- Manual JWT setup (no Passport)
- I installed `@nestjs/jwt` and ran the nest generate commands myself

**What AI did:**
- Created `register.dto.ts` with `@IsString() @MinLength(3)` on `name`, `@IsEmail()` on `email`, and `@IsString() @MinLength(8) @Matches(...)` on `password` enforcing at least one letter, number, and special character
- Created `login.dto.ts` with `@IsEmail()` on `email` and `@IsString()` on `password`
- Created `auth.service.ts` with `register` and `login` methods — both sign a JWT with `{ sub: user.id, email }` and return `{ accessToken, user: { id, name, email } }`
- `login` fetches the user with `{ withPassword: true }`, runs `bcrypt.compare`, throws `UnauthorizedException('Invalid credentials')` on either missing user or wrong password — same message for both to avoid user enumeration
- Both methods log structured events: `auth:register` and `auth:login`
- Created `jwt.guard.ts` — extracts Bearer token from `Authorization` header, calls `jwtService.verify<{ sub, email }>()`, sets `request['user'] = payload`, throws `UnauthorizedException` on missing or invalid token
- Created `auth.module.ts` importing `UsersModule` and `JwtModule.registerAsync` reading `JWT_SECRET` and `JWT_EXPIRES_IN` from config, exporting `JwtGuard` and `JwtModule`
- Created `auth.controller.ts` with `POST /auth/register` and `POST /auth/login` (`@HttpCode(200)`)

---

### 11. Extract JWT to Common Security Module

**Prompt:**
> "let's extract the jwt to it's own folder in common under security. config file and module file. then we will inject it in the auth"

**What AI did:**
- Created `src/common/security/jwt.config.ts` with a `jwtConfig(config: ConfigService): JwtModuleOptions` factory reading `JWT_SECRET` and `JWT_EXPIRES_IN`
- Created `src/common/security/jwt.module.ts` as a `@Global()` module that registers `JwtModule.registerAsync` using the config factory and exports it
- Added `JwtModule` to `AppModule` imports alongside `LoggerModule` and `DatabaseModule`
- Stripped `JwtModule.registerAsync` wiring and the now-redundant `ConfigModule`/`ConfigService` imports out of `auth.module.ts` — it now only imports `UsersModule`

**My decision:** Add constants for the JWT env key names — same pattern as `users.constants.ts`.

**What AI did:** Created `src/common/security/jwt.constants.ts` with `JWT_CONSTANTS = { SECRET_KEY, EXPIRES_IN_KEY }` and updated `jwt.config.ts` to reference them — no magic strings inline.

**My decision:** Removed `@Global()` from `JwtModule`. AI initially made it global and then tried to remove it from `AppModule`, then tried to remove it from `AuthModule` — both wrong. I caught both mistakes. The correct setup: `JwtModule` stays in `AppModule` as shared infrastructure AND is explicitly imported in `AuthModule` since it directly uses `JwtService`.

---

### 12. Swagger Docs for Auth Endpoints

**Prompt:**
> "we need to add swagger docs to each endpoint so i can test it in swagger docs"

**What AI did:** Added `@ApiTags`, `@ApiOperation`, `@ApiResponse`, and `@ApiBody` directly on the controller and `@ApiProperty` on the DTOs.

**Prompt:**
> "things look too ugly right now in the controller. let's create a docs folder and create custom decorators that aggregate each endpoint doc decorators. each endpoint should have it's own .docs.ts file"

**What AI did:**
- Created `auth/docs/register.docs.ts` exporting `RegisterDocs()` — a composed decorator using `applyDecorators`
- Created `auth/docs/login.docs.ts` exporting `LoginDocs()`
- Cleaned up `auth.controller.ts` to use a single `@RegisterDocs()` / `@LoginDocs()` decorator per endpoint

**My decision:** Use typed response decorators (`ApiCreatedResponse`, `ApiOkResponse`, `ApiBadRequestResponse`, etc.) instead of generic `@ApiResponse({ status: ... })`.

**My decision:** Add `@ApiBody` with the DTO type so Swagger renders the full request body schema with examples.

**Prompt:**
> "now let's add the types for the other responses"

**What AI did:** Created `register-response.dto.ts` and `login-response.dto.ts` — each with a nested user DTO and `accessToken` field — and wired them into the docs files via `type:` on the success response decorators.

**My corrections:**
- AI initially named the file `auth-response.dto.ts` — I directed renaming it to `register-response.dto.ts`
- AI created two separate types but initially left `id` out of `LoginResponseDto` — I caught it and added it back
- I decided these response DTOs are for Swagger documentation only and should not be used to type the controller return values — no unnecessary coupling to the service layer

---

### 13. API Prefix and Versioning

**Prompt:**
> "now let's add api prefix and versioning to main.ts"

**What AI did:** Added `app.setGlobalPrefix('api')` and `app.enableVersioning({ type: VersioningType.URI })` in `main.ts`, and added `version: '1'` to the `@Controller` decorator on `AuthController` and `AppController`. Routes are now `/api/v1/auth/register` and `/api/v1/auth/login`.

---

---

### 14. Cookie-Based JWT

**Prompt:**
> "let's setup cookie based jwt implementation. right now we are adding it in the body but we want to add it to the response obj. the cookie setup will be httponly true, secure (according to env, if prod true if dev false), samesite: lax, maxage: 1 day. we will keep the access token for dev env but in prod env we will not return it"

**What AI did:**
- Installed `cookie-parser` and `@types/cookie-parser`, wired it into `main.ts` via `app.use(cookieParser.default())`
- Created `src/common/security/cookie.config.ts` with `cookieConfig(isProd: boolean): CookieOptions` returning `httpOnly: true`, `secure: isProd`, `sameSite: 'lax'`, `maxAge: 24 * 60 * 60 * 1000`, and exported `ACCESS_TOKEN_COOKIE = 'access_token'` as the cookie name constant
- Updated `AuthController` to inject `ConfigService`, resolve `isProd` once in the constructor, and use `@Res({ passthrough: true })` on both endpoints to set the cookie without taking over the response
- In dev: returns `{ accessToken, user }` — token is in both cookie and body for easier testing
- In prod: returns `{ user }` only — token is in the cookie only

**My decision:** Removed the `Authorization` header fallback from `JwtGuard` — since our only consumers are browsers, cookies are sufficient. The guard now reads exclusively from the `access_token` cookie. Non-browser clients (mobile, CLI) are out of scope.

---

### 15. Auth Module Tests

**Prompt:**
> "now add some tests for the new module"

**What AI did:** Created `auth.service.spec.ts` covering:
- `register` returns `{ accessToken, user }` and signs JWT with `{ sub, email }`
- `login` returns token on valid credentials, throws `UnauthorizedException` on missing user, throws on wrong password, passes `{ withPassword: true }` to `UsersService`

**Prompt:**
> "so why no controller tests?"

**What AI did:** Created `auth.controller.spec.ts` covering the controller's only real logic — the prod/dev conditional:
- Cookie is set with `httpOnly: true` on both register and login
- Dev: `accessToken` is present in response body
- Prod: `accessToken` is absent from response body

**Prompt:**
> "let's add some for that" (referring to JwtGuard)

**What AI did:** Created `guards/jwt.guard.spec.ts` covering:
- Valid token → returns `true` and sets `request.user` with the JWT payload
- Missing cookie → throws `UnauthorizedException('Missing token')`
- Invalid token → throws `UnauthorizedException('Invalid token')`

---

### 16. Type Express Request.user

**Prompt:**
> "okey so let's add the typing to the request obj for the user since we will start now working on the guarded endpoint"

**What AI did:**
- Created `src/common/types/express.d.ts` extending the Express `Request` interface via declaration merging to add `user?: { sub: string; email: string }`
- Updated `JwtGuard` to use `request.user = payload` instead of the untyped `request['user'] = payload`
- No `tsconfig.json` changes needed — TypeScript picks up `.d.ts` files under `src` automatically

---

### 17. Move JwtGuard to Common Security

**My decision:** Proactively moved `JwtGuard` from `src/modules/auth/guards/` to `src/common/security/guards/` before building the users controller — anticipating that importing `AuthModule` into `UsersModule` (to access the guard) would create a circular dependency since `AuthModule` already imports `UsersModule`.

**What AI did:**
- Moved `jwt.guard.ts` and `jwt.guard.spec.ts` to `src/common/security/guards/`
- Added `JwtGuard` as a provider and export in `JwtModule` so any module importing `JwtModule` gets the guard
- Removed `JwtGuard` from `AuthModule` providers and exports
- Updated all import paths accordingly

---

### 18. Store User Object in JWT Payload

**My decision:** Instead of refetching the user from the DB on `GET /me`, store `{ sub, email, name }` in the JWT at sign time and return the decoded payload directly. The token is the source of truth for the current user's identity — no extra DB query needed.

**What AI did:**
- Added `name` to the JWT sign payload in `AuthService.register` and `AuthService.login`
- Updated `express.d.ts` to include `name` in `request.user` and made it non-optional since the guard always sets it before protected routes run

---

### 19. GET /me Endpoint

**Prompt:**
> "yeah let's start working on it"

**What AI did:**
- Created `users/dto/me-response.dto.ts` with `id`, `name`, `email` fields for Swagger
- Created `users/docs/me.docs.ts` with `@ApiCookieAuth`, `@ApiOperation`, `@ApiOkResponse`, `@ApiUnauthorizedResponse`
- Created `UsersController` with `GET /me` protected by `@UseGuards(JwtGuard)`, returning `{ id: req.user.sub, name: req.user.name, email: req.user.email }` directly from the decoded JWT — no DB call
- Updated `UsersModule` to import `JwtModule` (which exports `JwtGuard`)

**Tests — `users.controller.spec.ts`:**
- Returns correct shape from decoded JWT payload
- Throws when `user` is not set on the request
- Used `.overrideGuard(JwtGuard)` in the test module to avoid resolving `JwtService` in unit tests

---

### 20. CORS Configuration

**Prompt:**
> "let's start working on cors. i will setup FRONTEND_URL in env and we will read it and use it. we will have a cors folder in the common folder that will house the config for cors"

**What AI did:**
- Added `FRONTEND_URL=` to `.env.example`
- Created `src/common/cors/cors.config.ts` with `corsConfig(config: ConfigService): CorsOptions` — reads `FRONTEND_URL` via `getOrThrow` and sets `credentials: true` so the browser sends cookies cross-origin
- Wired `app.enableCors(corsConfig(app.get(ConfigService)))` in `main.ts` — same factory pattern as `jwtConfig` and `pinoConfig`

---

### 21. Rate Limiting (Throttler)

**Prompt:**
> "let's work on the throttler. general ttl should be 1 min, and 10 req. then the public auth endpoints like login and register will have their own limits. ttl is the same. register 3 req, login 5 req"

**What AI did:**
- Installed `@nestjs/throttler`
- Created `src/common/throttler/throttler.config.ts` with `THROTTLER_DEFAULTS` (TTL: 60s, limit: 10) and `throttlerConfig()` factory
- Registered `ThrottlerModule` globally in `AppModule` with `ThrottlerGuard` as `APP_GUARD`
- Applied `@Throttle` directly on the `register` and `login` controller methods

**My correction:** AI initially put the auth-specific limits (`REGISTER_LIMIT`, `LOGIN_LIMIT`) inside the global `throttler.config.ts`. I directed moving them to `auth.constants.ts` — they are module-specific concerns and don't belong in the shared infra config.

---

### 22. Fix AppController spec after AppService gained ConfigService dependency

**What happened:**
`AppService` was updated to inject `ConfigService` (to expose `NODE_ENV` in `getHello()`), but the generated `app.controller.spec.ts` was never updated. Running tests failed with: `Nest can't resolve dependencies of the AppService (?). ConfigService is not available in RootTestModule`.

**Fix:**
- Added a `ConfigService` mock to the test module providers: `{ provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test') } }`
- Updated the assertion from `'Hello World!'` to `'Hello World! NODE_ENV=test'` to match the actual return value

---

### 23. E2E Test Suite

**Prompt:**
> "now let's work on the app.e2e-spec.ts file"
> "yup let's use mongodb-memory-server for the e2e tests"
> "add tests for the throttler, for security (httponly, and same site), add test for protected /me endpoint, and edge cases for the auth flow like missing fields, password too weak"

**What AI did:**
- Installed `mongodb-memory-server` as a dev dependency
- Rewrote `test/app.e2e-spec.ts` to spin up a `MongoMemoryServer` instance and set env vars in `beforeAll` — no real DB needed
- Covered the full auth flow end-to-end:
  - `POST /api/v1/auth/register` — happy path, 409 on duplicate email, 400 for all validation failures (missing name, short name, weak/short/missing-char passwords)
  - `POST /api/v1/auth/login` — happy path, 401 for wrong password/unknown email, 400 for missing fields
  - Cookie security: asserts `HttpOnly` and `SameSite=Lax` attributes on the `set-cookie` header
  - `GET /api/v1/users/me` — authenticated, unauthenticated, tampered JWT, malformed cookie
  - Rate limiting: 429 after exceeding register limit (3) and login limit (5)

**Throttler problem and fix:**
The throttler tests and functional tests shared the same in-process app and the same IP (`127.0.0.1`). The first two register requests consumed the 3-request limit, causing all subsequent validation-testing requests to get 429 instead of 400.

**Attempts that didn't work:**
1. `overrideModule(ThrottlerModule)` — NestJS didn't replace the already-wired module
2. `overrideProvider(APP_GUARD)` — `APP_GUARD` is a multi-provider token; replacing one slot left the `ThrottlerGuard` still active

**Fix that worked (user's decision):**
After both override approaches failed, I decided to configure the throttler itself to skip based on the environment — adding `skipIf: () => process.env.NODE_ENV === 'test'` to `throttlerConfig()`. This keeps the throttler wired up in production while disabling it cleanly in the test environment without any test-module trickery.
- Functional tests run with `NODE_ENV=test` (throttle skipped)
- The dedicated rate-limiting `describe` block sets `NODE_ENV=e2e-throttle` before building its app so the real throttler kicks in

---

### 24. Helmet (Security Headers)

**Prompt:**
> "let's add helmet for extra security and protection"

**What AI did:**
- Installed `helmet`
- Added `app.use(helmet())` in `main.ts` before CORS and all other middleware — ensures security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.) are applied to every response

_This file will be updated incrementally as each module is completed._

---

## What's Next (Backend)

These are the improvements and features that would be added in a production continuation of this project.

### Authentication
- **OAuth 2.0 (Google / GitHub)** — add social login via Passport OAuth strategies so users can register and sign in without a password
- **Email verification** — send a verification link on register and block login until the email is confirmed
- **Forgot password / reset** — generate a signed, time-limited reset token and email it to the user

### Security
- **Brute-force lockout** — track failed login attempts per user in the DB and temporarily lock the account after N failures
- **Audit log** — persist a record of every login, logout, and password change with IP and user-agent for compliance and incident response

---

## Frontend

### 25. Scaffold Vite React TS

**Prompt:**
> "let's start with the frontend part of this task. we will be using react with vite and react router, protected and public routes, feature based arch, tailwind+shadcn for comps and styling"

**Building steps:**
1. Scaffold Vite React TS
2. Install dependencies
3. Setup `.env` with `VITE_API_URL`
4. Axios instance + interceptor
5. Zustand auth store
6. PrivateRoute + PublicRoute components
7. Register page
8. Sign in page
9. Welcome page

**What AI did:**
- Scaffolded `frontend/` using `pnpm create vite@latest frontend -- --template react-ts`
- Stack: React 19, TypeScript, Vite

---

### 26. Axios API Client

**Prompt:**
> "we will create lib/api/api.client.ts and setup our axios instance in that file"

**What AI did:**
- Created `src/lib/api/api.client.ts` with an axios instance pointing to `VITE_API_URL`
- Set `withCredentials: true` globally so every request sends the `access_token` cookie automatically — no per-request config needed

**Note:** A 401 response interceptor was discussed and drafted but deferred — it will be added when the auth feature is wired up, not during initial setup.

---

### 27. Auth Store, React Query Setup & Auth Init Hook

**Prompt:**
> "before we start with the store, we are going to work feature based, and the auth store is part of the auth feature, so we will create a features/auth/store/auth.store.ts file"

**My decisions:**
- Feature-based architecture — all auth concerns live under `features/auth/`, not scattered across global folders
- Each concern gets its own subfolder:
  - `store/` — Zustand state
  - `hooks/` — React Query hooks
  - `services/` — API call logic
  - `constants/` — endpoint paths and query keys
  - `types/` — TypeScript interfaces
  - `builders/` — response-to-model mappers
  - `components/` — feature-scoped UI components
- Auth store lives under `features/auth/store/` — not a global store — because it is feature-specific state
- Store shape: `user`, `isAuthenticated`, `isUserLoading` — with `setUser` and `clearUser` as the only actions
- `isUserLoading` starts as `true` and is flipped to `false` inside `setUser` and `clearUser` directly — no separate `setIsUserLoading` action needed since loading is always resolved by one of those two paths

**Prompt:**
> "the hook will be called useAuthInit and it will use react query. the call to the endpoint will be done with a service layer that will own the call. and we will have an auth.constants that will house the endpoints key and query keys"

**What AI did:**
- Created `features/auth/constants/auth.constants.ts` — `AUTH_ENDPOINTS` and `AUTH_QUERY_KEYS`
- Created `features/auth/services/auth.service.ts` — `getMe()` using `apiClient`
- Created `features/auth/hooks/useAuthInit.ts` — `useQuery` with `retry: false` (avoids 3-retry delay on unauthenticated users), syncs store via `setUser` / `clearUser` on settle

**Prompt:**
> "we will need to setup the provider for react query — separate providers file"

**My decision:** Provider lives in `src/providers.tsx` (not inline in `main.tsx`) to keep `main.tsx` clean and make it easy to add future providers (e.g. theme, toast) in one place.

---

### 28. Auth Types & Response Mapping

**Prompt:**
> "let's add a builder/dto file for the response of the user so the system won't be coupled with the user object shape"

**My decisions:**
- Types live in `features/auth/types/auth.types.ts` — keeping them scoped to the feature
- Mapper function belongs in a dedicated `features/auth/builders/auth.builders.ts` — not in the types file, since it's logic not a type definition

**What AI did:**
- Created `auth.types.ts` with `User` (internal app shape) and `MeResponse` (API response shape) interfaces
- Created `auth.builders.ts` with `meResponseToUser` mapper — decouples the app from the API shape, ready to handle divergence without touching the rest of the codebase
- Updated `auth.service.ts` to import the mapper from `builders/` and the types from `types/`
- Updated `auth.store.ts` to import `User` from `auth.types.ts` instead of defining it inline — single source of truth

---

### 29. Router Setup

**Prompt:**
> "we will use react router dom, each module will have its own pages, let's setup then we start creating the pages for auth flows"

**My decisions:**
- Each feature owns its routes — `features/auth/auth.routes.tsx` defines auth-specific routes
- Root `src/router.tsx` composes all feature routes together — keeps the root router clean as features grow
- `App.tsx` is replaced with just `<RouterProvider router={router} />` — no boilerplate left

**What AI did:**
- Created `features/auth/auth.routes.tsx` with `/login`, `/register`, `/profile` using `lazy` imports for code splitting
- Created `src/router.tsx` that spreads `authRoutes` into `createBrowserRouter`
- Replaced `App.tsx` boilerplate with `RouterProvider`
- Created stub pages (`LoginPage`, `RegisterPage`, `ProfilePage`) so the app compiles before the real UI is built

**Pattern — lazy loading with React Router v6.4+:**
React Router's `lazy` prop (data router API) requires the module to export a named `Component` export, not a default export. All page files use `export function Component()` instead of `export default` so code splitting works automatically per route with no extra wiring.

---

### 30. Tailwind CSS Setup + Root Page

**Prompt:**
> "add a root route that has two links to the register or login pages"
> "style the page with tailwind"

**What AI did:**
- Installed `tailwindcss` and `@tailwindcss/vite`
- Added Tailwind plugin to `vite.config.ts`
- Replaced `index.css` content with `@import "tailwindcss"` (v4 setup — no config file needed)
- Created `src/pages/RootPage.tsx` at `/` with links to `/login` and `/register`, styled with Tailwind utilities

---

### 31. shadcn/ui Setup

**Prompt:**
> "let's setup shadcn and its comps then we will build the login and register pages"

**What AI did:**
- Ran `pnpm dlx shadcn@4.10.0 init` — selected Radix + Nova preset
- Added `@/*` path alias to both `tsconfig.json` and `tsconfig.app.json`, and wired it in `vite.config.ts` via `path.resolve`
- Installed `class-variance-authority`, `clsx`, `tailwind-merge` as peer deps
- Created `src/lib/utils.ts` with the `cn()` helper
- Added `button`, `card`, `input`, `label` components via `shadcn add`
- Updated `RootPage.tsx` to use `<Button asChild>` wrapping `<Link>` for the nav buttons

---

### 32. Register Page

**Prompt:**
> "let's create the register page, we will be using react hook form, zod for validation and hook form resolvers with zod"

**What AI did:**
- Created `src/features/auth/schemas/register.schema.ts` with Zod schema matching backend validation (name min 3, email, password min 8 with letter+number+special char)
- Added `RegisterRequest` and `AuthResponse` types to `auth.types.ts`
- Added `register` method to `authService` posting to `/auth/register`
- Added `REGISTER` and `LOGIN` endpoints to `auth.constants.ts`
- Built `RegisterPage.tsx` using `Card`, `Input`, `Label`, `Button` from shadcn — no shadcn form component, wired react-hook-form directly with `register()` and inline error messages

**My decisions:**
- Schemas live in `features/auth/schemas/` — keeps validation logic separate from types
- Used react-hook-form's `register()` directly instead of the shadcn `Form` wrapper for simplicity
- `AuthResponse` has no `accessToken` — backend sets cookie, no token in response body needed on the frontend

---

### 33. Register Page Refactor — Separation of Concerns

**Prompt:**
> "the main refactor is for the page to be separated to a hook that has the logic of the form and a form comp that is dumb and doesn't know the logic and both will be merged through the page"

**What AI did:**
- Extracted form logic into `features/auth/hooks/useRegisterForm.ts` — owns `useForm`, `onSubmit`, navigation, and store update
- Created `features/auth/components/RegisterForm.tsx` — purely presentational, receives `register`, `onSubmit`, `errors`, `isSubmitting` as props
- `RegisterPage.tsx` is now a thin composer that calls the hook and passes props to the form

**My decision:**
- This pattern (hook + dumb component + page composer) will be the standard for all auth pages going forward

---

### 34. PasswordInput Component

**Prompt:**
> "setup the password input comp — should have a state to show and hide the password, the toggle will be a button using a lucide icon"

**What AI did:**
- Created `features/auth/components/PasswordInput.tsx` — wraps shadcn `Input` with a toggle button using `Eye` / `EyeOff` from lucide-react
- Internal `show` state controls `type="text"` vs `type="password"`
- Toggle button uses `variant="ghost"` positioned absolutely inside a relative wrapper, `tabIndex={-1}` so it doesn't interrupt form tab flow
- Replaced the plain `Input` in `RegisterForm.tsx` with `PasswordInput`

---

### 35. Sonner Toast Notifications

**Prompt:**
> "let's setup sonner for feedback for the user"

**What AI did:**
- I installed `sonner`
- Added `<Toaster richColors position="top-center" />` to `providers.tsx`
- Added `toast.success` / `toast.error` calls in `useRegisterForm.ts` — success navigates to profile, error shows on API failure

---

### 36. Login Page

**Prompt:**
> "do the same for the login page"

**What AI did:**
- Created `features/auth/schemas/login.schema.ts` — Zod schema with email and password (min 1)
- Added `LoginRequest` type to `auth.types.ts`
- Added `login` method to `authService` posting to `/auth/login`
- Created `features/auth/hooks/useLoginForm.ts` — same pattern as register, calls `authService.login`, sets user in store, navigates to `/profile`, shows `toast.success` / `toast.error`
- Created `features/auth/components/LoginForm.tsx` — dumb form component with email + `PasswordInput`, link to `/register`
- Updated `LoginPage.tsx` to compose hook + form component

---

### 37. Route Guards + Auth Hydration

**Prompt:**
> "let's build route guards — AuthGuard stops logged-in users from going into login/register, ProtectedGuard requires login to view"

**What AI did:**
- Created `src/components/guards/AuthGuard.tsx` — redirects to `/profile` if already authenticated, renders `<Outlet />` otherwise
- Created `src/components/guards/ProtectedGuard.tsx` — redirects to `/login` if not authenticated, renders `<Outlet />` otherwise
- Both guards return `null` while `isUserLoading` is true to avoid flashing the wrong page before auth state is known
- Guards live inside `auth.routes.tsx` so each feature owns its own route config including guard wrapping — `router.tsx` stays clean and just spreads `authRoutes`
- Created `src/components/layouts/RootLayout.tsx` — calls `useAuthInit()` so the `/users/me` check fires on every page load and hydrates the auth store before guards evaluate
- Wrapped all routes under `RootLayout` in `router.tsx` with `HydrateFallback: () => null` to suppress the React Router hydration warning

**My decision:**
- Guards go inside the feature's route file, not in the root router — keeps route + guard co-located per feature

---

### 38. Logout Endpoint (Backend)

**Prompt:**
> "let's create the logout endpoint in the backend"

**Why:** HttpOnly cookies can't be cleared from the client — the backend must call `res.clearCookie()`.

**What AI did:**
- Added `POST /auth/logout` to `AuthController` — protected by `JwtGuard`, calls `res.clearCookie(ACCESS_TOKEN_COOKIE)`, returns 204
- No service method needed — logout is purely a cookie concern
- Created `logout.docs.ts` following the same Swagger decorator pattern as login/register

---

### 39. Profile Page

**Prompt:**
> "let's update the profile page by showing the user info and a logout button"

**What AI did:**
- Added `LOGOUT` endpoint to `auth.constants.ts`
- Added `logout()` method to `authService` — posts to `/auth/logout`
- Built `ProfilePage.tsx` — reads `user` from Zustand store, displays name and email, logout button calls `authService.logout()`, clears store, shows `toast.success`, redirects to `/login`
- Logout button styled with `bg-red-800`
- Refactored: extracted logout logic into `useLogout.ts` hook and UI into `ProfileCard.tsx` — `ProfilePage.tsx` is now a thin composer following the same hook + dumb component pattern as register/login

---

### 40. Root Page Auth-Aware UI

**Prompt:**
> "in the root page let's check if user is authenticated, say hello {name}, and route to profile instead of auth pages"

**What AI did:**
- `RootPage.tsx` reads `isAuthenticated` and `user` from Zustand store
- When authenticated: shows "Hello, {name}" and a single "Go to Profile" button
- When not authenticated: shows original "Welcome" heading with Login + Register buttons

---

### 41. Specific API Error Messages

**Prompt:**
> "the error handling for the login and register is too generic"

**What AI did:**
- Created `src/lib/api/api.errors.ts` with `getApiErrorMessage(error, messages, fallback)` — reads `error.response.status` from axios errors and maps to a specific message
- `useRegisterForm`: `400` → invalid details, `409` → email already exists, `429` → rate limited
- `useLoginForm`: `400` → invalid details, `401` → invalid email or password, `429` → rate limited

