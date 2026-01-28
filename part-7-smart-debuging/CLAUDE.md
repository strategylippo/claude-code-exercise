# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Debugging exercises with intentional bugs for practicing debugging with Claude Code. Each exercise is self-contained with its own tests.

## Commands

```bash
# Run tests for any exercise
cd easy/01-pagination-bug  # (or any exercise directory)
npm install
npm test                   # Run tests (vitest run)
npm run test:watch         # Watch mode
```

All exercises use Vitest with TypeScript. Tests are in `tests/*.spec.ts` files.

## Exercise Structure

Each exercise contains:
- `src/` - Code with intentional bug(s)
- `tests/*.spec.ts` - Failing test(s) that expose the bug
- `README.md` - Bug report describing symptoms and expected behavior

## Difficulty Levels

| Level | Exercises | Bug Patterns |
|-------|-----------|--------------|
| easy/ | 01-pagination-bug, 02-missing-await, 03-wrong-status-code | Single file, logic errors, missing async |
| medium/ | 01-validation-bypass, 02-async-race-condition, 03-auth-token-expiry | Type confusion, race conditions, timing |
| hard/ | 01-n-plus-one-query, 02-memory-leak, 03-deadlock-scenario | Performance, resource leaks, concurrency |
| security/ | 01-sql-injection, 02-broken-auth, 03-sensitive-data, 04-mass-assignment, 05-broken-access-control | OWASP API vulnerabilities |

## Debugging Workflow

1. Read the exercise README for bug symptoms
2. Run `npm test` to see the failure
3. Ask Claude to analyze the code and find the bug
4. Implement the fix
5. Run `npm test` to verify

## Security Exercises

Use `/security-review` on security exercises to practice identifying OWASP vulnerabilities. These exercises don't have test files - use security review to find issues.

## TypeScript

Never use `type any` - define proper interfaces for all types.
