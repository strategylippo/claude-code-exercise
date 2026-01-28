# Exercise: Mass Assignment Vulnerability

## Difficulty: Medium
## OWASP: A06 - Mass Assignment

## Scenario

The API accepts and processes all fields from client requests without proper filtering, allowing attackers to modify protected fields.

### Vulnerability Report
```
Title: Mass Assignment in User Update Endpoint
Severity: HIGH
CVSS Score: 8.1

Attack Vector:
POST /api/users/update
Body: { "name": "John", "role": "admin", "isVerified": true }

Impact:
- Privilege escalation (user → admin)
- Bypass email verification
- Modify protected account settings
- Change ownership of resources
```

## Your Task

1. Run `/security-review` on this exercise
2. Identify mass assignment vulnerabilities
3. Implement proper field filtering/whitelisting
4. Verify with `/security-review` again

## Files to Examine

- `src/controllers/user.controller.ts` - Update endpoint
- `src/services/user.service.ts` - User update logic

## Hints

<details>
<summary>Hint 1</summary>
Never use Object.assign() or spread operators with raw request body
</details>

<details>
<summary>Hint 2</summary>
Create explicit DTOs that only accept allowed fields
</details>

<details>
<summary>Hint 3</summary>
Protected fields: role, isVerified, isAdmin, credits, etc.
</details>
