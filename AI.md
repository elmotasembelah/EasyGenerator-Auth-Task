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

_This file will be updated incrementally as each module is completed._
