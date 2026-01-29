# Security Exercises (OWASP Top 10)

## Overview

These exercises contain intentional security vulnerabilities based on the OWASP Top 10 for APIs. Use Claude Code's `/security-review` command to find and fix them.

## Exercises

| Exercise | OWASP Category | Difficulty |
|----------|----------------|------------|
| 01-sql-injection | A03: Injection | Easy |
| 02-broken-auth | A02: Broken Authentication | Easy |
| 03-sensitive-data | A03: Excessive Data Exposure | Medium |
| 04-mass-assignment | A06: Mass Assignment | Medium |
| 05-broken-access-control | A01: Broken Object Level Auth | Hard |

## How to Use

### Step 1: Navigate to an Exercise

```bash
cd security/01-sql-injection
```

### Step 2: Run Security Review

```bash
/security-review
```

### Step 3: Review Findings

Claude will identify:
- What the vulnerability is
- Where it's located
- How to fix it

### Step 4: Fix and Verify

Ask Claude to fix the issues:
```
"Fix the SQL injection vulnerability found in the security review"
```

Then run `/security-review` again to verify the fix.

## Learning Objectives

After completing these exercises, you will:
- Recognize common API security vulnerabilities
- Know how to use `/security-review` effectively
- Understand OWASP Top 10 for APIs
- Practice fixing real security issues

## OWASP Top 10 Reference

| # | Vulnerability | Description |
|---|---------------|-------------|
| A01 | Broken Object Level Auth | Missing authorization checks on resources |
| A02 | Broken Authentication | Weak passwords, missing rate limiting |
| A03 | Injection | SQL, NoSQL, command injection |
| A04 | Excessive Data Exposure | Returning sensitive data in responses |
| A05 | Broken Function Level Auth | Missing role checks |
| A06 | Mass Assignment | Accepting unvalidated fields |
| A07 | Security Misconfiguration | Default configs, verbose errors |
| A08 | Lack of Resources/Rate Limiting | No protection against brute force |
| A09 | Improper Asset Management | Undocumented endpoints |
| A10 | Insufficient Logging | Missing audit trails |
