# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QA & Regression Testing Demo - A Task Management API built with TypeScript, Express, Prisma (SQLite), and Playwright for teaching test automation concepts.

## Commands

### Development
```bash
npm run dev                 # Start server on port 4000
npm run build               # Compile TypeScript
```

### Database
```bash
npx prisma generate         # Generate Prisma client
npx prisma db push          # Push schema to database
npx prisma db push --force-reset  # Reset database
```

### Testing
```bash
npm run test                # Run all 82 tests
npm run test:smoke          # Run smoke tests (8 tests, critical path)
npm run test:sanity         # Run sanity tests (20 tests, main features)
npm run test:regression     # Run regression tests (54 tests, edge cases)
npx playwright test tests/smoke/auth.smoke.spec.ts  # Run single test file
npx playwright test --grep "can create"             # Run tests matching pattern
```

## Architecture

### API Layer (src/)
- **Routes** (`routes/`) → Define endpoints, apply middleware
- **Controllers** (`controllers/`) → Handle requests, call services
- **Services** (`services/`) → Business logic, database operations
- **Schemas** (`schemas/`) → Zod validation schemas
- **Middleware** (`middleware/`) → Auth (JWT), error handling, validation

### Request Flow
```
Request → Route → Middleware (auth/validate) → Controller → Service → Prisma → Response
```

### Test Architecture (tests/)

Three-tier test organization by purpose and frequency:

| Tier | Pattern | Purpose |
|------|---------|---------|
| Smoke | `*.smoke.spec.ts` | API alive? Auth works? Run every deploy |
| Sanity | `*.sanity.spec.ts` | Main features work? Run after merge |
| Regression | `regression/**/*.spec.ts` | All edge cases? Run nightly |

### Test Utilities (tests/setup/test-utils.ts)

Key helpers for test isolation:
- `registerUser(request)` - Creates unique user, returns token
- `createTask(request, token, data)` - Creates task
- `listTasks(request, token, filters)` - Lists with filters
- `authHeader(token)` - Returns `{ Authorization: 'Bearer ...' }`
- `generateTestEmail()` - Unique email for each test

### Writing Tests

Each test should create its own user for isolation:
```typescript
test.beforeEach(async ({ request }) => {
  user = await registerUser(request);
});
```

## Key Files

- `prisma/schema.prisma` - User and Task models
- `playwright.config.ts` - Three projects (smoke, sanity, regression), auto-starts server
- `tests/setup/test-utils.ts` - All test helper functions
- `tests/fixtures/test-data.ts` - Test data factories and edge case data

## TypeScript

Never use `type any` - use proper types from Prisma or define interfaces.
