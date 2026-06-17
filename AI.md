# AI Usage Documentation

This file documents how AI assistance (Claude) was used throughout the development of this project, as required by the task submission guidelines.

---

## Approach

AI was used as a force multiplier — handling scaffolding, boilerplate, and structure decisions quickly, while I maintained ownership of the architecture, reviewed every output, and made the final calls on approach and implementation details.

---

## Key Prompts & Decisions

### 1. Initial Planning & Task Breakdown

**Prompt (paraphrased):**
> "We will be building an auth flow (frontend/backend). Here is the task description. Read it, understand what we're building. It's an evaluation task for an interview process. We will build it step by step."

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

**Prompt (paraphrased):**
> "Here is the order of subtasks I designed — we will follow this. Don't jump to final conclusions of each module/step."

**Defined build order:**
1. Init NestJS app
2. `.env` + ConfigModule
3. Logger setup
4. Database connection + verify it connects
5. Health check
6. Swagger setup
7. Users module — schema + service only
8. Auth module — register, sign-in, JWT strategy, guard
9. Users controller — `GET /me`
10. CORS config
11. Frontend
12. Tests
13. GitHub Actions CI
14. README
15. AI.md (incremental)

**What AI did:** Accepted the order without reordering or collapsing steps, and committed to not jumping ahead between modules.

---

## What Was AI-Generated vs. What I Directed

| Area | AI role | My role |
|------|---------|---------|
| Task analysis & planning | Identified deliverables and bonus targets | Confirmed scope, set priorities |
| Build order | Accepted and followed my defined sequence | Designed the step-by-step order |
| Code scaffolding | Generated boilerplate per step | Ran commands, reviewed output |
| Architecture decisions | Suggested options with trade-offs | Made all final decisions |

---

### 3. Git Workflow Setup

**Prompt (paraphrased):**
> "Let's do the initial commit. We will be following the conventional commits pattern. For this project we will use 2 branches — main and dev. Because this is a simpler task we will not be going full git flow with feature branches."

**What AI did:**
- Accepted the simplified two-branch model (main + dev)
- Committed to following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format for all commit messages (`feat:`, `fix:`, `chore:`, `docs:`, etc.)

**My decision:**
- No feature branches for this task — overhead isn't worth it for a scoped assessment. Dev branch accumulates work; main receives merges at stable milestones.

---

*This file will be updated incrementally as each module is completed.*
