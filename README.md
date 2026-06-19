# EasyGenerator Authentication Task

A full-stack authentication system built with NestJS and React as part of an EasyGenerator technical assessment. Covers user registration, login, logout, and a protected profile endpoint — using JWT stored in HttpOnly cookies.

---

## Demo

[![Demo Video](https://img.shields.io/badge/Watch%20Demo-Loom-brightgreen?style=for-the-badge&logo=loom)](https://www.loom.com/share/42b1bdff6c5f4fe99769f2b49e5f7c84)

The demo covers: form validation, rate limiting (429 behavior), happy path register → login → profile → logout, and route guard redirects.

> **API Explorer:** Once the backend is running, visit [`http://localhost:3000/docs`](http://localhost:3000/docs) to interact with all endpoints via Swagger UI.

---

## Features

- **User registration** — name, email, password with full validation (min length, complexity rules)
- **User login** — credential verification, JWT issued as HttpOnly cookie
- **User logout** — server-side cookie clearing via protected endpoint
- **Protected profile page** — displays current user info, accessible only when authenticated
- **Auth-aware root page** — greets authenticated users by name, redirects guests to login/register
- **Route guards** — prevents authenticated users from accessing login/register, blocks unauthenticated access to protected routes
- **Auth hydration** — on every page load, the app silently checks session state before rendering any guard-protected route
- **Toast notifications** — success and per-status-code error feedback on all auth actions
- **Password visibility toggle** — show/hide toggle on all password inputs
- **Rate limiting** — per-endpoint throttling to protect against brute-force attacks
- **Swagger docs** — interactive API documentation at `/docs`
- **Structured logging** — JSON logs with Pino, file-based output in production
- **CI pipeline** — GitHub Actions running tests and build on every push

---

## Tech Stack

### Backend

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Framework        | NestJS 11                                         |
| Language         | TypeScript                                        |
| Database         | MongoDB + Mongoose                                |
| Authentication   | JWT via `@nestjs/jwt` — HttpOnly cookies          |
| Password hashing | bcrypt                                            |
| Validation       | class-validator + class-transformer               |
| Rate limiting    | `@nestjs/throttler`                               |
| Security headers | Helmet                                            |
| Logging          | nestjs-pino (structured JSON + pretty dev output) |
| API docs         | Swagger (`@nestjs/swagger`)                       |
| Testing          | Jest + mongodb-memory-server (unit + e2e)         |

### Frontend

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Framework     | React 19 + Vite                       |
| Language      | TypeScript                            |
| Routing       | React Router v7 (lazy-loaded routes)  |
| Auth state    | Zustand                               |
| Server state  | TanStack React Query (auth hydration) |
| HTTP client   | Axios (`withCredentials: true`)       |
| Form handling | react-hook-form + Zod                 |
| UI components | shadcn/ui + Tailwind CSS v4           |
| Notifications | Sonner                                |

---

## Architecture

### Backend

The backend follows a **modular NestJS architecture** with a clear separation between infrastructure (`common/`) and feature modules (`modules/`):

```
backend/src/
├── common/
│   ├── cors/           # CORS config factory
│   ├── database/       # Mongoose connection module
│   ├── logger/         # Global Pino logger module
│   ├── security/       # JWT module, cookie config, JwtGuard
│   ├── swagger/        # Swagger setup
│   ├── throttler/      # Rate limiter config
│   └── types/          # Express Request type augmentation
└── modules/
    ├── auth/           # Register, login, logout — DTOs, service, controller, Swagger docs
    └── users/          # GET /me — entity, repository, service, controller
```

**Key decisions:**

- **Custom repository pattern** — `UserRepository` wraps the Mongoose model, keeping Mongoose out of the service layer and making services independently testable
- **JwtGuard in `common/security/`** — avoids a circular dependency between `AuthModule` (imports `UsersModule`) and `UsersModule` (would need `AuthModule` for the guard)
- **JWT payload stores `{ sub, email, name }`** — `GET /me` returns user data directly from the decoded token with no extra DB query
- **`select: false` on password field** — password is never returned by default; `withPassword: true` option explicitly opts in where needed (login)
- **Global modules** — `ConfigModule`, `LoggerModule`, and `JwtModule` are global so feature modules stay lean
- **Swagger decorators extracted to `docs/` files** — each endpoint has its own `.docs.ts` file using `applyDecorators`, keeping controllers clean

### Frontend

The frontend uses a **feature-based architecture** where all auth concerns live under `features/auth/`:

```
frontend/src/
├── components/
│   ├── guards/         # AuthGuard (blocks logged-in users), ProtectedGuard (requires login)
│   ├── layouts/        # RootLayout — calls useAuthInit on every page load
│   └── ui/             # shadcn components (Button, Card, Input, Label)
├── features/
│   └── auth/
│       ├── components/ # Dumb UI components (LoginForm, RegisterForm, ProfileCard, PasswordInput)
│       ├── hooks/      # useAuthInit, useLoginForm, useRegisterForm, useLogout
│       ├── pages/      # Page composers (LoginPage, RegisterPage, ProfilePage)
│       ├── schemas/    # Zod validation schemas
│       ├── services/   # authService — all API calls via axios
│       ├── store/      # Zustand auth store (user, isAuthenticated, isUserLoading)
│       ├── builders/   # Response-to-model mappers
│       └── types/      # TypeScript interfaces
├── lib/
│   ├── api/            # Axios instance, error message mapper
│   └── utils.ts        # cn() helper
└── pages/
    └── RootPage.tsx    # Auth-aware landing page
```

**Key decisions:**

- **Hook + dumb component + page composer pattern** — every auth page is split into a logic hook (e.g. `useLoginForm`), a presentational component (`LoginForm`), and a thin page composer (`LoginPage`) that wires them together
- **Guards return `null` while loading** — prevents flashing the wrong page before auth state is known after a hard refresh
- **`useAuthInit` in `RootLayout`** — runs `GET /users/me` on every page load via React Query, hydrating the Zustand store before any guard evaluates
- **`withCredentials: true` on the axios instance** — the HttpOnly cookie is sent automatically on every request with no per-call config
- **Specific error messages per HTTP status** — `getApiErrorMessage()` maps status codes to user-friendly messages (401 → "Invalid email or password", 409 → "Email already exists", 429 → "Too many attempts")
- **Lazy-loaded routes** — each page uses `lazy: () => import(...)` with a named `Component` export for automatic code splitting

---

## Security

| Concern          | Implementation                                                  |
| ---------------- | --------------------------------------------------------------- |
| Token storage    | HttpOnly cookie — inaccessible to JavaScript                    |
| Cookie flags     | `Secure` in production, `SameSite: Lax` always                  |
| Password storage | bcrypt with salt rounds                                         |
| Password field   | `select: false` in Mongoose schema — never returned by default  |
| HTTP headers     | Helmet — sets CSP, X-Frame-Options, HSTS, etc.                  |
| Rate limiting    | Register: 3 req/min, Login: 5 req/min, Global: 10 req/min       |
| Input validation | DTO validation on all endpoints (class-validator)               |
| User enumeration | Login returns the same error for wrong email and wrong password |
| CORS             | Restricted to `FRONTEND_URL` env var with `credentials: true`   |

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

> **Swagger UI:** [`http://localhost:3000/docs`](http://localhost:3000/docs) — fully documented with request/response schemas, try-it-out support, and cookie auth wired in.

| Method | Endpoint         | Auth | Description                                                   |
| ------ | ---------------- | :--: | ------------------------------------------------------------- |
| `POST` | `/auth/register` |  —   | Register a new user. Sets `access_token` cookie.              |
| `POST` | `/auth/login`    |  —   | Login with email + password. Sets `access_token` cookie.      |
| `POST` | `/auth/logout`   | JWT  | Clear the `access_token` cookie. Returns 204.                 |
| `GET`  | `/users/me`      | JWT  | Return current user (`id`, `name`, `email`) from JWT payload. |

**Password rules:** min 8 characters, at least one letter, one number, and one special character.

Authentication is cookie-based — the browser sends the `access_token` cookie automatically. No `Authorization` header needed.

---

## Project Setup

### Prerequisites

- Node.js 22
- pnpm 10
- MongoDB (local or cloud)

### Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/easygenerator
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Running Locally

```bash
# Backend (http://localhost:3000)
cd backend
pnpm install
pnpm start:dev

# Frontend (http://localhost:5173)
cd frontend
pnpm install
pnpm dev
```

---

## Testing

```bash
cd backend

pnpm test         # unit tests
pnpm test:e2e     # end-to-end tests (mongodb-memory-server, no real DB needed)
pnpm test:cov     # unit tests with coverage report
```

Test coverage includes:

- `UsersService` — create, duplicate email, password hashing, findByEmail
- `AuthService` — register, login (valid/invalid credentials), JWT payload shape
- `AuthController` — cookie setting, dev/prod response shape, logout cookie clearing
- `UsersController` — `/me` response shape, unauthenticated access
- `JwtGuard` — valid token, missing cookie, tampered JWT
- E2E — full auth flow, cookie security attributes, rate limiting, protected endpoint

---

## Build

```bash
# Backend — compiles TypeScript to dist/
cd backend && pnpm build
pnpm start:prod   # runs dist/main.js

# Frontend — type-checks + Vite build to dist/
cd frontend && pnpm build
```

---

## CI

GitHub Actions runs on every push to `main`/`dev` and on PRs to `main`.

**Backend Tests and Build:**

1. Install dependencies (`--frozen-lockfile`)
2. Run unit tests (`NODE_ENV=test`)
3. Run e2e tests (in-memory MongoDB via `mongodb-memory-server`)
4. Build (`nest build`)

**Frontend Build:**

1. Install dependencies
2. Lint (`eslint`)
3. Build (`tsc -b && vite build`)

---

## AI Usage

This project was built with AI assistance (Claude). Full documentation of every prompt, decision, and correction is in [AI.md](./AI.md) as required by the task guidelines.
