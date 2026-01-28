## Project context (for AI + contributors)

### Stack
- Next.js (App Router)
- Tailwind CSS + shadcn/ui
- AWS Bedrock (server-side)
- Neon Postgres + Mikro-ORM
- Deploy: Vercel

### Architectural boundaries (important)
- **UI**: `app/**`, `components/**`
  - shadcn/ui primitives: `components/ui/**`
- **Server Actions (primary backend surface)**: `app/_actions/**`
- **Features (business logic, preferred for readability)**: `lib/features/**`
  - Schemas/types: `lib/features/<feature>/schema.ts`, `types.ts`
  - Use cases: `lib/features/<feature>/use-cases/**`
- **Integrations**: `lib/**`
  - Bedrock client/wrappers: `lib/bedrock/**`
  - DB + Mikro-ORM: `lib/db/**`
  - Env parsing/validation: `lib/env.ts`
  - Shared validation helpers: `lib/validation/**`

### DB style (Mikro-ORM)
- Use **Data Mapper** style (no Active Record).
- Do persistence via `EntityManager` / repositories in `lib/features/<feature>/use-cases/**`.
- Entities may contain **pure** methods (no DB/network/EM).

### Security rules
- Never expose secrets to the client:
  - `DATABASE_URL`, AWS credentials, Bedrock model IDs should remain server-only.
- Bedrock + DB code must run on the server (Node runtime). Avoid Edge for these integrations.

### Deployment rules (Vercel)
- Configure environment variables in Vercel Project Settings.
- Do not run migrations during web requests. Use a separate migration workflow.

### Conventions
- Prefer Server Components by default.
- Prefer Server Actions for mutations / orchestrating “Bedrock + DB” work.
- Use API routes only when you truly need HTTP endpoints (webhooks/external clients).
- Keep Server Actions thin: validate → call use-case → return typed result.

### Quality guardrails
- Prefer **guard clauses** (early returns) for validation/authorization/invariants.
- Prefer `unknown` over `any`. Explicit `any` is disallowed by lint.
- When rethrowing/wrapping errors, include a **cause** (e.g. `new Error(msg, { cause })`) or use `AppError`.
- Prefer descriptive generic names in TypeScript (avoid `T`, `E` in non-trivial code).
- Avoid “god files”: keep files small and focused. Split large logic into feature modules, schemas/types, and use-cases.
- Null-safety: `null` = absent (domain/DB). `""` = UI-only empty string. Normalize optional strings (trim, then empty → `null`) at boundaries.
- Readability: use whitespace/proximity intentionally—group related lines, and separate different concerns with a single blank line.

