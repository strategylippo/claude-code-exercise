# Exercise: Broken Authentication

## Difficulty: Easy
## OWASP: A02 - Broken Authentication

## Scenario

The authentication system has multiple security weaknesses that could allow attackers to gain unauthorized access.

### Vulnerability Report
```
Title: Weak Authentication Implementation
Severity: HIGH
CVSS Score: 7.5

Issues Found:
1. No password complexity requirements
2. No rate limiting on login attempts
3. Weak session token generation
4. Session doesn't expire

Impact:
- Brute force attacks possible
- Credential stuffing
- Session hijacking
```

## Your Task

1. Run `/security-review` on this exercise
2. Identify all authentication weaknesses
3. Fix the vulnerable code
4. Verify with `/security-review` again

## Files to Examine

- `src/services/auth.service.ts` - Authentication logic
- `src/middleware/session.middleware.ts` - Session handling

## Hints

<details>
<summary>Hint 1</summary>
Check how passwords are validated before being accepted
</details>

<details>
<summary>Hint 2</summary>
Look at how session tokens are generated - is there enough entropy?
</details>

<details>
<summary>Hint 3</summary>
Consider adding rate limiting and account lockout
</details>
