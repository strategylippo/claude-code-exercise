# Claude Code Debugging Exercises - Participant Version

## Overview

Practice debugging with Claude Code using these hands-on exercises. Each exercise contains a bug for you to find and fix.

## Exercise Structure

```
debugging-exercises-starter/
├── easy/           # 15-20 minutes each
│   ├── 01-pagination-bug/
│   ├── 02-missing-await/
│   └── 03-wrong-status-code/
├── medium/         # 25-30 minutes each
│   ├── 01-validation-bypass/
│   ├── 02-async-race-condition/
│   └── 03-auth-token-expiry/
├── hard/           # 40-60 minutes each
│   ├── 01-n-plus-one-query/
│   ├── 02-memory-leak/
│   └── 03-deadlock-scenario/
└── security/       # Security-focused bugs
    ├── 01-sql-injection/
    ├── 02-broken-auth/
    ├── 03-sensitive-data/
    ├── 04-mass-assignment/
    └── 05-broken-access-control/
```

## How to Use

### Step 1: Choose an Exercise
Start with `easy/01-pagination-bug/` if you're new to debugging with Claude.

### Step 2: Read the Scenario
```bash
cd easy/01-pagination-bug
cat README.md
```
Each README describes the bug report with symptoms and expected behavior.

### Step 3: Run the Failing Test
```bash
npm install
npm test
```
See the test fail - this confirms the bug exists.

### Step 4: Debug with Claude Code
Ask Claude to help:
```
"The pagination test is failing. Can you analyze the code and find the bug?"
```

Or try these approaches:
| Approach | Example Prompt |
|----------|----------------|
| Direct | "What's wrong with the getTasks function?" |
| Exploratory | "Why might pagination return duplicates?" |
| Plan Mode | "Let's debug this step by step" |

### Step 5: Fix and Verify
- Implement your fix
- Run `npm test` to verify
- All tests should pass!

---

## Difficulty Guide

### Easy (Beginner)
- Single file bugs
- Clear symptoms
- Good for learning Claude debugging basics

### Medium (Intermediate)
- Async/timing issues
- Multi-file problems
- Requires understanding execution flow

### Hard (Advanced)
- Performance problems
- Race conditions
- Memory leaks
- Complex system interactions

### Security
- OWASP-style vulnerabilities
- SQL injection, auth bypass, data exposure
- Good for `/security-review` practice

---

## Claude Code Tips

### Good Debugging Prompts
```
# Describe the symptom
"The API returns duplicate data on page 2. Look at task.service.ts"

# Ask for analysis
"What could cause this test to fail intermittently?"

# Use plan mode for complex bugs
"Enter plan mode to debug this memory leak"

# Request specific checks
"Check for race conditions in this async code"
```

### Debugging Workflow
1. **Understand** - Read the bug report carefully
2. **Reproduce** - Run the failing test
3. **Analyze** - Ask Claude to examine the code
4. **Hypothesize** - Claude suggests possible causes
5. **Fix** - Implement the solution
6. **Verify** - Run tests to confirm

---

## Getting Started

```bash
# Start with the first easy exercise
cd easy/01-pagination-bug
npm install
npm test          # See it fail
# Now use Claude Code to find and fix the bug!
```

---

## Exercise Summary

| Level | Exercise | Bug Type |
|-------|----------|----------|
| Easy | 01-pagination-bug | Logic error |
| Easy | 02-missing-await | Async issue |
| Easy | 03-wrong-status-code | HTTP response |
| Medium | 01-validation-bypass | Input validation |
| Medium | 02-async-race-condition | Race condition |
| Medium | 03-auth-token-expiry | Token handling |
| Hard | 01-n-plus-one-query | Database performance |
| Hard | 02-memory-leak | Memory management |
| Hard | 03-deadlock-scenario | Concurrency |

Good luck and happy debugging!
