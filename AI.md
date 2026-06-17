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

*This file will be updated incrementally as each module is completed.*
