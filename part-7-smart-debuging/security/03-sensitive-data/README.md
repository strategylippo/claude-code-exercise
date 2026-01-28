# Exercise: Excessive Data Exposure

## Difficulty: Medium
## OWASP: A03 - Excessive Data Exposure

## Scenario

API endpoints are returning more data than necessary, exposing sensitive user information that clients don't need.

### Vulnerability Report
```
Title: Sensitive Data Exposure in API Responses
Severity: MEDIUM
CVSS Score: 6.5

Issues Found:
1. Password hashes exposed in user responses
2. Internal system fields returned to clients
3. Full user objects returned instead of DTOs
4. Sensitive fields in error messages

Impact:
- Information disclosure
- Password hash exposure
- Internal architecture revealed
```

## Your Task

1. Run `/security-review` on this exercise
2. Identify all instances of sensitive data exposure
3. Implement proper data transfer objects (DTOs)
4. Verify with `/security-review` again

## Files to Examine

- `src/controllers/user.controller.ts` - API response handling
- `src/services/user.service.ts` - User data retrieval

## Hints

<details>
<summary>Hint 1</summary>
Never return database entities directly - create DTOs
</details>

<details>
<summary>Hint 2</summary>
Check what fields are included in API responses
</details>

<details>
<summary>Hint 3</summary>
Error messages should not reveal internal details
</details>
