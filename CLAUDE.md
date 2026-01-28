# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code training/exercise repository with three main modules for learning test automation, security hooks, and debugging techniques.

## Structure

```
├── part-5-task-management-api/   # QA & Regression Testing Demo
├── part-6-security-hook/         # Hook demo with security review
└── part-7-smart-debuging/        # Debugging exercises (easy/medium/hard/security)
```

## Part 5: Task Management API

TypeScript/Express/Prisma API for teaching test automation with Playwright.

### Commands
```bash
cd part-5-task-management-api
npm run dev                 # Start server on port 4000
npm run test                # Run all 82 tests
npm run test:smoke          # Critical path tests (8)
npm run test:sanity         # Main feature tests (20)
npm run test:regression     # Edge case tests (54)
npx playwright test tests/smoke/auth.smoke.spec.ts  # Single file
npx playwright test --grep "can create"             # Pattern match
```

### Database
```bash
npx prisma generate         # Generate client
npx prisma db push          # Push schema
npx prisma db push --force-reset  # Reset database
```

### Architecture
Request → Route → Middleware (auth/validate) → Controller → Service → Prisma → Response

### Test Tiers
- **Smoke** (`*.smoke.spec.ts`) - Run every deploy
- **Sanity** (`*.sanity.spec.ts`) - Run after merge
- **Regression** (`regression/**/*.spec.ts`) - Run nightly

### Test Utilities (`tests/setup/test-utils.ts`)
- `registerUser(request)` - Creates unique user, returns token
- `createTask(request, token, data)` - Creates task
- `authHeader(token)` - Returns auth header object

## Part 6: Security Hook

Demonstrates Claude Code hooks with automatic security review reminders.

### Security Review Command
Run `/security-review` when editing security-sensitive files (auth, password, token, secret, credential, jwt, session, cookie, api.key, encryption, hash, login, register).

When the hook displays "SECURITY-SENSITIVE FILE MODIFIED" warning, automatically run `/security-review` on that file.

## Part 7: Debugging Exercises

Hands-on debugging practice with intentional bugs.

### Running Exercises
```bash
cd part-7-smart-debuging/easy/01-pagination-bug
npm install
npm test    # See failure, then debug with Claude
```

### Difficulty Levels
- **Easy** - Single file, clear symptoms
- **Medium** - Async/timing, multi-file
- **Hard** - Performance, race conditions, memory leaks
- **Security** - OWASP vulnerabilities (SQL injection, auth bypass, data exposure)

## TypeScript

Never use `type any` - use proper types from Prisma or define interfaces.
