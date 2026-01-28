# Exercise: Broken Object Level Authorization (BOLA)

## Difficulty: Hard
## OWASP: A01 - Broken Object Level Authorization

## Scenario

The API endpoints don't properly verify that the authenticated user has permission to access or modify the requested resources.

### Vulnerability Report
```
Title: IDOR/BOLA in Multiple Endpoints
Severity: CRITICAL
CVSS Score: 9.1

Attack Vectors:
1. GET /api/orders/123 - Any user can view any order
2. PUT /api/documents/456 - Any user can edit any document
3. DELETE /api/users/789/data - Any user can delete any user's data

Impact:
- Access other users' private data
- Modify other users' resources
- Delete other users' information
- Complete account takeover possible
```

## Your Task

1. Run `/security-review` on this exercise
2. Identify all BOLA vulnerabilities
3. Implement proper authorization checks
4. Verify with `/security-review` again

## Files to Examine

- `src/controllers/order.controller.ts` - Order access without auth check
- `src/controllers/document.controller.ts` - Document CRUD without ownership
- `src/middleware/auth.middleware.ts` - Authentication (but not authorization)

## Hints

<details>
<summary>Hint 1</summary>
Authentication (who you are) is not the same as authorization (what you can access)
</details>

<details>
<summary>Hint 2</summary>
Every resource access should verify ownership or permissions
</details>

<details>
<summary>Hint 3</summary>
Check if the resource belongs to the requesting user before allowing access
</details>
