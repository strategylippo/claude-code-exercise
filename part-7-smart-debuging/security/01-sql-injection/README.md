# Exercise: SQL Injection Vulnerability

## Difficulty: Easy
## OWASP: A03 - Injection

## Scenario

The user search endpoint is vulnerable to SQL injection. An attacker can manipulate queries to access unauthorized data or damage the database.

### Vulnerability Report
```
Title: SQL Injection in User Search
Severity: CRITICAL
CVSS Score: 9.8

Attack Vector:
GET /api/users/search?email=admin'--

Impact:
- Data breach (read all user data)
- Authentication bypass
- Data manipulation/deletion
- Potential server compromise
```

## Your Task

1. Run `/security-review` on this exercise
2. Identify the SQL injection vulnerability
3. Fix the vulnerable code
4. Verify with `/security-review` again

## Files to Examine

- `src/repositories/user.repository.ts` - Contains vulnerable query
- `src/controllers/user.controller.ts` - Endpoint handler

## Hints

<details>
<summary>Hint 1</summary>
Look for string concatenation or template literals in SQL queries
</details>

<details>
<summary>Hint 2</summary>
The fix involves using parameterized queries or prepared statements
</details>
